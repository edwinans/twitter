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
    removeItem,
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
      setTweet((currentTweet) =>
        currentTweet
          ? {
              ...currentTweet,
              replyCount: currentTweet.replyCount + 1,
            }
          : currentTweet
      );
      prependItem(reply);
      setContent('');
    } catch {
      setError('Failed to create reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-page__header">
        <div>
          <Link to="/feed" className="back-link">
            Back to feed
          </Link>
          <h1 className="page-title page-title--spaced">Tweet</h1>
          {tweet && (
            <p className="page-subtitle">
              by @{tweet.author.username}
            </p>
          )}
        </div>
        <div className="header-actions">
          <span className="user-name">@{user?.username}</span>
          <button onClick={handleLogout} className="button-primary button-primary--compact">
            Logout
          </button>
        </div>
      </div>

      <div className="app-page__content">
        {tweetError && <div className="error-text">{tweetError}</div>}

        {!tweetError && !tweet && <p>Loading tweet...</p>}

        {tweet && ancestors.length > 0 && (
          <div className="thread-stack">
            {ancestors.map((ancestor) => (
              <TweetCard
                key={ancestor.id}
                tweet={ancestor}
                variant="secondary"
                onDeleteTweet={(tweetId) =>
                  setAncestors((currentAncestors) =>
                    currentAncestors.filter((ancestor) => ancestor.id !== tweetId)
                  )
                }
              />
            ))}
          </div>
        )}

        {tweet && (
          <TweetCard
            tweet={tweet}
            onDeleteTweet={() => {
              setTweet(null);
              navigate('/feed');
            }}
          />
        )}

        {tweet && (
          <div className="reply-composer">
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

        {tweet && <div className="divider" />}

        {error && <div className="error-text">{error}</div>}

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
            onDeleteTweet={(tweetId) => {
              removeItem((reply) => reply.id === tweetId);
              setTweet((currentTweet) =>
                currentTweet
                  ? {
                      ...currentTweet,
                      replyCount: Math.max(0, currentTweet.replyCount - 1),
                    }
                  : currentTweet
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
