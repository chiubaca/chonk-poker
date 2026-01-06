# Chonk Poker 😼

Realtime multiplayer planning poker built with TanStack, Drizzle ORM, and Cloudflare D1 and Durable Objects

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Configure the following environment variables in your `.env` file:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_d1_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
```

## Database Setup

This project uses Cloudflare D1 with Drizzle ORM. The database commands are:

### Database Commands

```bash
# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to the database
pnpm db:migrate

# Pull schema from existing database
pnpm db:pull

# Open Drizzle Studio for database management
pnpm db:studio

# Generate Better Auth schema
pnpm db:auth:generate
```

### Initial Database Setup

1. Create a D1 database in your Cloudflare dashboard
2. Add the database credentials to your `.env` file
3. Generate the initial schema:

```bash
pnpm db:generate
pnpm db:migrate
```

## Local Development

To run the application in development mode:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Building & Deployment

### Local Build

To build this application for production:

```bash
pnpm build
```

### Cloudflare Deployment

To deploy to Cloudflare Pages:

```bash
pnpm deploy
```

This will build the application and deploy it using Wrangler.

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
pnpm lint      # Run linting
pnpm format    # Format code
pnpm check     # Run both linting and formatting checks
```

## Tech Stack

- **Framework**: TanStack Router + React
- **Database**: Cloudflare D1 with Drizzle ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS with DaisyUI
- **State Management**: TanStack Query + XState
- **Testing**: Vitest + Testing Library
- **Code Quality**: Biome (linting & formatting)
- **Deployment**: Cloudflare Workers
