import { Injectable, Logger } from '@nestjs/common';
import {
  AddParticipantFields,
  CreatePollFields,
  JoinPollFields,
  RejoinPollFields,
} from './polls.types';
import { createPollID, createUserID } from 'src/utils/ids';
import { PollsRepository } from './polls.repository';
import { JwtService } from '@nestjs/jwt';
import { Poll } from 'shared';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);

  constructor(
    private readonly pollsRepository: PollsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createPoll(fields: CreatePollFields) {
    const pollID = createPollID();
    const userID = createUserID();
    this.logger.log(`Creating new poll: ${JSON.stringify(fields, null, 2)}`);

    const createdPoll = await this.pollsRepository.createPoll({
      ...fields,
      userID,
      pollID,
    });

    this.logger.debug(
      `Creating token string for pollID: ${createdPoll.id} and userID: ${userID}`,
    );

    const signedToken = this.jwtService.sign(
      {
        pollID: createdPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    this.logger.debug(`Created token: ${signedToken}`);

    return {
      poll: createdPoll,
      accessToken: signedToken,
    };
  }
  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();

    this.logger.debug(
      `Fetching poll: ${fields.pollID} for user with ID: ${userID}`,
    );

    const joinedPoll = await this.pollsRepository.getPoll(fields.pollID);
    this.logger.debug(
      `Creating token string for pollID: ${joinedPoll.id} and userID: ${userID}`,
    );
    const signedToken = this.jwtService.sign(
      {
        pollID: joinedPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      poll: joinedPoll,
      accessToken: signedToken,
    };
  }

  async rejoinPoll(fields: RejoinPollFields) {
    this.logger.debug(
      `Rejoining poll with ID: ${fields.pollID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedPoll = await this.pollsRepository.addParticipant(fields);

    return joinedPoll;
  }

  async getPoll(pollID: string): Promise<Poll> {
    return this.pollsRepository.getPoll(pollID);
  }
  async addParticipant(fields: AddParticipantFields): Promise<Poll> {
    return this.pollsRepository.addParticipant(fields);
  }

  async removeParticipant(
    pollID: string,
    userID: string,
  ): Promise<Poll | void> {
    const poll = await this.pollsRepository.getPoll(pollID);

    if (!poll.hasStarted) {
      const updatedPoll = await this.pollsRepository.removeParticipant(
        pollID,
        userID,
      );
      return updatedPoll;
    }
  }
}
