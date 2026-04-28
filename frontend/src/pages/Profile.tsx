import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserTweets, type ProfileUser, type Tweet } from '../lib/api';
import { TweetCard } from '../components/TweetCard';

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPage(1);
    setTweets([]);
    setTotalPages(1);
    setError('');
    setIsLoading(true);
    setIsLoadingMore(false);
    setHasMore(true);
    setUser(null);
  }, [username]);

  useEffect(() => {
    if (!username) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setError('');

      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await getUserTweets(username, page);
        if (!isMounted) {
          return;
        }

        setUser(response.user);
        setTotalPages(response.totalPages);
        setHasMore(page < response.totalPages && response.tweets.length > 0);
        setTweets((currentTweets) =>
          page === 1 ? response.tweets : [...currentTweets, ...response.tweets]
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Failed to load profile');
      } finally {
        if (isMounted) {
          if (page === 1) {
            setIsLoading(false);
          } else {
            setIsLoadingMore(false);
          }
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [username, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore]);

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

        {isLoading ? (
          <p>Loading profile...</p>
        ) : tweets.length === 0 ? (
          <p>No tweets yet.</p>
        ) : (
          <>
            <div style={styles.timeline}>
              {tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
            {isLoadingMore && <p style={styles.loadingMore}>Loading more...</p>}
            {hasMore && <div ref={sentinelRef} style={styles.sentinel} />}
            {!hasMore && totalPages > 1 && <p style={styles.endMessage}>No more tweets.</p>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem 2rem',
    borderBottom: '1px solid #333',
  },
  title: {
    margin: '0.5rem 0 0',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#a0a0a0',
  },
  backLink: {
    color: '#1d9bf0',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1d9bf0',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
  },
  content: {
    padding: '2rem',
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
  },
  error: {
    color: '#f4212e',
    marginBottom: '1rem',
  },
  timeline: {
    display: 'grid',
    gap: '1rem',
  },
  loadingMore: {
    marginTop: '1rem',
    color: '#a0a0a0',
    textAlign: 'center' as const,
  },
  sentinel: {
    height: '1px',
  },
  endMessage: {
    marginTop: '1rem',
    color: '#a0a0a0',
    textAlign: 'center' as const,
  },
};
