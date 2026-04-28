# AGENTS.md

## Project

This is a beginner-friendly toy project for learning full-stack development.

We are building a simple Twitter-like app with:

- Backend: Node.js, TypeScript, NestJS
- Frontend: React, TypeScript, React Router
- Database: PostgreSQL running in Docker

Do not use Next.js.

Keep the project simple. Do not overengineer it.

## Features

Build only these core features:

- User registration
- User login
- Simple JWT access-token authentication
- Logout by deleting the token on the frontend
- Create tweets
- User profile with its tweets
- Follow and unfollow users
- Reply to tweets
- Like and unlike tweets
- Show a feed with tweets from followed users

A reply should be treated as a tweet with an optional `parentTweetId`.

Do not add refresh tokens, token blacklists, complex sessions, or advanced auth flows unless requested.

## Implementation Order

Proceed gradually. Do not implement everything at once.

Implement the project in this order:

1. User registration and login
2. Tweet creation and basic tweet display
3. Following and unfollowing users
4. Feed showing tweets from followed users
5. Replies to tweets
6. Likes and unlikes

At each step, finish the simplest working version before moving to the next feature.

## Workflow

Before writing or changing code, always make a short plan first with "AskUserQuestions"

Do not write code until I confirm.

Ask only necessary questions. Keep questions short.

Optimize for low token usage. Be concise. Avoid long explanations unless I ask.

## Code Style

Use TypeScript best practices.
Format codes with 2 spaces.
Always add @types dependencies when adding a dep.

Prefer:

- Simple readable code
- Functional programming when it keeps things simple
- Explicit types where useful
- Small functions
- Clear names
- DTOs for API input
- Simple REST endpoints

Avoid:

- `any`
- Overengineering
- Premature abstractions
- Complex patterns
- Unnecessary libraries
- Enterprise architecture
- Code comments
- Tests

Do not add comments to code unless I explicitly ask.

Do not write tests until I explicitly ask near the end of the project.

## Backend

Use NestJS.

Suggested modules:

- auth
- users
- tweets
- follows
- likes
- feed

Use JWT auth for protected routes.

Hash passwords before saving them.

Keep controllers and services simple.

Suggested models:

User:
- id
- username
- passwordHash
- createdAt

Tweet:
- id
- content
- authorId
- parentTweetId nullable
- createdAt

Follow:
- followerId
- followingId
- createdAt

Like:
- userId
- tweetId
- createdAt

## Frontend

Use React with React Router.
Use Dark Theme

Suggested routes:

- /register
- /login
- /feed
- /profile/:username
- /tweet/:id

Use functional components and React hooks.

Keep state management simple.

Do not add global state libraries unless clearly necessary.

Use a small API client wrapper for backend requests.

Use protected routes for authenticated pages.

Store the access token on the frontend for now.

Logout should delete the stored token and redirect to `/login`.

## Database

Use PostgreSQL through Docker Compose.

Keep the schema simple.

Use normal migrations if needed by the selected ORM.

Do not add complex seed systems or advanced database patterns unless requested.

## Goal

The goal is learning and clarity, not production readiness.

Always choose the simplest implementation that correctly supports the required features.
