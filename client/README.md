# Bail Reckoner Client

React + Vite frontend for the Bail Reckoner project.

## Prerequisites

- Node.js 18+
- Running backend API (local or deployed)

## Environment

Create a `.env` file in `client/` when needed:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

If omitted, the app defaults to `http://localhost:5000`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notes

- API calls are defined in `src/api/api.js`.
- Main UI entry is `src/App.jsx`.
- Global styles are in `src/index.css` and `src/App.css`.
