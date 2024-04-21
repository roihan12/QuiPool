import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import {
  BadRequestException,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { SocketWithAuth } from './polls.types';
import { WsBadRequestException } from 'src/exceptions/ws-exceptions';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'polls',
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  @WebSocketServer() io: Namespace;

  //Gateway initialization
  afterInit(): void {
    this.logger.log('Gateway initialized');
  }

  handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connectted with userID: ${client.userID}, PollID: ${client.pollID}, name: ${client.name}`,
    );
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
    this.io.emit('hello', `from ${client.id}`);
  }

  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connectted with userID: ${client.userID}, PollID: ${client.pollID}, name: ${client.name}`,
    );
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  @SubscribeMessage('test')
  async test() {
    throw new BadRequestException(['message']);
  }
}
