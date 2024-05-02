import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IOREDISKEY } from 'src/redis/redis.module';
import { AddQuizChatData, Quiz, QuizResult } from 'shared';
import {
  AddAnswerData,
  AddQuestionData,
  AddQuizParticipantData,
  CreateQuizData,
  UserAnswerData,
} from './quizs.types';

@Injectable()
export class QuizsRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(QuizsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IOREDISKEY) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('QUIZ_DURATION');
  }

  async createQuiz(fields: CreateQuizData): Promise<Quiz> {
    const initialQuiz = {
      id: fields.quizID,
      topic: fields.topic,
      maxParticipants: fields.maxParticipants,
      maxQuestions: fields.maxQuestions,
      participants: {},
      adminID: fields.userID,
      description: fields.description,
      questions: {},
      chats: {},
      results: [],
      userAnswers: {},
      hasStarted: false,
    };

    this.logger.log(
      `Creating new quiz: ${JSON.stringify(initialQuiz, null, 2)} with TTL: ${
        this.ttl
      }`,
    );

    const key = `quizs:${fields.quizID}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialQuiz)],
          ['expire', key, this.ttl],
        ])
        .exec();
      return initialQuiz;
    } catch (error) {
      this.logger.error(
        `Failed to add quiz: ${JSON.stringify(initialQuiz)}\n${error}`,
      );
      throw new InternalServerErrorException(`Failed to add quiz`);
    }
  }

  async getQuiz(quizID: string): Promise<Quiz> {
    this.logger.log(`Attempting to get quiz: ${quizID}`);

    const key = `quizs:${quizID}`;

    try {
      const currentQuiz = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      this.logger.verbose(currentQuiz);
      return JSON.parse(currentQuiz);
    } catch (error) {
      this.logger.error(`Failed to get quiz: ${quizID}\n${error}`);
      throw new InternalServerErrorException(`Failed to get quiz`);
    }
  }

  async addQuizParticipant(fields: AddQuizParticipantData): Promise<Quiz> {
    this.logger.log(
      `Attempting to add quiz participant with userID/name: ${fields.userID}/${fields.name} to quiz: ${fields.quizID}`,
    );

    const key = `quizs:${fields.quizID}`;
    const quizParticipantPath = `.participants.${fields.userID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        quizParticipantPath,
        JSON.stringify(fields.name),
      );

      return this.getQuiz(fields.quizID);
    } catch (error) {
      this.logger.error(
        `Failed to add quiz participant with userID/name: ${fields.userID}/${fields.name} to quiz: ${fields.quizID}\n${error}`,
      );

      throw new InternalServerErrorException(`Failed to add quiz participant`);
    }
  }

  async removeQuizParticipant(quizID: string, userID: string): Promise<Quiz> {
    this.logger.log(
      `Attempting to remove quiz participant with userID/name: ${userID} from quiz: ${quizID}`,
    );

    const key = `quizs:${quizID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, participantPath);

      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(
        `Failed to remove quiz participant with userID/name: ${userID} from quiz: ${quizID}\n${error}`,
      );
      throw new InternalServerErrorException(
        'Failed to remove quiz participant',
      );
    }
  }

  async addQuestion(fields: AddQuestionData): Promise<Quiz> {
    this.logger.log(
      `Attempting to add question with ID/name: ${fields.questionID}/${fields.question.text} to quiz: ${fields.quizID}`,
    );

    const key = `quizs:${fields.quizID}`;
    const questionPath = `.questions.${fields.questionID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        questionPath,
        JSON.stringify(fields.question),
      );
      return this.getQuiz(fields.quizID);
    } catch (error) {
      this.logger.error(`Failed to add question to quiz: ${fields.quizID}`);
      throw new InternalServerErrorException('Failed to add question');
    }
  }

  async removeQuestion(quizID: string, questionID: string): Promise<Quiz> {
    this.logger.log(
      `Attempting to remove question with ID/name: ${questionID} from quiz: ${quizID}`,
    );
    const key = `quizs:${quizID}`;
    const questionPath = `.questions.${questionID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, questionPath);
      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(
        `Failed to remove question with ID/name: ${questionID} from quiz: ${quizID}\n${error}`,
      );
      throw new InternalServerErrorException('Failed to remove question');
    }
  }

  async addAnswer(fields: AddAnswerData): Promise<Quiz> {
    this.logger.log(
      `Attempting to add answer with ID/name: ${fields.answer.id}/${fields.answer.text} to quiz: ${fields.quizID}`,
      fields,
    );

    const key = `quizs:${fields.quizID}`;
    const answerPath = `questions.${fields.questionID}.answers.${fields.answer.id}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        answerPath,
        JSON.stringify(fields.answer),
      );
      return this.getQuiz(fields.quizID);
    } catch (error) {
      this.logger.error(
        `Failed to add answer to question with ID: ${fields.questionID} to quiz: ${fields.quizID}`,
      );
      throw new InternalServerErrorException('Failed to add question');
    }
  }

  async removeAnswer(
    quizID: string,
    questionID: string,
    answerID: string,
  ): Promise<Quiz> {
    this.logger.log(
      `Attempting to remove answer with ID/name: ${answerID} from question with ID/name: ${questionID} from quiz: ${quizID}`,
    );
    const key = `quizs:${quizID}`;
    const answerPath = `questions.${questionID}.answers.${answerID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, answerPath);
      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(
        `Failed to remove answer with ID/name: ${answerID} from question with ID/name: ${questionID} from quiz: ${quizID}\n${error}`,
      );
      throw new InternalServerErrorException(
        'Failed to remove answer from question',
      );
    }
  }

  async addAnswerUser(fields: UserAnswerData): Promise<Quiz> {
    this.logger.log(
      `Attempting to add user answer with ID/name: ${fields.userID}/${fields.userAnswer} to quiz: ${fields.quizID}`,
      fields,
    );
    const key = `quizs:${fields.quizID}`;
    const answerPath = `.userAnswers.${fields.userID}`;
    const checkAnswerPath = `.userAnswers`;
    const userID = fields.userID;

    try {
      // Dapatkan userAnswers dari Redis
      const existingUserAnswers = await this.redisClient.send_command(
        'JSON.GET',
        key,
        checkAnswerPath,
      );
      let userAnswers = {};

      // Parse existingUserAnswers jika ada
      if (existingUserAnswers) {
        userAnswers = JSON.parse(existingUserAnswers);
      }

      // Periksa apakah questionId dan answerId sudah ada dalam userAnswers
      const userAnswerExists = userAnswers[userID]?.some(
        (answer) =>
          answer.questionId === fields.userAnswer.questionId &&
          answer.answerId === fields.userAnswer.answerId,
      );

      // Jika belum ada, tambahkan userAnswer ke userAnswers
      if (!userAnswerExists) {
        if (!userAnswers[userID]) {
          // Jika userID tidak ada, set nilai baru menggunakan JSON.SET
          userAnswers[userID] = [fields.userAnswer];
        } else {
          // Jika userID sudah ada, gunakan JSON.ARRAPPEND
          userAnswers[userID].push(fields.userAnswer);
        }

        // Simpan perubahan ke Redis
        await this.redisClient.send_command(
          'JSON.SET',
          key,
          checkAnswerPath,
          JSON.stringify(userAnswers),
        );
      }

      return this.getQuiz(fields.quizID);
    } catch (error) {
      this.logger.error(
        `Failed to add user answer to quiz: ${fields.quizID}\n${error}`,
      );
      throw new InternalServerErrorException('Failed to add user answer');
    }
  }

  async deleteQuiz(quizID: string): Promise<void> {
    this.logger.log(`Attempting to delete quiz: ${quizID}`);
    const key = `quizs:${quizID}`;
    try {
      await this.redisClient.send_command('JSON.DEL', key);
    } catch (error) {
      this.logger.error(`Failed to delete quiz: ${quizID}`);
      throw new InternalServerErrorException('Failed to delete quiz');
    }
  }

  async addNewChat({ quizID, chatID, chat }: AddQuizChatData): Promise<Quiz> {
    this.logger.log(
      `Attempting to add chat with ID: ${chatID}/${chat.chat} to quiz: ${quizID}`,
    );
    const key = `quizs:${quizID}`;
    const chatPath = `.chats.${chatID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        chatPath,
        JSON.stringify(chat),
      );
      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(
        `Failed to add chat with ID/name: ${chatID}/${chat.chat} to quiz: ${quizID}\n${error}`,
      );
      throw new InternalServerErrorException(`Failed to add quiz chat`);
    }
  }

  async startQuiz(quizID: string): Promise<Quiz> {
    this.logger.log(`Attempting to start quiz: ${quizID}`);
    const key = `quizs:${quizID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        '.hasStarted',
        JSON.stringify(true),
      );
      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(`Failed to start quiz: ${quizID}\n${error}`);
      throw new InternalServerErrorException('Failed to start quiz');
    }
  }

  async saveResults(quizID: string, results: QuizResult[]): Promise<Quiz> {
    this.logger.log(
      `Attempting to add results to quiz: ${quizID}`,
      JSON.stringify(results),
    );

    const key = `quizs:${quizID}`;
    const resultsPath = '.results';
    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        resultsPath,
        JSON.stringify(results),
      );
      return this.getQuiz(quizID);
    } catch (error) {
      this.logger.error(`Failed to add results to quiz: ${quizID}`);
      throw new InternalServerErrorException('Failed to add quiz results');
    }
  }
}
