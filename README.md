# Rep - Workout Tracker

A modern, social workout tracking app built with React Native and Expo. Track your workouts, share your progress, and connect with other fitness enthusiasts.

## Features

### Workouts

- Record sets, reps and weights, with the sets from your last workout as
  suggestions
- Start a workout from a routine
- Browse and edit your history, with personal records for weight, volume
  and estimated one-rep max
- See the records and progress of each exercise
- Import your workouts from Strong

### Social

- Follow people and see their workouts in your friends feed
- Give kudos, and get push notifications for follows and kudos

### App

- Sign in with a code sent to your email
- Light, dark and system themes

## Tech Stack

- **Mobile**: React Native, Expo, Expo Router, uniwind, TanStack Query,
  Zustand
- **API**: Fastify, tRPC, Drizzle with Postgres, better-auth, pg-boss
- **Shared**: zod schemas and personal record logic in `packages/shared`

## Development

The repo is a pnpm workspace:

- `apps/mobile`: the Expo app
- `packages/api`: the Fastify + tRPC + Drizzle API
- `packages/shared`: code that the app and the API share

Copy `docker/.env.example` to `docker/.env` and `packages/api/.env.example` to `packages/api/.env`, then:

```bash
pnpm install
pnpm --filter @rep/api exec drizzle-kit migrate  # with the database up
pnpm dev   # Postgres, pgAdmin and mailpit in Docker, then the API and Metro in tmux
pnpm down  # stops all of it
```

Sign-in codes go to mailpit at http://localhost:8026.

## Author

Simon Manzler

- GitHub: [@smanzler](https://github.com/smanzler)
- LinkedIn: [Simon Manzler](https://linkedin.com/in/simonmanzler)

## Show your support

Give a ⭐️ if this project helped you!
