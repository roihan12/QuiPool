import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    minimum: 1,
    maximum: 100,
    example: "What's your favorite color?",
  })
  @IsString()
  @Length(1, 100)
  topic: string;

  @ApiProperty({
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  maxParticipants: number;

  @ApiProperty({
    minimum: 1,
    maximum: 25,
    example: 'John Doe',
  })
  @IsString()
  @Length(1, 25)
  name: string;
}

export class JoinQuizDto {
  @ApiProperty({
    minimum: 6,
    maximum: 6,
    example: '234345',
  })
  @IsString()
  @Length(6, 6)
  quizID: string;

  @ApiProperty({
    minimum: 1,
    maximum: 25,
    example: 'John Doe',
  })
  @IsString()
  @Length(1, 25)
  name: string;
}

export class RejoinQuizDto {
  @ApiProperty({})
  @IsString()
  accessToken: string;
}

export class QuestionDto {
  @IsString()
  @Length(1, 200)
  text: string;
}

export class AnswerDto {
  @ApiProperty({})
  @IsString()
  @Length(8, 8)
  QuestionID: string;

  @ApiProperty({})
  @IsString()
  @Length(1, 100)
  text: string;

  @ApiProperty({})
  @IsBoolean()
  isCorrect: number;
}
