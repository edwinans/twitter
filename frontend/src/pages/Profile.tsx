import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserTweets, type ProfileUser, type Tweet } from '../lib/api';
import { TweetTimeline } from '../components/TweetTimeline';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const {
    items: tweets,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    totalPages,
    sentinelRef,
  } = useInfinitePagination<Tweet>({
    resetKey: username ?? '',
    errorMessage: 'Failed to load profile',
    loadPage: async (page) => {
      if (!username) {
        return {
          items: [],
          totalPages: 1,
        };
      }

      const response = await getUserTweets(username, page);
      setUser(response.user);
      return {
        items: response.tweets,
        totalPages: response.totalPages,
      };
    },
  });

  useEffect(() => {
    setUser(null);
  }, [username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to="/feed" style={styles.backLink}>
            Back to feed
          </Link>
          <h1 style={styles.title}>@{username}</h1>
          {user && (
            <p style={styles.subtitle}>
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        <TweetTimeline
          tweets={tweets}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalPages={totalPages}
          loadingMessage="Loading profile..."
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
    alignItems: 'flex-start',
  },
  title: {
    margin: '0.5rem 0 0',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#a0a0a0',
  },
  backLink: {
    ...tweetPageLinkStyles,
    fontSize: '0.95rem',
    display: 'inline-block',
  },
  container: tweetPageStyles.container,
  logoutButton: tweetPageStyles.logoutButton,
  content: tweetPageStyles.content,
  error: tweetPageStyles.error,
};
