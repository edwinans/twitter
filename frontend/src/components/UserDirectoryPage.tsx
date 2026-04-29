import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../lib/api';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

interface UserDirectoryPageProps {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  onLogout: () => void;
  error?: string;
  isLoading: boolean;
  loadingMessage: string;
  emptyMessage: string;
  users: User[];
  headerChildren?: ReactNode;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalPages?: number;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  endMessage?: string;
}

export function UserDirectoryPage({
  backTo,
  backLabel,
  title,
  subtitle,
  onLogout,
  error,
  isLoading,
  loadingMessage,
  emptyMessage,
  users,
  headerChildren,
  isLoadingMore,
  hasMore,
  totalPages,
  sentinelRef,
  endMessage = 'No more users.',
}: UserDirectoryPageProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to={backTo} style={styles.backLink}>
            {backLabel}
          </Link>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          {headerChildren}
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        {isLoading ? (
          <p>{loadingMessage}</p>
        ) : users.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <>
            <div style={styles.list}>
              {users.map((user) => (
                <Link key={user.id} to={`/profile/${user.username}`} style={styles.userLink}>
                  @{user.username}
                </Link>
              ))}
            </div>
            {isLoadingMore && <p style={styles.loadingMore}>Loading more...</p>}
            {hasMore && <div ref={sentinelRef} style={styles.sentinel} />}
            {!hasMore && totalPages && totalPages > 1 && <p style={styles.endMessage}>{endMessage}</p>}
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
  backLink: {
    ...tweetPageLinkStyles,
    fontSize: '0.95rem',
    display: 'inline-block',
  },
  title: {
    margin: '0.5rem 0 0',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#a0a0a0',
  },
  logoutButton: tweetPageStyles.logoutButton,
  content: tweetPageStyles.content,
  error: tweetPageStyles.error,
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
