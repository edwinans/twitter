import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserFollowers,
  getUserFollowing,
  type ProfileUser,
  type User,
} from '../lib/api';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

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
  const emptyMessage =
    kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to={`/profile/${username ?? ''}`} style={styles.backLink}>
            Back to profile
          </Link>
          <h1 style={styles.title}>
            @{username} {title.toLowerCase()}
          </h1>
          {user && (
            <div style={styles.stats}>
              <Link to={`/profile/${username}/followers`} style={styles.statLink}>
                <strong>{user.followerCount}</strong> Followers
              </Link>
              <Link to={`/profile/${username}/following`} style={styles.statLink}>
                <strong>{user.followingCount}</strong> Following
              </Link>
            </div>
          )}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        {isLoading ? (
          <p>Loading {title.toLowerCase()}...</p>
        ) : users.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <>
            <div style={styles.list}>
              {users.map((item) => (
                <Link key={item.id} to={`/profile/${item.username}`} style={styles.userLink}>
                  @{item.username}
                </Link>
              ))}
            </div>
            {isLoadingMore && <p style={styles.loadingMore}>Loading more...</p>}
            {hasMore && <div ref={sentinelRef} style={styles.sentinel} />}
            {!hasMore && totalPages > 1 && <p style={styles.endMessage}>No more users.</p>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: tweetPageStyles.container,
  header: {
    ...tweetPageStyles.header,
    alignItems: 'flex-start',
  },
  content: tweetPageStyles.content,
  error: tweetPageStyles.error,
  backLink: {
    ...tweetPageLinkStyles,
    fontSize: '0.95rem',
    display: 'inline-block',
  },
  title: {
    margin: '0.5rem 0 0',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '0.75rem',
  } as const,
  statLink: {
    ...tweetPageLinkStyles,
    display: 'inline-flex',
    gap: '0.35rem',
    alignItems: 'baseline',
  },
  logoutButton: tweetPageStyles.logoutButton,
  list: {
    display: 'grid',
    gap: '0.75rem',
  },
  userLink: {
    padding: '0.9rem 1rem',
    border: '1px solid #333',
    borderRadius: '0.9rem',
    backgroundColor: '#202020',
    color: '#1d9bf0',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  loadingMore: tweetPageStyles.loadingMore,
  sentinel: tweetPageStyles.sentinel,
  endMessage: tweetPageStyles.endMessage,
} as const;
