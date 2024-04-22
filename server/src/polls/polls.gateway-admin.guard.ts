import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, SocketWithAuth } from './polls.types';
import { WsUnauthorizedException } from 'src/exceptions/ws-exceptions';

@Injectable()
export class PollsGatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(PollsGatewayAdminGuard.name);

  constructor(
    private readonly pollsService: PollsService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      this.logger.error('No authorization token provided');
      throw new WsUnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
      );

      this.logger.debug(`Validating auth token before connection: ${payload}`);

      const { sub, pollID } = payload;

      const poll = await this.pollsService.getPoll(pollID);

      if (poll.adminID !== sub) {
        throw new WsUnauthorizedException('Admin privilages required');
      }
      return true;
    } catch (error) {
      throw new WsUnauthorizedException('Admin privilages required');
    }
  }
}
