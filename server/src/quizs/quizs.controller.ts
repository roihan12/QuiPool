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

import { ApiBody, ApiTags } from '@nestjs/swagger';
import { QuizsService } from './quizs.service';
import { CreateQuizDto, JoinQuizDto, RejoinQuizDto } from './quizs.dtos';
import { QuizsAuthGuard } from './quizs.auth.guard';
import { RequestQuizWithAuth } from './quizs.types';

@ApiTags('Quizs')
@UsePipes(new ValidationPipe())
@Controller('quizs')
export class QuizsController {
  constructor(private quizsService: QuizsService) {}

  @Post()
  async create(@Body() request: CreateQuizDto) {
    Logger.log(request);
    const result = await this.quizsService.createQuiz(request);

    return result;
  }

  @Post('join')
  async join(@Body() request: JoinQuizDto) {
    Logger.log(request);
    const result = await this.quizsService.joinQuiz(request);

    return result;
  }
  @ApiBody({ type: RejoinQuizDto })
  @UseGuards(QuizsAuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() request: RequestQuizWithAuth) {
    const { userID, quizID, name } = request;
    const result = await this.quizsService.rejoinQuiz({
      name,
      quizID,
      userID,
    });

    return result;
  }
}
