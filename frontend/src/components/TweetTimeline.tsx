import { type RefObject } from 'react';
import { TweetCard } from './TweetCard';
import type { Tweet } from '../lib/api';
import { tweetPageStyles } from '../styles/tweetPageStyles';

interface TweetTimelineProps {
  tweets: Tweet[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalPages: number;
  loadingMessage: string;
  emptyMessage: string;
  sentinelRef: RefObject<HTMLDivElement | null>;
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
}: TweetTimelineProps) {
  if (isLoading) {
    return <p>{loadingMessage}</p>;
  }

  if (tweets.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <>
      <div style={tweetPageStyles.timeline}>
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
      {isLoadingMore && <p style={tweetPageStyles.loadingMore}>Loading more...</p>}
      {hasMore && <div ref={sentinelRef} style={tweetPageStyles.sentinel} />}
      {!hasMore && totalPages > 1 && (
        <p style={tweetPageStyles.endMessage}>No more tweets.</p>
      )}
    </>
  );
}
