import { type KeyboardEvent, type SyntheticEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTweet, getFeedTweets, type Tweet } from '../lib/api';
import { TweetTimeline } from '../components/TweetTimeline';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

export function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    items: tweets,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    totalPages,
    sentinelRef,
    prependItem,
    setError,
  } = useInfinitePagination<Tweet>({
    resetKey: 'feed',
    errorMessage: 'Failed to load tweets',
    loadPage: async (page) => {
      const response = await getFeedTweets(page);
      return {
        items: response.tweets,
        totalPages: response.totalPages,
      };
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const submitTweet = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const tweet = await createTweet(trimmedContent);
      prependItem(tweet);
      setContent('');
    } catch {
      setError('Failed to create tweet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitTweet();
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();
    void submitTweet();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Feed</h1>
          <p style={styles.subtitle}>Welcome, {user?.username}</p>
        </div>
        <div style={styles.userInfo}>
          <Link to={`/profile/${user?.username}`} style={styles.profileLink}>
            My profile
          </Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.composer}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="What's happening?"
            style={styles.textarea}
            maxLength={280}
            rows={4}
          />
          <div style={styles.composerFooter}>
            <span style={styles.counter}>{content.length}/280</span>
            <button type="submit" style={styles.postButton} disabled={isSubmitting}>
              Post
            </button>
          </div>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        <TweetTimeline
          tweets={tweets}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalPages={totalPages}
          loadingMessage="Loading tweets..."
          emptyMessage="No tweets yet."
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  );
}

const styles = {
  header: {
    alignItems: 'center',
    ...tweetPageStyles.header,
  },
  title: {
    margin: 0,
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#a0a0a0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  profileLink: {
    ...tweetPageLinkStyles,
  },
  container: tweetPageStyles.container,
  logoutButton: tweetPageStyles.logoutButton,
  content: tweetPageStyles.content,
  composer: {
    display: 'grid',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid #333',
    borderRadius: '1rem',
    backgroundColor: '#202020',
    marginBottom: '1.5rem',
  },
  textarea: {
    width: '100%',
    resize: 'vertical' as const,
    minHeight: '110px',
    padding: '0.875rem',
    borderRadius: '0.75rem',
    border: '1px solid #3a3a3a',
    backgroundColor: '#151515',
    color: '#ffffff',
    fontSize: '1rem',
  },
  composerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  counter: {
    color: '#a0a0a0',
    fontSize: '0.875rem',
  },
  postButton: {
    padding: '0.65rem 1.2rem',
    backgroundColor: '#1d9bf0',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  error: tweetPageStyles.error,
};
