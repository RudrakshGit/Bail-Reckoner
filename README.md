# Bail Reckoner

Rule-based full-stack application to evaluate bail eligibility and manage undertrial records.

## Tech Stack

- Frontend: React + Vite (`client/`)
- Backend: Node.js + Express + MongoDB (`server/`)

## Project Structure

- `client/` - UI and API client code
- `server/` - REST API, controllers, models, routes, seeding

## Local Setup

### 1) Backend

```bash
cd server
npm install
```

Create `server/.env`:

```bash
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
```

Start backend:

```bash
npm run dev
```

### 2) Frontend

```bash
cd client
npm install
```

Create `client/.env` (optional):

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

## Utility Commands

From `server/`:

```bash
npm run seed
```

Seeds legal sections from `server/data/legalSections.json`.

## Deployment

- Backend: Vercel project with root directory `server/`
- Frontend: Vercel project with root directory `client/`
- Set frontend env `VITE_API_BASE_URL` to deployed backend URL (no trailing slash)
