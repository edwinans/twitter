const API_BASE = '/api';

export interface User {
  id: string;
  username: string;
}

export interface ProfileUser extends User {
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface TweetAuthor {
  id: string;
  username: string;
}

export interface Tweet {
  id: string;
  content: string;
  parentTweetId: string | null;
  createdAt: string;
  author: TweetAuthor;
  likeCount: number;
  viewerLiked: boolean;
}

export interface PaginatedTweetsResponse {
  tweets: Tweet[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTweetRepliesResponse {
  tweets: Tweet[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfileTweetsResponse {
  user: ProfileUser;
  tweets: Tweet[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfileUserListResponse {
  user: ProfileUser;
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
}

export interface FollowResponse {
  user: ProfileUser;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function register(
  username: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function me(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to load current user');
  }

  return response.json();
}

export async function getFeedTweets(
  page = 1,
  limit = 20
): Promise<PaginatedTweetsResponse> {
  const response = await fetch(
    `${API_BASE}/tweets?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load feed');
  }

  return response.json();
}

export async function createTweet(content: string): Promise<Tweet> {
  return createTweetWithParent(content);
}

export async function createReply(
  content: string,
  parentTweetId: string
): Promise<Tweet> {
  return createTweetWithParent(content, parentTweetId);
}

async function createTweetWithParent(
  content: string,
  parentTweetId?: string
): Promise<Tweet> {
  const response = await fetch(`${API_BASE}/tweets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      content,
      ...(parentTweetId ? { parentTweetId } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create tweet');
  }

  return response.json();
}

export async function getTweetById(tweetId: string): Promise<Tweet> {
  const response = await fetch(`${API_BASE}/tweets/${encodeURIComponent(tweetId)}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to load tweet');
  }

  return response.json();
}

export async function likeTweet(tweetId: string): Promise<Tweet> {
  const response = await fetch(
    `${API_BASE}/tweets/${encodeURIComponent(tweetId)}/like`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to like tweet');
  }

  return response.json();
}

export async function unlikeTweet(tweetId: string): Promise<Tweet> {
  const response = await fetch(
    `${API_BASE}/tweets/${encodeURIComponent(tweetId)}/like`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to unlike tweet');
  }

  return response.json();
}

export async function getTweetReplies(
  tweetId: string,
  page = 1,
  limit = 20
): Promise<PaginatedTweetRepliesResponse> {
  const response = await fetch(
    `${API_BASE}/tweets/${encodeURIComponent(tweetId)}/replies?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load replies');
  }

  return response.json();
}

export async function getUserTweets(
  username: string,
  page = 1,
  limit = 10
): Promise<ProfileTweetsResponse> {
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/tweets?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load profile');
  }

  return response.json();
}

export async function getUserFollowers(
  username: string,
  page = 1,
  limit = 10
): Promise<ProfileUserListResponse> {
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/followers?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load followers');
  }

  return response.json();
}

export async function getUserFollowing(
  username: string,
  page = 1,
  limit = 10
): Promise<ProfileUserListResponse> {
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/following?page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load following');
  }

  return response.json();
}

export async function getUsers(): Promise<UsersResponse> {
  const response = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to load users');
  }

  return response.json();
}

export async function followUser(username: string): Promise<FollowResponse> {
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/follow`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to follow user');
  }

  return response.json();
}

export async function unfollowUser(username: string): Promise<FollowResponse> {
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/follow`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to unfollow user');
  }

  return response.json();
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}
