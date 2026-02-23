from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import SongResponse, VerseResponse
from services.song_service import SongService
from services.verse_service import VerseService

router = APIRouter(prefix="/api/songs", tags=["songs"])


@router.get("")
def get_songs(db: Session = Depends(get_db)) -> list[SongResponse]:
    return SongService(db).get_all_songs()


@router.get("/{song_id}")
def get_song(song_id: int, db: Session = Depends(get_db)) -> SongResponse:
    return SongService(db).get_song_by_id(song_id)


@router.get("/{song_id}/lyrics")
def get_song_lyrics(song_id: int, db: Session = Depends(get_db)) -> list[VerseResponse]:
    return VerseService(db).get_all_verses_by_song(song_id)


@router.get("/{song_id}/verses/{verse_order}")
def get_verse_by_song_order(
    song_id: int, verse_order: int, db: Session = Depends(get_db)
) -> VerseResponse:
    return VerseService(db).get_verse_by_song_order(song_id, verse_order)
