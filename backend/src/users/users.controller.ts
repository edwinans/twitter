import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  username: true,
  createdAt: true,
} as const;

const tweetAuthorSelect = {
  id: true,
  username: true,
} as const;

const tweetSelect = {
  id: true,
  content: true,
  parentTweetId: true,
  createdAt: true,
  author: {
    select: tweetAuthorSelect,
  },
} as const;

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get(':username/tweets')
  async getUserTweets(
    @Param('username') username: string,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
  ) {
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 10;
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: Prisma.TweetWhereInput = {
      authorId: user.id,
    };

    const [total, tweets] = await this.prisma.$transaction([
      this.prisma.tweet.count({ where }),
      this.prisma.tweet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: tweetSelect,
      }),
    ]);

    return {
      user,
      tweets,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
