import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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

  @Delete(':id')
  @HttpCode(204)
  delete(@Req() req: RequestWithUser, @Param('id') tweetId: string) {
    return this.tweetsService.deleteTweet(req.user.id, tweetId);
  }

  @Get(':id/replies')
  getReplies(
    @Req() req: RequestWithUser,
    @Param('id') tweetId: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 20;
    return this.tweetsService.getTweetReplies(req.user.id, tweetId, page, limit);
  }

  @Get(':id')
  getTweet(@Req() req: RequestWithUser, @Param('id') tweetId: string) {
    return this.tweetsService.getTweetById(req.user.id, tweetId);
  }

  @Post(':id/like')
  likeTweet(@Req() req: RequestWithUser, @Param('id') tweetId: string) {
    return this.tweetsService.likeTweet(req.user.id, tweetId);
  }

  @Delete(':id/like')
  unlikeTweet(@Req() req: RequestWithUser, @Param('id') tweetId: string) {
    return this.tweetsService.unlikeTweet(req.user.id, tweetId);
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
