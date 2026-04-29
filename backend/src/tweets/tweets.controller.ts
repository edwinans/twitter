import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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

  @Get(':id/replies')
  getReplies(
    @Param('id') tweetId: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 20;
    return this.tweetsService.getTweetReplies(page, limit, tweetId);
  }

  @Get(':id')
  getTweet(@Param('id') tweetId: string) {
    return this.tweetsService.getTweetById(tweetId);
  }

  @Get()
  getFeed(
    @Req() req: RequestWithUser,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 20;
    return this.tweetsService.getFeed(req.user.id, page, limit);
  }
}
