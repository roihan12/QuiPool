import { Module } from '@nestjs/common';
import { QuizsService } from './quizs.service';
import { QuizsController } from './quizs.controller';
import { ConfigModule } from '@nestjs/config';
import { jwtModule, redisModule } from 'src/utils/modules.config';
import { QuizsRepository } from './quizs.repository';
import { QuizsGateway } from './quizs.gateway';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  providers: [QuizsService, QuizsRepository, QuizsGateway],
  controllers: [QuizsController],
})
export class QuizsModule {}
