import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QuizsRepository } from './quizs.repository';
import {
  AddAnswerFields,
  AddChatQuizFields,
  AddParticipantQuizFields,
  AddQuestionFields,
  AddQuestionWithAnswerFields,
  CreateQuizFields,
  JoinQuizFields,
  RejoinQuizFields,
  UserAnswerFields,
} from './quizs.types';
import {
  createAnswerID,
  createChatID,
  createQuestionID,
  createQuizID,
  createUserID,
} from 'src/utils/ids';
import { Question, Quiz, QuizResults, UserAnswer } from 'shared';
import calculateResults from './calculateResults';

@Injectable()
export class QuizsService {
  private readonly logger = new Logger(QuizsService.name);

  constructor(
    private readonly quizsRepository: QuizsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createQuiz(fields: CreateQuizFields) {
    const quizID = createQuizID();
    const userID = createUserID();
    this.logger.log(`Creating new quiz: ${JSON.stringify(fields, null, 2)}`);

    const createdQuiz = await this.quizsRepository.createQuiz({
      ...fields,
      userID,
      quizID,
    });

    this.logger.debug(
      `Creating token string for quizID: ${createdQuiz.id} and userID: ${userID}`,
    );

    const signedToken = this.jwtService.sign(
      {
        quizID: createdQuiz.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    this.logger.debug(`Created token: ${signedToken}`);

    return {
      quiz: createdQuiz,
      accessToken: signedToken,
    };
  }

  async joinQuiz(fields: JoinQuizFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching quiz: ${fields.quizID} for user with ID: ${userID}`,
    );

    const joinedQuiz = await this.quizsRepository.getQuiz(fields.quizID);
    this.logger.debug(
      `Creating token string for quizID: ${joinedQuiz.id} and userID: ${userID}`,
    );

    if (!joinedQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    const signedToken = this.jwtService.sign(
      {
        quizID: joinedQuiz.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      quiz: joinedQuiz,
      accessToken: signedToken,
    };
  }

  async rejoinQuiz(fields: RejoinQuizFields) {
    this.logger.debug(
      `Rejoining Quiz with ID: ${fields.quizID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedQuiz = await this.quizsRepository.addQuizParticipant(fields);

    return joinedQuiz;
  }

  async getQuiz(quizID: string): Promise<Quiz> {
    this.logger.debug(`Fetching quiz with ID: ${quizID}`);

    return this.quizsRepository.getQuiz(quizID);
  }

  async addParticipant(fields: AddParticipantQuizFields): Promise<Quiz> {
    this.logger.debug(`Adding participant: ${JSON.stringify(fields, null, 2)}`);
    return this.quizsRepository.addQuizParticipant(fields);
  }

  async removeQuizParticipant(
    quizID: string,
    userID: string,
  ): Promise<Quiz | void> {
    const quiz = await this.quizsRepository.getQuiz(quizID);

    if (!quiz.hasStarted) {
      const updatedQuiz = await this.quizsRepository.removeQuizParticipant(
        quizID,
        userID,
      );
      return updatedQuiz;
    }
  }

  async addQuestion(fields: AddQuestionFields): Promise<Quiz> {
    this.logger.debug(`Adding question: ${JSON.stringify(fields, null, 2)}`);

    // Dapatkan kuis yang akan ditambahkan pertanyaan
    const quiz = await this.quizsRepository.getQuiz(fields.quizID);

    // Periksa apakah jumlah pertanyaan sudah mencapai batas maksimum
    if (Object.keys(quiz.questions).length >= quiz.maxQuestions) {
      throw new BadRequestException('Maximum number of questions reached');
    }

    // Jika belum, tambahkan pertanyaan baru
    const id = createQuestionID();
    return this.quizsRepository.addQuestion({
      quizID: fields.quizID,
      questionID: id,
      question: {
        id,
        text: fields.text,
        userID: fields.userID,
        answers: {},
      },
    });
  }

  async addQuestionWithAnswers(
    fields: AddQuestionWithAnswerFields,
  ): Promise<Quiz> {
    this.logger.debug(`Adding question: ${JSON.stringify(fields, null, 2)}`);

    // Dapatkan kuis yang akan ditambahkan pertanyaan
    const quiz = await this.quizsRepository.getQuiz(fields.quizID);

    // Periksa apakah jumlah pertanyaan sudah mencapai batas maksimum
    if (Object.keys(quiz.questions).length >= quiz.maxQuestions) {
      throw new BadRequestException('Maximum number of questions reached');
    }

    // Jika belum, tambahkan pertanyaan baru
    const id = createQuestionID();
    return this.quizsRepository.addQuestionWithAnswers({
      quizID: fields.quizID,
      questionID: id,
      question: {
        id,
        text: fields.text,
        userID: fields.userID,
        answers: fields.answers.map((answer) => ({
          id: createAnswerID(),
          text: answer.text,
          isCorrect: answer.isCorrect,
        })),
      },
    });
  }

  async removeQuestion(quizID: string, questionID: string): Promise<Quiz> {
    return this.quizsRepository.removeQuestion(quizID, questionID);
  }

  async addAnswer(fields: AddAnswerFields): Promise<Quiz> {
    this.logger.debug(`Adding answer: ${JSON.stringify(fields, null, 2)}`);

    return this.quizsRepository.addAnswer({
      quizID: fields.quizID,
      questionID: fields.questionID,
      answer: {
        id: createAnswerID(),
        text: fields.text,
        isCorrect: fields.isCorrect,
      },
    });
  }

  async removeAnswer(
    quizID: string,
    questionID: string,
    answerID: string,
  ): Promise<Quiz> {
    return this.quizsRepository.removeAnswer(quizID, questionID, answerID);
  }

  async addUserAnswer(fields: UserAnswerFields): Promise<Quiz> {
    const quiz = await this.quizsRepository.getQuiz(fields.quizID);
    this.logger.debug(`Quiz results: ${JSON.stringify(quiz)}`);

    const saveAnswer = await this.quizsRepository.addAnswerUser(fields);

    const results = calculateResults(saveAnswer);
    console.log(results);
    const saveResults = await this.quizsRepository.saveResults(
      fields.quizID,
      results,
    );

    return saveResults;
  }

  async startQuiz(quizID: string): Promise<Quiz> {
    return this.quizsRepository.startQuiz(quizID);
  }
  async cancelQuiz(quizID: string): Promise<void> {
    return this.quizsRepository.deleteQuiz(quizID);
  }

  async addChat(fields: AddChatQuizFields): Promise<Quiz> {
    return this.quizsRepository.addNewChat({
      quizID: fields.quizID,
      chatID: createChatID(),
      chat: {
        userID: fields.userID,
        chat: fields.text,
        name: fields.name,
        timestamp: Date.now(),
      },
    });
  }
}
