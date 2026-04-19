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

## Legal sections dataset

`server/data/legalSections.json` is the source for the `LegalSection` MongoDB collection. It is a JSON array of **442** offence rows, each with fields such as `sectionNumber`, `act`, `offenceName`, `category`, `bailable`, and `maxPunishmentYears` (see `server/models/LegalSection.js`).

Those rows cover **6** acts (by the `act` string stored in the file):

| Act | Sections | Notes |
|-----|----------|--------|
| IPC | 379 | Indian Penal Code — largest share of entries. |
| IT Act | 21 | Information technology / cyber-related offences. |
| POCSO Act | 19 | Protection of Children from Sexual Offences Act. |
| NDPS Act | 15 | Narcotic Drugs and Psychotropic Substances Act. |
| SC/ST Act 1989 | 5 | Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act. |
| Foreigners Act 1946 | 3 | Foreign nationals — entry, stay, and document-related offences. |

An older snapshot lives at `server/data/legalSectionsOld.json` (not used by the seed script).

## Deployment

- Backend: Vercel project with root directory `server/`
- Frontend: Vercel project with root directory `client/`
- Set frontend env `VITE_API_BASE_URL` to deployed backend URL (no trailing slash)
