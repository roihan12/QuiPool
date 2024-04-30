import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QuizAuthPayload, SocketQuizWithAuth } from './quizs.types';
import { WsUnauthorizedException } from 'src/exceptions/ws-exceptions';
import { QuizsService } from './quizs.service';

@Injectable()
export class QuizsGatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(QuizsGatewayAdminGuard.name);

  constructor(
    private readonly quizsService: QuizsService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketQuizWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      this.logger.error('No authorization token provided');
      throw new WsUnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<QuizAuthPayload & { sub: string }>(
        token,
      );

      this.logger.debug(`Validating auth token before connection: ${payload}`);

      const { sub, quizID } = payload;

      const poll = await this.quizsService.getQuiz(quizID);

      if (poll.adminID !== sub) {
        throw new WsUnauthorizedException('Admin privilages required');
      }
      return true;
    } catch (error) {
      throw new WsUnauthorizedException('Admin privilages required');
    }
  }
}
