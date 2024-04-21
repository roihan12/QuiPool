import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePollDto, JoinPollDto, RejoinPollDto } from './polls.dtos';
import { PollsService } from './polls.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PollsAuthGuard } from './polls.auth.guard';
import { RequestWithAuth } from './polls.types';

@ApiTags('Polls')
@UsePipes(new ValidationPipe())
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
  @ApiBody({ type: RejoinPollDto })
  @UseGuards(PollsAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    const { userID, pollID, name } = request;
    const result = await this.pollsService.rejoinPoll({
      name,
      pollID,
      userID,
    });

    return result;
  }
}
