import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../lib/api';

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
    <div className="app-page">
      <div className="app-page__header app-page__header--start">
        <div>
          <Link to={backTo} className="back-link">
            {backLabel}
          </Link>
          <h1 className="page-title page-title--spaced">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          {headerChildren}
        </div>
        <button onClick={onLogout} className="button-primary button-primary--compact">
          Logout
        </button>
      </div>

      <div className="app-page__content">
        {error && <div className="error-text">{error}</div>}

        {isLoading ? (
          <p>{loadingMessage}</p>
        ) : users.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <>
            <div className="user-list">
              {users.map((user) => (
                <Link key={user.id} to={`/profile/${user.username}`} className="user-list__item">
                  @{user.username}
                </Link>
              ))}
            </div>
            {isLoadingMore && <p className="loading-more">Loading more...</p>}
            {hasMore && <div ref={sentinelRef} className="sentinel" />}
            {!hasMore && totalPages && totalPages > 1 && <p className="end-message">{endMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}
