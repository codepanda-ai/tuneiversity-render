Tuneiversity - AI-powered Mandarin pronunciation tutor

Run frontend:
cd frontend && pnpm dev

Run backend:
cd backend && uvicorn main:app --reload --port 8000

Docker:

Verify frontend:
docker build -t tuneiversity-frontend --build-arg API_URL=http://localhost:8000 ./frontend

Verify backend:
docker build -t tuneiversity-backend ./backend

Verify full stack:
docker compose up --build
docker compose down
