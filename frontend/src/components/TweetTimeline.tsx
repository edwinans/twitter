import { type RefObject } from 'react';
import { TweetCard } from './TweetCard';
import type { Tweet } from '../lib/api';

interface TweetTimelineProps {
  tweets: Tweet[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalPages: number;
  loadingMessage: string;
  emptyMessage: string;
  sentinelRef: RefObject<HTMLDivElement | null>;
  tweetVariant?: 'primary' | 'secondary';
}

export function TweetTimeline({
  tweets,
  isLoading,
  isLoadingMore,
  hasMore,
  totalPages,
  loadingMessage,
  emptyMessage,
  sentinelRef,
  tweetVariant = 'primary',
}: TweetTimelineProps) {
  if (isLoading) {
    return <p>{loadingMessage}</p>;
  }

  if (tweets.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <>
      <div className="timeline">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} variant={tweetVariant} />
        ))}
      </div>
      {isLoadingMore && <p className="loading-more">Loading more...</p>}
      {hasMore && <div ref={sentinelRef} className="sentinel" />}
      {!hasMore && totalPages > 1 && (
        <p className="end-message">No more tweets.</p>
      )}
    </>
  );
}
