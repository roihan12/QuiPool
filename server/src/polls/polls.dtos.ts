import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreatePollDto {
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
  votesPerVoter: number;

  @ApiProperty({
    minimum: 1,
    maximum: 25,
    example: 'John Doe',
  })
  @IsString()
  @Length(1, 25)
  name: string;
}

export class JoinPollDto {
  @ApiProperty({
    minimum: 6,
    maximum: 6,
    example: '234345',
  })
  @IsString()
  @Length(6, 6)
  pollID: string;

  @ApiProperty({
    minimum: 1,
    maximum: 25,
    example: 'John Doe',
  })
  @IsString()
  @Length(1, 25)
  name: string;
}

export class RejoinPollDto {
  @ApiProperty({})
  @IsString()
  accessToken: string;
}
