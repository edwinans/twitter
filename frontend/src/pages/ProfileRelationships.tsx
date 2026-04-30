import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserDirectoryPage } from '../components/UserDirectoryPage';
import {
  getUserFollowers,
  getUserFollowing,
  type ProfileUser,
  type User,
} from '../lib/api';
import { useInfinitePagination } from '../hooks/useInfinitePagination';

type RelationshipKind = 'followers' | 'following';

interface ProfileRelationshipsProps {
  kind: RelationshipKind;
}

export function ProfileRelationships({ kind }: ProfileRelationshipsProps) {
  const { username } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const {
    items: users,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    totalPages,
    sentinelRef,
  } = useInfinitePagination<User>({
    resetKey: `${kind}:${username ?? ''}`,
    errorMessage: kind === 'followers' ? 'Failed to load followers' : 'Failed to load following',
    loadPage: async (page) => {
      if (!username) {
        return {
          items: [],
          totalPages: 1,
        };
      }

      const response =
        kind === 'followers'
          ? await getUserFollowers(username, page)
          : await getUserFollowing(username, page);

      setUser(response.user);

      return {
        items: response.users,
        totalPages: response.totalPages,
      };
    },
  });

  useEffect(() => {
    setUser(null);
  }, [kind, username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = kind === 'followers' ? 'Followers' : 'Following';
  const pageTitle = username ? `@${username} ${title.toLowerCase()}` : title;
  const emptyMessage =
    kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.';

  return (
    <UserDirectoryPage
      backTo={`/profile/${username ?? ''}`}
      backLabel="Back to profile"
      title={pageTitle}
      onLogout={handleLogout}
      error={error}
      isLoading={isLoading}
      loadingMessage={`Loading ${title.toLowerCase()}...`}
      emptyMessage={emptyMessage}
      users={users}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      totalPages={totalPages}
      sentinelRef={sentinelRef}
      headerChildren={
        user ? (
          <div className="stats-row">
            <Link to={`/profile/${username}/followers`} className="stat-link">
              <strong>{user.followerCount}</strong> Followers
            </Link>
            <Link to={`/profile/${username}/following`} className="stat-link">
              <strong>{user.followingCount}</strong> Following
            </Link>
          </div>
        ) : null
      }
    />
  );
}
