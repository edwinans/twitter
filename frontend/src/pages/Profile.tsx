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
    removeItem,
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
    <div className="app-page">
      <div className="app-page__header app-page__header--start">
        <div>
          <Link to="/feed" className="back-link">
            Back to feed
          </Link>
          <h1 className="page-title page-title--spaced">@{username}</h1>
          {user && (
            <p className="page-subtitle">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
          {user && (
            <div className="stats-row">
              <Link to={`/profile/${username}/followers`} className="stat-link">
                <strong>{user.followerCount}</strong> Followers
              </Link>
              <Link to={`/profile/${username}/following`} className="stat-link">
                <strong>{user.followingCount}</strong> Following
              </Link>
              {!user.isOwnProfile && (
                <button onClick={handleFollowToggle} className="button-primary button-primary--compact">
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="button-primary button-primary--compact">
            Logout
          </button>
        </div>
      </div>

      <div className="app-page__content">
        {error && <div className="error-text">{error}</div>}
        {followError && <div className="error-text">{followError}</div>}

        <TweetTimeline
          tweets={tweets}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalPages={totalPages}
          loadingMessage="Loading profile..."
          emptyMessage="No tweets yet."
          sentinelRef={sentinelRef}
          onDeleteTweet={(tweetId) => removeItem((tweet) => tweet.id === tweetId)}
        />
      </div>
    </div>
  );
}
