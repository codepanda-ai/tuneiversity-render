# Tuneiversity - AI-powered Mandarin pronunciation tutor

Frontend (Next.js + Typescript)
---
Setup:
1. `cd frontend`
2. `pnpm install`

Run: `pnpm dev`
Build: `pnpm build`
Lint: `pnpm lint` or `pnpm eslint . --fix`

Backend (FastAPI + Python)
---
Setup:
1. `cd backend`
2. `python3 -m venv myenv`
3. `source myenv/bin/activate`
4. `pip install -r requirements.txt`

Run: `uvicorn main:app --reload --port 8000`
Lint: `ruff check . --fix && ruff format .`

Docker Deployment
---

Verify frontend: `docker build -t tuneiversity-frontend --build-arg API_URL=http://localhost:8000 ./frontend`

Verify backend: `docker build -t tuneiversity-backend ./backend`

Verify full stack: 
1. `docker compose up --build`
2. `docker compose down`
