import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TweetCard } from '../components/TweetCard';
import { TweetComposer } from '../components/TweetComposer';
import { TweetTimeline } from '../components/TweetTimeline';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import {
  createReply,
  getTweetById,
  getTweetReplies,
  type Tweet,
} from '../lib/api';
import { tweetPageLinkStyles, tweetPageStyles } from '../styles/tweetPageStyles';

export function TweetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [ancestors, setAncestors] = useState<Tweet[]>([]);
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tweetError, setTweetError] = useState('');
  const {
    items: replies,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    totalPages,
    sentinelRef,
    prependItem,
    setError,
  } = useInfinitePagination<Tweet>({
    resetKey: id ?? '',
    errorMessage: 'Failed to load replies',
    loadPage: async (page) => {
      if (!id) {
        return {
          items: [],
          totalPages: 1,
        };
      }

      const response = await getTweetReplies(id, page);
      return {
        items: response.tweets,
        totalPages: response.totalPages,
      };
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadThread = async () => {
      if (!id) {
        setAncestors([]);
        setTweet(null);
        setTweetError('Tweet not found');
        return;
      }

      setAncestors([]);
      setTweet(null);
      setTweetError('');

      try {
        const currentTweet = await getTweetById(id);
        const parentTweets: Tweet[] = [];
        let parentTweetId = currentTweet.parentTweetId;

        while (parentTweetId) {
          const parentTweet = await getTweetById(parentTweetId);
          parentTweets.unshift(parentTweet);
          parentTweetId = parentTweet.parentTweetId;
        }

        if (isMounted) {
          setAncestors(parentTweets);
          setTweet(currentTweet);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setTweetError('Failed to load tweet');
      }
    };

    void loadThread();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const submitReply = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !tweet) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const reply = await createReply(trimmedContent, tweet.id);
      prependItem(reply);
      setContent('');
    } catch {
      setError('Failed to create reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link to="/feed" style={styles.backLink}>
            Back to feed
          </Link>
          <h1 style={styles.title}>Tweet</h1>
          {tweet && (
            <p style={styles.subtitle}>
              by @{tweet.author.username}
            </p>
          )}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.username}>@{user?.username}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {tweetError && <div style={styles.error}>{tweetError}</div>}

        {!tweetError && !tweet && <p>Loading tweet...</p>}

        {tweet && ancestors.length > 0 && (
          <div style={styles.ancestorStack}>
            {ancestors.map((ancestor) => (
              <TweetCard key={ancestor.id} tweet={ancestor} variant="secondary" />
            ))}
          </div>
        )}

        {tweet && <TweetCard tweet={tweet} />}

        {tweet && (
          <div style={styles.composerSection}>
            <TweetComposer
              value={content}
              onChange={setContent}
              onSubmit={submitReply}
              isSubmitting={isSubmitting}
              placeholder={`Reply to @${tweet.author.username}`}
              submitLabel="Reply"
            />
          </div>
        )}

        {tweet && <div style={styles.divider} />}

        {error && <div style={styles.error}>{error}</div>}

        {tweet && (
          <TweetTimeline
            tweets={replies}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            totalPages={totalPages}
            loadingMessage="Loading replies..."
            emptyMessage="No replies yet."
            sentinelRef={sentinelRef}
            tweetVariant="secondary"
          />
        )}
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
  ancestorStack: {
    display: 'grid',
    gap: '0.75rem',
    marginBottom: '0.9rem',
  } as const,
  composerSection: {
    marginTop: '1rem',
  } as const,
  divider: {
    height: '1px',
    backgroundColor: '#2e2e2e',
    margin: '1.25rem 0 1rem',
  } as const,
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  } as const,
  username: {
    color: '#a0a0a0',
  } as const,
  error: tweetPageStyles.error,
};
