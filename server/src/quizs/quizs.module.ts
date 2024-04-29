import { Module } from '@nestjs/common';
import { QuizsService } from './quizs.service';
import { QuizsController } from './quizs.controller';

@Module({
  providers: [QuizsService],
  controllers: [QuizsController]
})
export class QuizsModule {}
