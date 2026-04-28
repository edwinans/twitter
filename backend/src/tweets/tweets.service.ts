import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTweetDto } from './dto/create-tweet.dto';

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

@Injectable()
export class TweetsService {
  constructor(private prisma: PrismaService) {}

  async createTweet(userId: string, dto: CreateTweetDto) {
    return this.prisma.tweet.create({
      data: {
        content: dto.content,
        authorId: userId,
        parentTweetId: dto.parentTweetId,
      },
      select: tweetSelect,
    });
  }

  async getFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.TweetWhereInput = {};

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
      tweets,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
