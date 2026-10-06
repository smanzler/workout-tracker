# Rep - Workout Tracker

A modern, social workout tracking app built with React Native and Expo. Track your workouts, share your progress, and connect with other fitness enthusiasts.

## Features

### Workout Management

- Create and customize workouts
- Track sets, reps, and weights
- Efficient keyboard navigation between sets
- Real-time progress tracking

### Social Features

- Public/Private profile options
- Follow other users
- Share your workouts
- Discover workouts from the community

### Modern UI/UX

- Dark/Light theme support
- Smooth animations
- Intuitive gesture controls
- Clean, minimalist design

### Privacy & Security

- Customizable privacy settings
- Secure authentication
- Zero-tolerance policy for objectionable content
- Follow request system for private profiles

## Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: React Query, WatermelonDB, Zustand
- **Backend**: Supabase
- **UI Components**: Custom components with native feel
- **Authentication**: Supabase Auth

## Development

The repo is a pnpm workspace:

- `apps/mobile`: the Expo app
- `packages/api`: the Fastify + tRPC + Drizzle API

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
