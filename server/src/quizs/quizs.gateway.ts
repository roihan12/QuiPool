import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { SocketQuizWithAuth } from './quizs.types';
import { AnswerDto, ChatDto, QuestionDto, UserAnswerDto } from './quizs.dtos';
import { QuizsService } from './quizs.service';
import { QuizsGatewayAdminGuard } from './quizs.gateway-admin.guard';
import { WsNotFoundException } from 'src/exceptions/ws-exceptions';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'quizs',
})
export class QuizsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(QuizsGateway.name);
  constructor(private readonly quizsService: QuizsService) {}

  @WebSocketServer() io: Namespace;

  //Gateway initialization
  afterInit(): void {
    this.logger.log('Quiz Gateway initialized');
  }

  async handleConnection(client: SocketQuizWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connectted with userID: ${client.userID}, Quiz: ${client.quizID}, name: ${client.name}`,
    );
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
    if (client.quizID === undefined) {
      this.logger.debug(
        `Invalid pollID for userID: ${client.userID}, Connection terminated.`,
      );
      client.emit('exception', new WsNotFoundException('Invalid quizID')); // Send error message to client
      client.disconnect(); // Terminate connection if pollID is undefined
      return;
    }

    const roomName = client.quizID;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(`userID: ${client.userID} joined room ${roomName}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${connectedClients}`,
    );

    const updatedQuiz = await this.quizsService.addParticipant({
      quizID: client.quizID,
      userID: client.userID,
      name: client.name,
    });

    this.io.to(roomName).emit('quiz_updated', updatedQuiz);
  }

  async handleDisconnect(client: SocketQuizWithAuth) {
    const sockets = this.io.sockets;
    const { quizID, userID } = client;
    const updatedPoll = await this.quizsService.removeQuizParticipant(
      quizID,
      userID,
    );

    const roomName = client.quizID;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(
      `Disconnecting socket: ${client.id} from room: ${roomName}`,
    );
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${clientCount}`,
    );
    if (updatedPoll) {
      this.io.to(roomName).emit('quiz_updated', updatedPoll);
    }
  }

  @SubscribeMessage('submit_user_answer')
  async submitUserAnswer(
    @ConnectedSocket() client: SocketQuizWithAuth,
    @MessageBody('answerUser') answerUser: UserAnswerDto,
  ): Promise<void> {
    this.logger.debug(
      `Attempting anwer for user ${client.userID} in poll ${client.quizID} with answer: ${answerUser}`,
    );

    const updatedQuiz = await this.quizsService.addUserAnswer({
      quizID: client.quizID,
      userID: client.userID,
      userAnswer: {
        answerId: answerUser.answerID,
        questionId: answerUser.questionID,
        timestamp: Date.now(),
      },
    });

    this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('question')
  async addQuestion(
    @MessageBody() question: QuestionDto,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add question for user ${client.userID} with ${question.text} to quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.addQuestion({
      quizID: client.quizID,
      userID: client.userID,
      text: question.text,
    });

    this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('question_answer')
  async addQuestionAnswer(
    @MessageBody() questionAnswer: AnswerDto,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add question answer for user ${client.userID} with ${questionAnswer} to quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.addAnswer({
      quizID: client.quizID,
      questionID: questionAnswer.questionID,
      isCorrect: questionAnswer.isCorrect,
      text: questionAnswer.text,
    });

    this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
  }

  @SubscribeMessage('chat_quiz_message')
  async addChatMessage(
    @MessageBody() chat: ChatDto,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add chat for user ${client.userID} with ${chat.text} to quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.addChat({
      quizID: client.quizID,
      userID: client.userID,
      name: client.name,
      text: chat.text,
    });

    this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('remove_quiz_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant ${id} from quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.removeQuizParticipant(
      client.quizID,
      id,
    );
    if (updatedQuiz) {
      this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
    }
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('remove_question')
  async removeQuestion(
    @MessageBody('id') questionID: string,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove question ${questionID} from quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.removeQuestion(
      client.quizID,
      questionID,
    );
    if (updatedQuiz) {
      this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
    }
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('remove_question_answer')
  async removeQuestionAnser(
    @MessageBody('question_id') questionID: string,
    @MessageBody('answer_id') answerID: string,
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove question answer ${answerID} for question ${questionID} from quiz ${client.quizID}`,
    );

    const updatedQuiz = await this.quizsService.removeAnswer(
      client.quizID,
      questionID,
      answerID,
    );
    if (updatedQuiz) {
      this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
    }
  }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('start_quiz')
  async startQuiz(
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(`Attempting to starting quiz: ${client.quizID}`);
    const updatedQuiz = await this.quizsService.startQuiz(client.quizID);

    this.io.to(client.quizID).emit('quiz_updated', updatedQuiz);
  }

  //   @UseGuards(QuizsGatewayAdminGuard)
  //   @SubscribeMessage('close_quiz')
  //   async closePoll(@ConnectedSocket() client: SocketQuizWithAuth): Promise<void> {
  //     this.logger.debug(`Closing quiz: ${client.quizID} and computing results`);

  //     const updatedQuiz = await this.quizsService.computeResults(client.pollID);

  //     this.io.to(client.pollID).emit('quiz_updated', updatedQuiz);
  //   }

  @UseGuards(QuizsGatewayAdminGuard)
  @SubscribeMessage('cancel_quiz')
  async cancelQuiz(
    @ConnectedSocket() client: SocketQuizWithAuth,
  ): Promise<void> {
    this.logger.debug(`Attempting to cancel quiz with id: ${client.quizID}`);
    await this.quizsService.cancelQuiz(client.quizID);

    this.io.to(client.quizID).emit('quiz_cancelled');
  }
}
