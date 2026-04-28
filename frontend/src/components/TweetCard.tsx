import { Link } from 'react-router-dom';
import type { Tweet } from '../lib/api';

interface TweetCardProps {
  tweet: Tweet;
}

export function TweetCard({ tweet }: TweetCardProps) {
  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <Link to={`/profile/${tweet.author.username}`} style={styles.authorLink}>
          @{tweet.author.username}
        </Link>
        <span style={styles.timestamp}>
          {new Date(tweet.createdAt).toLocaleString()}
        </span>
      </div>
      <p style={styles.content}>{tweet.content}</p>
    </article>
  );
}

const styles = {
  card: {
    padding: '1rem',
    border: '1px solid #333',
    borderRadius: '1rem',
    backgroundColor: '#202020',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  authorLink: {
    color: '#1d9bf0',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
  timestamp: {
    color: '#888',
    fontSize: '0.875rem',
  },
  content: {
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
};
