import type { CSSProperties } from 'react';

export const tweetPageStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    overflowX: 'hidden',
  } satisfies CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem clamp(1rem, 4vw, 2rem)',
    borderBottom: '1px solid #333',
  } satisfies CSSProperties,
  content: {
    padding: 'clamp(1rem, 4vw, 2rem)',
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  } satisfies CSSProperties,
  error: {
    color: '#f4212e',
    marginBottom: '1rem',
  } satisfies CSSProperties,
  composer: {
    display: 'grid',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid #333',
    borderRadius: '1rem',
    backgroundColor: '#202020',
    marginBottom: '1.5rem',
    boxSizing: 'border-box',
    width: '100%',
  } satisfies CSSProperties,
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'block',
    minWidth: 0,
    resize: 'vertical',
    minHeight: '110px',
    padding: '0.875rem',
    borderRadius: '0.75rem',
    border: '1px solid #3a3a3a',
    backgroundColor: '#151515',
    color: '#ffffff',
    fontSize: '1rem',
    lineHeight: 1.5,
  } satisfies CSSProperties,
  composerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  } satisfies CSSProperties,
  counter: {
    color: '#a0a0a0',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  postButton: {
    padding: '0.65rem 1.2rem',
    backgroundColor: '#1d9bf0',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 'bold',
  } satisfies CSSProperties,
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1d9bf0',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
  } satisfies CSSProperties,
  timeline: {
    display: 'grid',
    gap: '1rem',
  } satisfies CSSProperties,
  loadingMore: {
    marginTop: '1rem',
    color: '#a0a0a0',
    textAlign: 'center',
    fontSize: '0.95rem',
  } satisfies CSSProperties,
  sentinel: {
    height: '1px',
  } satisfies CSSProperties,
  endMessage: {
    marginTop: '1rem',
    color: '#a0a0a0',
    textAlign: 'center',
    fontSize: '0.95rem',
  } satisfies CSSProperties,
} as const;

export const tweetPageLinkStyles = {
  color: '#1d9bf0',
  textDecoration: 'none',
} satisfies CSSProperties;
