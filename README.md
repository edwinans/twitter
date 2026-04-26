# Twitter Clone

A simple Twitter-like app built with NestJS backend and React frontend.

## Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL (Docker)

## Running

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173
Backend runs on http://localhost:3000
