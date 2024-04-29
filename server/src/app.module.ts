import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';
import { RedisModule } from './redis/redis.module';
import { QuizsModule } from './quizs/quizs.module';

@Module({
  imports: [ConfigModule.forRoot(), PollsModule, RedisModule, QuizsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
