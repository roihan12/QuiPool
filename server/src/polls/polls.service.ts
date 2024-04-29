import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  AddChatFields,
  AddNominationFields,
  AddParticipantFields,
  CreatePollFields,
  JoinPollFields,
  RejoinPollFields,
  SubmitRangkingsFields,
} from './polls.types';
import {
  createChatID,
  createNominationID,
  createPollID,
  createUserID,
} from 'src/utils/ids';
import { PollsRepository } from './polls.repository';
import { JwtService } from '@nestjs/jwt';
import { Poll } from 'shared';
import getResults from './getResults';

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

  async addNomination(fields: AddNominationFields): Promise<Poll> {
    return this.pollsRepository.addNomination({
      pollID: fields.pollID,
      nominationID: createNominationID(),
      nomination: {
        userID: fields.userID,
        text: fields.text,
      },
    });
  }

  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    return this.pollsRepository.removeNomination(pollID, nominationID);
  }

  async startPoll(pollID: string): Promise<Poll> {
    return this.pollsRepository.startPoll(pollID);
  }

  async submitRangkings(rangkingData: SubmitRangkingsFields): Promise<Poll> {
    const hasPollStarted = await this.pollsRepository.getPoll(
      rangkingData.pollID,
    );

    if (!hasPollStarted) {
      throw new BadRequestException(
        'Participant cannot rank until the poll has started',
      );
    }

    return this.pollsRepository.addParticipantRangkings(rangkingData);
  }

  async computeResults(pollID: string): Promise<Poll> {
    const poll = await this.pollsRepository.getPoll(pollID);
    this.logger.debug(`Poll results: ${JSON.stringify(poll)}`);

    const results = getResults(
      poll.rangkings,
      poll.nominations,
      poll.votesPerVoter,
    );
    this.logger.debug(`Computed results: ${JSON.stringify(results, null, 2)}`);

    return this.pollsRepository.addResults(pollID, results);
  }

  async cancelPoll(pollID: string): Promise<void> {
    return this.pollsRepository.deletePoll(pollID);
  }

  async addChat(fields: AddChatFields): Promise<Poll> {
    return this.pollsRepository.addNewChat({
      pollID: fields.pollID,
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
