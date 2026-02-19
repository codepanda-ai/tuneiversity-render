import random

from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from schemas import SongResponse
from services.song_service import SongService

app = FastAPI(title="Tuneiversity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/songs")
def get_songs(db: Session = Depends(get_db)) -> list[SongResponse]:
    return SongService(db).get_all_songs()


@app.post("/api/score")
async def score_audio(audio: UploadFile = File(...)) -> dict[str, int]:
    # Drain the upload to avoid uvicorn body warnings (mock — contents not used)
    await audio.read()
    return {"score": random.randint(0, 100)}
