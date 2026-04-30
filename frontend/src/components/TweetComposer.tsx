import { type KeyboardEvent, type SyntheticEvent } from 'react';

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
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();
    void onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="tweet-composer">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="tweet-textarea"
        maxLength={280}
        rows={4}
      />
      <div className="tweet-composer__footer">
        <span className="tweet-counter">{value.length}/280</span>
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
