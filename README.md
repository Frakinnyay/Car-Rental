# CarRental – Car Rental Management System

MERN app: **React 19 + Vite + Tailwind 4** client, **Express 5 + MongoDB (Mongoose)** API, images on **ImageKit**.

- **Users**: register/login, browse & search cars, check availability by city/dates, book, see their bookings.
- **Owners**: any signed-in user can click *List cars* to become an owner, then add cars (with photo), toggle availability, remove cars, confirm/cancel bookings and see a dashboard.

```
client/   React SPA (Vite)
server/   REST API  (/api/user, /api/owner, /api/booking)
```

## Requirements
Node.js 20+, a MongoDB database (free [Atlas](https://www.mongodb.com/atlas) cluster or local `mongod`), an [ImageKit](https://imagekit.io) account (needed to upload car photos).

## Local development
```bash
# 1) API
cd server
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, ImageKit keys
npm install
npm run dev                 # http://localhost:3000  (npm start for plain node)

# 2) Client (new terminal)
cd client
cp .env.example .env        # VITE_BASE_URL=http://localhost:3000
npm install
npm run dev                 # http://localhost:5173
```
**Database setup:** nothing to run – collections and indexes are created automatically on first use.
Optional demo data (4 sample cars + an owner account whose credentials you choose):
```bash
cd server
SEED_OWNER_EMAIL=owner@example.com SEED_OWNER_PASSWORD='pick-a-password' npm run seed
```
(Sample images are served from `client/public/demo-cars`, so they show when the client is on the same site you browse.)

## Environment variables
See `server/.env.example` and `client/.env.example` (every variable is documented there). In production `JWT_SECRET` must be ≥ 32 chars and `CLIENT_URL` must list your client origin(s).

## Scripts
| Where | Command | Purpose |
|---|---|---|
| server | `npm start` / `npm run dev` | run API / run with nodemon |
| server | `npm test` | integration tests (needs a MongoDB; `TEST_MONGODB_URI` optional, default `mongodb://127.0.0.1:27017`; uses a throw-away DB; Node 22+) |
| server | `npm run seed` | optional demo data |
| client | `npm run dev` / `npm run build` / `npm run lint` | dev server / production build (`dist/`) / ESLint |

## Business rules
- Price = `pricePerDay × days`; a same-day rental counts as 1 day; max 365 days.
- Dates are inclusive: a car returned on the 12th cannot be picked up by someone else on the 12th.
- Pending and confirmed bookings block a car; cancelled ones don't. A cancelled booking can't be re-opened.
- Pickup can't be in the past (one day of time-zone grace).
- "Delete car" hides the car and detaches it from its owner but keeps it so booking history still displays.

## API (all JSON, `Authorization: Bearer <token>`)
`POST /api/user/register|login` · `GET /api/user/data` · `GET /api/user/cars` ·
`POST /api/booking/check-availablity` · `POST /api/booking/create-booking` · `GET /api/booking/user-booking` ·
owner only: `GET /api/booking/owner-booking` · `POST /api/booking/booking-status` ·
`POST /api/owner/change-role` · `POST /api/owner/uploadcar` (multipart) · `GET /api/owner/cars` · `POST /api/owner/toggle-car|delete-car` · `GET /api/owner/dashboard` · `POST /api/owner/update-image`.
Errors use `{ success:false, message }` with proper HTTP status codes.

## Deployment (recommended: Vercel ×2 + MongoDB Atlas)
1. **Atlas**: create a free cluster, a database user, and under *Network Access* allow `0.0.0.0/0` (Vercel has no fixed IPs). Copy the connection string → `MONGODB_URI`.
2. **API project** (Vercel → *Add New Project* → import repo, **Root Directory = `server`**, Framework *Other*). Env vars: `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET` (32+ random chars), `IMAGEKIT_*`, `NODE_ENV=production`, `CLIENT_URL` (fill after step 3). Deploy; check `https://<api>.vercel.app/health` → `{"success":true,"status":"ok"}`.
3. **Client project** (Root Directory = `client`, Framework *Vite*; build `npm run build`, output `dist`). Env vars: `VITE_BASE_URL=https://<api>.vercel.app`, `VITE_CURRENCY=$`. Deploy (`client/vercel.json` already rewrites all routes to the SPA).
4. Set `CLIENT_URL` on the API project to the client URL (no trailing slash) and redeploy the API.
5. Verify: open the client URL, register, open `/cars`, book a car. Image upload limit is 4 MB (Vercel's body limit).

Any Node host works too (Render/Railway/Fly): `cd server && npm ci && npm start`, serve `client/dist` from any static host.
