# SpendWise

SpendWise is an expense tracking app with:

- **ASP.NET Core Web API** backend (`SpendWiseApi/SpendWiseApi`)
- **React + TypeScript + Tailwind CSS** frontend (`frontend`)

## Backend setup

```bash
cd SpendWiseApi/SpendWiseApi
# restore + run
 dotnet run
```

By default, the API runs on:

- `http://localhost:5275`
- `https://localhost:7029`

Main endpoints:

- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/analyze`

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api/*` calls to `http://localhost:5275`.

## How frontend and backend connect

- The frontend uses `fetch('/api/expenses')` and `fetch('/api/expenses/analyze')`.
- Vite proxy forwards these requests to the backend.
- Backend CORS is enabled for `http://localhost:5173`.
