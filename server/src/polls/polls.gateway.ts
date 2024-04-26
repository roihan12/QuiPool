import {
  ConnectedSocket,
  MessageBody,
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
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { SocketWithAuth } from './polls.types';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { PollsGatewayAdminGuard } from './polls.gateway-admin.guard';
import { NominationDto } from './polls.dtos';
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

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connectted with userID: ${client.userID}, PollID: ${client.pollID}, name: ${client.name}`,
    );
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    const roomName = client.pollID;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(`userID: ${client.userID} joined room ${roomName}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${connectedClients}`,
    );

    const updatedPoll = await this.pollsService.addParticipant({
      pollID: client.pollID,
      userID: client.userID,
      name: client.name,
    });

    this.io.to(roomName).emit('poll_updated', updatedPoll);
  }

  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const { pollID, userID } = client;
    const updatedPoll = await this.pollsService.removeParticipant(
      pollID,
      userID,
    );

    const roomName = client.pollID;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(
      `Disconnecting socket: ${client.id} from room: ${roomName}`,
    );
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${clientCount}`,
    );
    if (updatedPoll) {
      this.io.to(roomName).emit('poll_updated', updatedPoll);
    }
  }

  @SubscribeMessage('submit_rangkings')
  async submitRangkings(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('rangkings') rangkings: string[],
  ): Promise<void> {
    this.logger.debug(
      `Attempting votes for user ${client.userID} in poll ${client.pollID}`,
    );
    const updatedPoll = await this.pollsService.submitRangkings({
      pollID: client.pollID,
      userID: client.userID,
      rangkings,
    });

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @SubscribeMessage('nominate')
  async addNomination(
    @MessageBody() nomination: NominationDto,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add nomination for user ${client.userID} with ${nomination.text} to poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.addNomination({
      pollID: client.pollID,
      userID: client.userID,
      text: nomination.text,
    });

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(PollsGatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant ${id} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.removeParticipant(
      client.pollID,
      id,
    );
    if (updatedPoll) {
      this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
  }

  @UseGuards(PollsGatewayAdminGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody('id') nominationID: string,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove nomination ${nominationID} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollsService.removeNomination(
      client.pollID,
      nominationID,
    );
    if (updatedPoll) {
      this.io.to(client.pollID).emit('poll_updated', updatedPoll);
    }
  }

  @UseGuards(PollsGatewayAdminGuard)
  @SubscribeMessage('start_vote')
  async startPoll(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Attempting to starting poll: ${client.pollID}`);
    const updatedPoll = await this.pollsService.startPoll(client.pollID);

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(PollsGatewayAdminGuard)
  @SubscribeMessage('close_poll')
  async closePoll(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Closing poll: ${client.pollID} and computing results`);

    const updatedPoll = await this.pollsService.computeResults(client.pollID);

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(PollsGatewayAdminGuard)
  @SubscribeMessage('cancel_poll')
  async cancelPoll(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Attempting to cancel poll with id: ${client.pollID}`);
    await this.pollsService.cancelPoll(client.pollID);

    this.io.to(client.pollID).emit('poll_cancelled');
  }
}
