import {
  AddNominationData,
  AddParticipantData,
  AddParticipantRangkingsData,
  CreatePollData,
} from './polls.types';
import {
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IOREDISKEY } from 'src/redis/redis.module';
import { Poll } from 'shared';

@Injectable()
export class PollsRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IOREDISKEY) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('POLL_DURATION');
  }

  async createPoll(fields: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: fields.pollID,
      topic: fields.topic,
      votesPerVoter: fields.votesPerVoter,
      participants: {},
      nominations: {},
      rangkings: {},
      adminID: fields.userID,
      hasStarted: false,
    };

    this.logger.log(
      `Creating new poll: ${JSON.stringify(initialPoll, null, 2)} with TTL: ${
        this.ttl
      }`,
    );

    const key = `polls:${fields.pollID}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, this.ttl],
        ])
        .exec();
      return initialPoll;
    } catch (error) {
      this.logger.error(
        `Failed to add poll: ${JSON.stringify(initialPoll)}\n${error}`,
      );
      throw new InternalServerErrorException(`Failed to add poll`);
    }
  }

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );
      this.logger.verbose(currentPoll);

      if (currentPoll?.hasStarted) {
        throw new BadRequestException(`The Poll has already started`);
      }

      return JSON.parse(currentPoll);
    } catch (error) {
      this.logger.error(`Failed to get poll: ${pollID}\n${error}`);
      throw new InternalServerErrorException();
    }
  }

  async addParticipant(fields: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Attempting to add participant with userID/name: ${fields.userID}/${fields.name} to poll: ${fields.pollID}`,
    );
    const key = `polls:${fields.pollID}`;
    const participantPath = `.participants.${fields.userID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(fields.name),
      );

      return this.getPoll(fields.pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add participant with userID/name: ${fields.userID}/${fields.name} to poll: ${fields.pollID}\n${error}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(
      `Attempting to remove participant with userID/name: ${userID} from poll: ${pollID}`,
    );
    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, participantPath);

      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to remove participant with userID/name: ${userID} from poll: ${pollID}\n${error}`,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  async addNomination({
    pollID,
    nominationID,
    nomination,
  }: AddNominationData): Promise<Poll> {
    this.logger.log(
      `Attempting to add nomination with ID/name: ${nominationID}/${nomination.text} to poll: ${pollID}`,
    );
    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        nominationPath,
        JSON.stringify(nomination),
      );
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add nomination with ID/name: ${nominationID}/${nomination.text} to poll: ${pollID}\n${error}`,
      );
      throw new InternalServerErrorException(`Failed to add nomination`);
    }
  }

  async removeNomination(pollID: string, nominationID: string): Promise<Poll> {
    this.logger.log(
      `Attempting to remove nomination with ID/name: ${nominationID} from poll: ${pollID}`,
    );
    const key = `polls:${pollID}`;
    const nominationPath = `.nominations.${nominationID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, nominationPath);
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to remove nominationID: ${nominationID} from poll: ${pollID}`,
        error,
      );
      throw new InternalServerErrorException('Failed to remove nomination');
    }
  }

  async startPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Attempting to start poll: ${pollID}`);
    const key = `polls:${pollID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        '.hasStarted',
        JSON.stringify(true),
      );
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(`Failed to start poll: ${pollID}\n${error}`);
      throw new InternalServerErrorException('Failed to start poll');
    }
  }

  async addParticipantRangkings({
    pollID,
    userID,
    rangkings,
  }: AddParticipantRangkingsData): Promise<Poll> {
    this.logger.log(
      `Attempting to add participant rangking with userID/name: ${userID} to poll: ${pollID}`,
      rangkings,
    );

    const key = `polls:${pollID}`;
    const rangkingsPath = `.rangkings.${userID}`;
    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        rangkingsPath,
        JSON.stringify(rangkings),
      );
      return this.getPoll(pollID);
    } catch (error) {
      this.logger.error(
        `Failed to add participant rangking to poll: ${pollID}`,
      );
      throw new InternalServerErrorException(
        'Failed to add participant rangking',
      );
    }
  }
}
