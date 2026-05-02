import { useEffect, useState, type MouseEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { likeTweet, unlikeTweet, type Tweet } from '../lib/api';

interface TweetCardProps {
  tweet: Tweet;
  variant?: 'primary' | 'secondary';
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="tweet-card__like-icon tweet-card__like-icon--filled"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="tweet-card__like-icon tweet-card__like-icon--outline"
    >
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="tweet-card__reply-icon"
    >
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  );
}

export function TweetCard({ tweet, variant = 'primary' }: TweetCardProps) {
  const navigate = useNavigate();
  const isSecondary = variant === 'secondary';
  const [currentTweet, setCurrentTweet] = useState(tweet);
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);
  const [likeError, setLikeError] = useState('');
  const replyCount = currentTweet.replyCount ?? 0;

  useEffect(() => {
    setCurrentTweet(tweet);
    setLikeError('');
    setIsUpdatingLike(false);
  }, [tweet]);

  const handleCardClick = () => {
    navigate(`/tweet/${currentTweet.id}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    navigate(`/tweet/${currentTweet.id}`);
  };

  const handleLikeClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isUpdatingLike) {
      return;
    }

    const previousTweet = currentTweet;
    const nextTweet = previousTweet.viewerLiked
      ? {
        ...previousTweet,
        viewerLiked: false,
        likeCount: Math.max(0, previousTweet.likeCount - 1),
      }
      : {
        ...previousTweet,
        viewerLiked: true,
        likeCount: previousTweet.likeCount + 1,
      };

    setLikeError('');
    setCurrentTweet(nextTweet);
    setIsUpdatingLike(true);

    try {
      const updatedTweet = previousTweet.viewerLiked
        ? await unlikeTweet(previousTweet.id)
        : await likeTweet(previousTweet.id);

      setCurrentTweet(updatedTweet);
    } catch {
      setCurrentTweet(previousTweet);
      setLikeError('Failed to update like');
    } finally {
      setIsUpdatingLike(false);
    }
  };

  return (
    <article
      className={isSecondary ? 'tweet-card tweet-card--secondary' : 'tweet-card'}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className={isSecondary ? 'tweet-card__header tweet-card__header--secondary' : 'tweet-card__header'}>
        <Link
          to={`/profile/${currentTweet.author.username}`}
          className={
            isSecondary
              ? 'tweet-card__author tweet-card__author--secondary'
              : 'tweet-card__author'
          }
          onClick={(event) => event.stopPropagation()}
        >
          @{currentTweet.author.username}
        </Link>
        <span
          className={
            isSecondary
              ? 'tweet-card__timestamp tweet-card__timestamp--secondary'
              : 'tweet-card__timestamp'
          }
        >
          {new Date(currentTweet.createdAt).toLocaleString()}
        </span>
      </div>
      <p className={isSecondary ? 'tweet-card__content tweet-card__content--secondary' : 'tweet-card__content'}>
        {currentTweet.content}
      </p>
      <div className={isSecondary ? 'tweet-card__actions tweet-card__actions--secondary' : 'tweet-card__actions'}>
        <button
          type="button"
          className={
            currentTweet.viewerLiked
              ? 'tweet-card__like-button tweet-card__like-button--liked'
              : 'tweet-card__like-button'
          }
          onClick={handleLikeClick}
          disabled={isUpdatingLike}
          aria-pressed={currentTweet.viewerLiked}
        >
          <HeartIcon filled={currentTweet.viewerLiked} />
          <span className="tweet-card__count">{currentTweet.likeCount}</span>
        </button>
        <button
          type="button"
          className="tweet-card__reply-button"
          aria-label={`${replyCount} replies`}
        >
          <ReplyIcon />
          {replyCount > 0 && <span className="tweet-card__count">{replyCount}</span>}
        </button>
        {likeError && <span className="tweet-card__like-error">{likeError}</span>}
      </div>
    </article>
  );
}
