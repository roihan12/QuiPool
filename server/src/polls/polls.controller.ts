import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './polls.dtos';
import { PollsService } from './polls.service';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Post()
  async create(@Body() request: CreatePollDto) {
    Logger.log(request);
    const result = await this.pollsService.createPoll(request);

    return result;
  }

  @Post('join')
  async join(@Body() request: JoinPollDto) {
    Logger.log(request);
    const result = await this.pollsService.joinPoll(request);

    return result;
  }
  @Post('/rejoin')
  async rejoin() {
    const result = await this.pollsService.rejoinPoll({
      name: 'John Doe',
      pollID: '234345',
      userID: '123456',
    });

    return result;
  }
}
