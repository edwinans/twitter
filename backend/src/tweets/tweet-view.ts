import { Prisma } from '@prisma/client';

export const tweetAuthorSelect = {
  id: true,
  username: true,
} as const;

export function buildTweetSelect(viewerId: string) {
  return {
    id: true,
    content: true,
    parentTweetId: true,
    replyCount: true,
    createdAt: true,
    author: {
      select: tweetAuthorSelect,
    },
    _count: {
      select: {
        likes: true,
      },
    },
    likes: {
      where: {
        userId: viewerId,
      },
      select: {
        userId: true,
      },
    },
  } as const;
}

export type TweetViewRecord = Prisma.TweetGetPayload<{
  select: ReturnType<typeof buildTweetSelect>;
}>;

export interface TweetView {
  id: string;
  content: string;
  parentTweetId: string | null;
  replyCount: number;
  createdAt: Date;
  author: {
    id: string;
    username: string;
  };
  likeCount: number;
  viewerLiked: boolean;
}

export function mapTweetView(tweet: TweetViewRecord): TweetView {
  return {
    id: tweet.id,
    content: tweet.content,
    parentTweetId: tweet.parentTweetId,
    replyCount: tweet.replyCount,
    createdAt: tweet.createdAt,
    author: tweet.author,
    likeCount: tweet._count.likes,
    viewerLiked: tweet.likes.length > 0,
  };
}
