import { Controller, Get, Param, Post, Query, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UsersService } from './users.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
  };
}

function parsePageLimit(pageQuery?: string, limitQuery?: string, defaultLimit = 10) {
  return {
    page: Number(pageQuery) || 1,
    limit: Number(limitQuery) || defaultLimit,
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':username/tweets')
  async getUserTweets(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const { page, limit } = parsePageLimit(pageQuery, limitQuery);
    return this.usersService.getUserTweets(req.user.id, username, page, limit);
  }

  @Get(':username/followers')
  async getFollowers(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const { page, limit } = parsePageLimit(pageQuery, limitQuery);
    return this.usersService.getFollowers(req.user.id, username, page, limit);
  }

  @Get(':username/following')
  async getFollowing(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const { page, limit } = parsePageLimit(pageQuery, limitQuery);
    return this.usersService.getFollowing(req.user.id, username, page, limit);
  }

  @Post(':username/follow')
  followUser(@Req() req: RequestWithUser, @Param('username') username: string) {
    return this.usersService.followUser(req.user.id, username);
  }

  @Delete(':username/follow')
  unfollowUser(@Req() req: RequestWithUser, @Param('username') username: string) {
    return this.usersService.unfollowUser(req.user.id, username);
  }
}
