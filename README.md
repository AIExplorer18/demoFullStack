# Full Stack Demo (React-style Vite Frontend + Node/Express Backend)

A simple learning project: a website with a button that calls a backend API.
Both parts are deployed separately on Vercel (free Hobby plan).
An optional Neon Postgres database stores the click count.

## Project Structure

```
fullstack-demo/
├── backend/             Express API (runs as a Vercel serverless function)
│   ├── api/index.js     All backend routes
│   ├── vercel.json      Sends every URL to api/index.js
│   └── package.json
└── frontend/            Vite website
    ├── index.html
    ├── src/main.js      Button click -> calls the backend
    ├── .env.example
    └── package.json
```

## How Frontend and Backend Connect

| Setting | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | Frontend env var | Tells the website where the backend lives |
| `FRONTEND_URL` | Backend env var | CORS: only this website may call the API |
| `DATABASE_URL` | Backend env var (optional) | Connects to the Neon database |

## Backend Routes

| Method | Route | What it does |
|---|---|---|
| GET | `/` | Health check |
| GET | `/hello` | Returns a hello message |
| POST | `/click` | Counts a click and returns the total |

## Requirements

- Node.js (LTS) and npm
- Git

## Run Locally

Use two terminals.

**Terminal 1: backend**
```
cd backend
npm install
npm start
```
Opens at http://localhost:3000

**Terminal 2: frontend**
```
cd frontend
npm install
copy .env.example .env      (Mac/Linux: cp .env.example .env)
npm run dev
```
Opens at http://localhost:5173

> Windows PowerShell tip: if `npm` is blocked, use `npm.cmd` instead
> (e.g. `npm.cmd install`).

## Test Locally

1. Open http://localhost:3000 and check that you see `"status":"Backend is running"`.
2. Open http://localhost:5173 and click **Call Backend**.
3. The page should show `Click received by backend! Total clicks: 1`.
4. Watch the backend terminal for log lines, and press F12 in the browser to see the frontend logs.

## Deploy on Vercel

### 1. Deploy the backend
1. Vercel dashboard -> **Add New -> Project** -> import this repo.
2. Set **Root Directory** to `backend`.
3. Click **Deploy** and copy the URL.
4. Open the URL in the browser to test it.

### 2. Deploy the frontend
1. **Add New -> Project** -> import the same repo.
2. Set **Root Directory** to `frontend`.
3. Add the environment variable `VITE_API_URL` = your backend URL (no trailing slash).
4. Click **Deploy** and copy the URL.

### 3. Connect them (CORS)
1. Backend project -> **Settings -> Environment Variables**.
2. Add `FRONTEND_URL` = your frontend URL (no trailing slash).
3. **Deployments -> Redeploy** the backend.

### 4. (Optional) Database
1. Backend project -> **Storage** -> create a **Neon** Postgres database and connect it.
2. This adds `DATABASE_URL` automatically.
3. Redeploy the backend. The root URL should now say `"database":"connected"`.

## Test on Vercel

1. Open the frontend URL and click **Call Backend**.
2. Check the backend logs: backend project -> **Logs**.
3. Open the browser console (F12) to see frontend logs.

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error in console | Check `FRONTEND_URL` (exact URL, no trailing slash) and redeploy the backend |
| Frontend shows `API: NOT SET` | Add `VITE_API_URL` in Vercel and redeploy the frontend |
| Backend URL shows a Vercel login page | Backend project -> Settings -> Deployment Protection -> turn it off |
| Env var change has no effect | Redeploy; variables only apply to new deployments |
| `npm` blocked in PowerShell | Use `npm.cmd`, or run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |