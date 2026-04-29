import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTweet, getFeedTweets, type Tweet } from '../lib/api';
import { TweetTimeline } from '../components/TweetTimeline';
import { TweetComposer } from '../components/TweetComposer';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';
import { useState } from 'react';

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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Feed</h1>
          <p style={styles.subtitle}>Welcome, {user?.username}</p>
        </div>
        <div style={styles.userInfo}>
          <Link to="/users" style={styles.usersLink}>
            Users
          </Link>
          <Link to={`/profile/${user?.username}`} style={styles.profileLink}>
            My profile
          </Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <TweetComposer
          value={content}
          onChange={setContent}
          onSubmit={submitTweet}
          isSubmitting={isSubmitting}
          placeholder="What's happening?"
          submitLabel="Post"
        />

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
    ...tweetPageStyles.header,
    alignItems: 'center',
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
    flexWrap: 'wrap',
    gap: '1rem',
  } as const,
  profileLink: {
    ...tweetPageLinkStyles,
  },
  usersLink: {
    ...tweetPageLinkStyles,
  },
  container: tweetPageStyles.container,
  logoutButton: tweetPageStyles.logoutButton,
  content: tweetPageStyles.content,
  error: tweetPageStyles.error,
};
