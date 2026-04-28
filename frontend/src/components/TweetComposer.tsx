import { type KeyboardEvent, type SyntheticEvent } from 'react';
import { tweetPageStyles } from '../styles/tweetPageStyles';

interface TweetComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  placeholder: string;
  submitLabel: string;
}

export function TweetComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  placeholder,
  submitLabel,
}: TweetComposerProps) {
  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();
    void onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={tweetPageStyles.composer}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={tweetPageStyles.textarea}
        maxLength={280}
        rows={4}
      />
      <div style={tweetPageStyles.composerFooter}>
        <span style={tweetPageStyles.counter}>{value.length}/280</span>
        <button type="submit" style={tweetPageStyles.postButton} disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
