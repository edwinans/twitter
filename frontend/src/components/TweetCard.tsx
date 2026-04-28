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
      style={{
        ...styles.card,
        ...(isSecondary ? styles.secondaryCard : styles.primaryCard),
      }}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div style={{ ...styles.header, ...(isSecondary ? styles.secondaryHeader : null) }}>
        <Link
          to={`/profile/${tweet.author.username}`}
          style={{
            ...styles.authorLink,
            ...(isSecondary ? styles.secondaryAuthorLink : null),
          }}
          onClick={(event) => event.stopPropagation()}
        >
          @{tweet.author.username}
        </Link>
        <span style={{ ...styles.timestamp, ...(isSecondary ? styles.secondaryTimestamp : null) }}>
          {new Date(tweet.createdAt).toLocaleString()}
        </span>
      </div>
      <p style={{ ...styles.content, ...(isSecondary ? styles.secondaryContent : null) }}>
        {tweet.content}
      </p>
    </article>
  );
}

const styles = {
  card: {
    padding: '1rem',
    border: '1px solid #333',
    borderRadius: '1rem',
    backgroundColor: '#202020',
    cursor: 'pointer',
    outline: 'none',
  },
  primaryCard: {
    boxShadow: 'none',
  },
  secondaryCard: {
    marginLeft: '1.1rem',
    borderColor: '#2d2d2d',
    backgroundColor: '#171717',
    padding: '0.8rem 0.9rem',
    borderRadius: '0.85rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  secondaryHeader: {
    marginBottom: '0.5rem',
  },
  authorLink: {
    color: '#1d9bf0',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
  secondaryAuthorLink: {
    fontSize: '0.95rem',
    color: '#88bff2',
  },
  timestamp: {
    color: '#888',
    fontSize: '0.875rem',
  },
  secondaryTimestamp: {
    fontSize: '0.8rem',
  },
  content: {
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
  secondaryContent: {
    fontSize: '0.95rem',
    color: '#e2e2e2',
  },
};
