import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  @MinLength(1)
  @MaxLength(280)
  content: string;

  @IsOptional()
  @IsString()
  parentTweetId?: string;
}
