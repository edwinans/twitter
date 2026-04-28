import { Injectable, NotFoundException } from '@nestjs/common';
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

  private async getTweetOrThrow(tweetId: string) {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id: tweetId },
      select: tweetSelect,
    });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    return tweet;
  }

  async createTweet(userId: string, dto: CreateTweetDto) {
    if (dto.parentTweetId) {
      await this.getTweetOrThrow(dto.parentTweetId);
    }

    return this.prisma.tweet.create({
      data: {
        content: dto.content,
        authorId: userId,
        parentTweetId: dto.parentTweetId,
      },
      select: tweetSelect,
    });
  }

  async getTweetById(tweetId: string) {
    return this.getTweetOrThrow(tweetId);
  }

  async getTweetReplies(page: number, limit: number, parentTweetId: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.TweetWhereInput = {
      parentTweetId,
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
      tweets,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.TweetWhereInput = {
      parentTweetId: null,
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
      tweets,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
