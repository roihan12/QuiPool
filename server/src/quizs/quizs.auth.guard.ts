import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestQuizWithAuth } from './quizs.types';

@Injectable()
export class QuizsAuthGuard implements CanActivate {
  private readonly loggger = new Logger(QuizsAuthGuard.name);
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request: RequestQuizWithAuth = context.switchToHttp().getRequest();
    this.loggger.log(
      `Checking for auth token on request body: ${JSON.stringify(
        request.body,
      )}`,
    );
    const { accessToken } = request.body;
    try {
      const decoded = this.jwtService.verify(accessToken);
      this.loggger.log(`Decoded: ${JSON.stringify(decoded)}`);
      //append user and poll to socket
      request.userID = decoded.sub;
      request.quizID = decoded.quizID;
      request.name = decoded.name;
      return true;
    } catch {
      throw new ForbiddenException('Invalid  authorization token');
    }
  }
}
