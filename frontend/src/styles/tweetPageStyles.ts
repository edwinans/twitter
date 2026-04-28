import type { CSSProperties } from 'react';

export const tweetPageStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  } satisfies CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem 2rem',
    borderBottom: '1px solid #333',
  } satisfies CSSProperties,
  content: {
    padding: '2rem',
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
  } satisfies CSSProperties,
  error: {
    color: '#f4212e',
    marginBottom: '1rem',
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
  } satisfies CSSProperties,
  sentinel: {
    height: '1px',
  } satisfies CSSProperties,
  endMessage: {
    marginTop: '1rem',
    color: '#a0a0a0',
    textAlign: 'center',
  } satisfies CSSProperties,
} as const;

export const tweetPageLinkStyles = {
  color: '#1d9bf0',
  textDecoration: 'none',
} satisfies CSSProperties;
