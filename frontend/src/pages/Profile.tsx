import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  followUser,
  getUserTweets,
  unfollowUser,
  type ProfileUser,
  type Tweet,
} from '../lib/api';
import { TweetTimeline } from '../components/TweetTimeline';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [followError, setFollowError] = useState('');
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
    setFollowError('');
  }, [username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFollowToggle = async () => {
    if (!username || !user || user.isOwnProfile) {
      return;
    }

    const previousUser = user;
    const nextIsFollowing = !user.isFollowing;

    setFollowError('');
    setUser({
      ...user,
      isFollowing: nextIsFollowing,
      followerCount: nextIsFollowing
        ? user.followerCount + 1
        : Math.max(0, user.followerCount - 1),
    });

    try {
      const response = previousUser.isFollowing
        ? await unfollowUser(username)
        : await followUser(username);

      setUser(response.user);
    } catch {
      setUser(previousUser);
      setFollowError(previousUser.isFollowing ? 'Failed to unfollow user' : 'Failed to follow user');
    }
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
          {user && (
            <div style={styles.stats}>
              <Link to={`/profile/${username}/followers`} style={styles.statLink}>
                <strong>{user.followerCount}</strong> Followers
              </Link>
              <Link to={`/profile/${username}/following`} style={styles.statLink}>
                <strong>{user.followingCount}</strong> Following
              </Link>
              {!user.isOwnProfile && (
                <button onClick={handleFollowToggle} style={styles.followButton}>
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          )}
        </div>
        <div style={styles.actions}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}
        {followError && <div style={styles.error}>{followError}</div>}

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
  stats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '0.75rem',
  } as const,
  statLink: {
    ...tweetPageLinkStyles,
    display: 'inline-flex',
    gap: '0.35rem',
    alignItems: 'baseline',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#a0a0a0',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  } as const,
  followButton: {
    ...tweetPageStyles.logoutButton,
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 1,
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
