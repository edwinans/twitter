import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TweetsService } from './tweets.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('tweets')
export class TweetsController {
  constructor(private tweetsService: TweetsService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTweetDto) {
    return this.tweetsService.createTweet(req.user.id, dto);
  }

  @Get()
  getFeed(
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 20;
    return this.tweetsService.getFeed(page, limit);
  }
}
