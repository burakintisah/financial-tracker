# Financial Tracker

Personal finance tracking application for monitoring accounts, investments, and financial snapshots over time.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router v6 (routing)
- Axios (HTTP client)

### Backend
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL database)

### Deployment
- Vercel (automatic deployment via GitHub integration)

## Project Structure

```
financial-tracker/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express + TypeScript
├── package.json       # Root workspace configuration
├── vercel.json        # Vercel deployment config
└── DEPLOYMENT.md      # Deployment guide
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/financial-tracker.git
cd financial-tracker
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Available Scripts

### Root Level
| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend and backend |
| `npm run dev:fe` | Run frontend only |
| `npm run dev:be` | Run backend only |
| `npm run build` | Build both projects |
| `npm run build:fe` | Build frontend only |
| `npm run build:be` | Build backend only |
| `npm run install:all` | Install all dependencies |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT
