import random

from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from schemas import SongResponse, VerseResponse
from services.song_service import SongService
from services.verse_service import VerseService

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


@app.get("/api/songs/{song_id}")
def get_song(song_id: int, db: Session = Depends(get_db)) -> SongResponse:
    return SongService(db).get_song_by_id(song_id)


@app.get("/api/verses/{verse_id}")
def get_verse(verse_id: int, db: Session = Depends(get_db)) -> VerseResponse:
    return VerseService(db).get_verse_by_id(verse_id)


@app.get("/api/songs/{song_id}/verses/{verse_order}")
def get_verse_by_song_order(
    song_id: int, verse_order: int, db: Session = Depends(get_db)
) -> VerseResponse:
    return VerseService(db).get_verse_by_song_order(song_id, verse_order)


@app.post("/api/score")
async def score_audio(audio: UploadFile = File(...)) -> dict[str, int]:
    # Drain the upload to avoid uvicorn body warnings (mock — contents not used)
    await audio.read()
    return {"score": random.randint(0, 100)}
