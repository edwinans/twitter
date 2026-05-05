import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createTweet, getFeedTweets, type Tweet } from '../lib/api';
import { TweetTimeline } from '../components/TweetTimeline';
import { TweetComposer } from '../components/TweetComposer';
import { useInfinitePagination } from '../hooks/useInfinitePagination';
import { useState } from 'react';

export function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    items: tweets,
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
    resetKey: 'feed',
    errorMessage: 'Failed to load tweets',
    loadPage: async (page) => {
      const response = await getFeedTweets(page);
      return {
        items: response.tweets,
        totalPages: response.totalPages,
      };
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const submitTweet = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const tweet = await createTweet(trimmedContent);
      prependItem(tweet);
      setContent('');
    } catch {
      setError('Failed to create tweet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-page__header">
        <div>
          <h1 className="page-title">Feed</h1>
          <p className="page-subtitle">Welcome, {user?.username}</p>
        </div>
        <div className="header-actions">
          <Link to="/users" className="link-primary">
            Users
          </Link>
          <Link to={`/profile/${user?.username}`} className="link-primary">
            My profile
          </Link>
          <button onClick={handleLogout} className="button-primary button-primary--compact">
            Logout
          </button>
        </div>
      </div>

      <div className="app-page__content">
        <TweetComposer
          value={content}
          onChange={setContent}
          onSubmit={submitTweet}
          isSubmitting={isSubmitting}
          placeholder="What's happening?"
          submitLabel="Post"
        />

        {error && <div className="error-text">{error}</div>}

        <TweetTimeline
          tweets={tweets}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          totalPages={totalPages}
          loadingMessage="Loading tweets..."
          emptyMessage="No tweets yet."
          sentinelRef={sentinelRef}
          onDeleteTweet={(tweetId) => removeItem((tweet) => tweet.id === tweetId)}
        />
      </div>
    </div>
  );
}
