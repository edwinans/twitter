import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { buildTweetSelect, mapTweetView, type TweetView } from './tweet-view';

@Injectable()
export class TweetsService {
  constructor(private prisma: PrismaService) {}

  private async getTweetOrThrow(tweetId: string, viewerId: string): Promise<TweetView> {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id: tweetId },
      select: buildTweetSelect(viewerId),
    });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    return mapTweetView(tweet);
  }

  private async ensureTweetExists(tweetId: string) {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { id: true },
    });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }
  }

  async createTweet(userId: string, dto: CreateTweetDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.parentTweetId) {
        const parentTweet = await tx.tweet.findUnique({
          where: { id: dto.parentTweetId },
          select: { id: true },
        });

        if (!parentTweet) {
          throw new NotFoundException('Tweet not found');
        }
      }

      const tweet = await tx.tweet.create({
        data: {
          content: dto.content,
          authorId: userId,
          parentTweetId: dto.parentTweetId,
        },
        select: buildTweetSelect(userId),
      });

      if (dto.parentTweetId) {
        await tx.tweet.update({
          where: { id: dto.parentTweetId },
          data: {
            replyCount: {
              increment: 1,
            },
          },
        });
      }

      return mapTweetView(tweet);
    });
  }

  async getTweetById(viewerId: string, tweetId: string) {
    return this.getTweetOrThrow(tweetId, viewerId);
  }

  async getTweetReplies(viewerId: string, parentTweetId: string, page: number, limit: number) {
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
        select: buildTweetSelect(viewerId),
      }),
    ]);

    return {
      tweets: tweets.map(mapTweetView),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getFeed(viewerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const followingRows = await this.prisma.follow.findMany({
      where: {
        followerId: viewerId,
      },
      select: {
        followingId: true,
      },
    });

    const authorIds = [viewerId, ...followingRows.map((row) => row.followingId)];

    const where: Prisma.TweetWhereInput = {
      parentTweetId: null,
      authorId: {
        in: authorIds,
      },
    };

    const [total, tweets] = await this.prisma.$transaction([
      this.prisma.tweet.count({ where }),
      this.prisma.tweet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: buildTweetSelect(viewerId),
      }),
    ]);

    return {
      tweets: tweets.map(mapTweetView),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async likeTweet(viewerId: string, tweetId: string) {
    await this.ensureTweetExists(tweetId);

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: viewerId,
          tweetId,
        },
      },
    });

    if (!existingLike) {
      await this.prisma.like.create({
        data: {
          userId: viewerId,
          tweetId,
        },
      });
    }

    return this.getTweetById(viewerId, tweetId);
  }

  async unlikeTweet(viewerId: string, tweetId: string) {
    await this.ensureTweetExists(tweetId);

    await this.prisma.like.deleteMany({
      where: {
        userId: viewerId,
        tweetId,
      },
    });

    return this.getTweetById(viewerId, tweetId);
  }


  async deleteTweet(viewerId: string, tweetId: string) {
    await this.prisma.tweet.deleteMany({
      where: {
        authorId: viewerId,
        id: tweetId,
      },
    });
  }
}
