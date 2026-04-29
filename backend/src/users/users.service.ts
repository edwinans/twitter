import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  username: true,
  createdAt: true,
} as const;

const listUserSelect = {
  id: true,
  username: true,
} as const;

export interface ProfileUser {
  id: string;
  username: string;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: listUserSelect,
    });

    return { users };
  }

  private async getUserOrThrow(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async buildProfileUser(viewerId: string, username: string): Promise<ProfileUser> {
    const user = await this.getUserOrThrow(username);

    const [followerCount, followingCount, isFollowing] = await Promise.all([
      this.prisma.follow.count({
        where: { followingId: user.id },
      }),
      this.prisma.follow.count({
        where: { followerId: user.id },
      }),
      user.id === viewerId
        ? Promise.resolve(false)
        : this.prisma.follow
            .findFirst({
              where: {
                followerId: viewerId,
                followingId: user.id,
              },
            })
            .then((follow) => !!follow),
    ]);

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      followerCount,
      followingCount,
      isFollowing,
      isOwnProfile: user.id === viewerId,
    };
  }

  async getUserTweets(viewerId: string, username: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const user = await this.getUserOrThrow(username);
    const profileUser = await this.buildProfileUser(viewerId, username);

    const where: Prisma.TweetWhereInput = {
      authorId: user.id,
      parentTweetId: null,
    };

    const [total, tweets] = await this.prisma.$transaction([
      this.prisma.tweet.count({ where }),
      this.prisma.tweet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          parentTweetId: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return {
      user: profileUser,
      tweets,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private async getFollowList(
    viewerId: string,
    username: string,
    relation: 'followers' | 'following',
    page: number,
    limit: number,
  ) {
    const user = await this.getUserOrThrow(username);
    const skip = (page - 1) * limit;
    const profileUser = await this.buildProfileUser(viewerId, username);

    if (relation === 'followers') {
      const where: Prisma.FollowWhereInput = { followingId: user.id };
      const [total, rows] = await this.prisma.$transaction([
        this.prisma.follow.count({ where }),
        this.prisma.follow.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            follower: {
              select: listUserSelect,
            },
          },
        }),
      ]);

      return {
        user: profileUser,
        users: rows.map((row) => row.follower),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }

    const where: Prisma.FollowWhereInput = { followerId: user.id };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.follow.count({ where }),
      this.prisma.follow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          following: {
            select: listUserSelect,
          },
        },
      }),
    ]);

    return {
      user: profileUser,
      users: rows.map((row) => row.following),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getFollowers(viewerId: string, username: string, page: number, limit: number) {
    return this.getFollowList(viewerId, username, 'followers', page, limit);
  }

  async getFollowing(viewerId: string, username: string, page: number, limit: number) {
    return this.getFollowList(viewerId, username, 'following', page, limit);
  }

  private async setFollowState(viewerId: string, username: string, shouldFollow: boolean) {
    const user = await this.getUserOrThrow(username);

    if (user.id === viewerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    if (shouldFollow) {
      const existingFollow = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: user.id,
        },
      });

      if (!existingFollow) {
        await this.prisma.follow.create({
          data: {
            followerId: viewerId,
            followingId: user.id,
          },
        });
      }
    } else {
      await this.prisma.follow.deleteMany({
        where: {
          followerId: viewerId,
          followingId: user.id,
        },
      });
    }

    return {
      user: await this.buildProfileUser(viewerId, username),
    };
  }

  async followUser(viewerId: string, username: string) {
    return this.setFollowState(viewerId, username, true);
  }

  async unfollowUser(viewerId: string, username: string) {
    return this.setFollowState(viewerId, username, false);
  }
}
