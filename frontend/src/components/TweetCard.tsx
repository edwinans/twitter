import { Link, useNavigate } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import type { Tweet } from '../lib/api';

interface TweetCardProps {
  tweet: Tweet;
  variant?: 'primary' | 'secondary';
}

export function TweetCard({ tweet, variant = 'primary' }: TweetCardProps) {
  const navigate = useNavigate();
  const isSecondary = variant === 'secondary';

  const handleCardClick = () => {
    navigate(`/tweet/${tweet.id}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    navigate(`/tweet/${tweet.id}`);
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
          to={`/profile/${tweet.author.username}`}
          className={
            isSecondary
              ? 'tweet-card__author tweet-card__author--secondary'
              : 'tweet-card__author'
          }
          onClick={(event) => event.stopPropagation()}
        >
          @{tweet.author.username}
        </Link>
        <span
          className={
            isSecondary
              ? 'tweet-card__timestamp tweet-card__timestamp--secondary'
              : 'tweet-card__timestamp'
          }
        >
          {new Date(tweet.createdAt).toLocaleString()}
        </span>
      </div>
      <p className={isSecondary ? 'tweet-card__content tweet-card__content--secondary' : 'tweet-card__content'}>
        {tweet.content}
      </p>
    </article>
  );
}
