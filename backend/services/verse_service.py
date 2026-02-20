from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models import Verse
from schemas import VerseResponse


class VerseService:
    def __init__(self, db: Session):
        self.db = db

    def get_verse_by_id(self, verse_id: int) -> VerseResponse:
        verse = self.db.query(Verse).filter(Verse.id == verse_id).first()
        if verse is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Verse {verse_id} not found",
            )
        return VerseResponse.model_validate(verse)

    def get_verse_by_song_order(self, song_id: int, order: int) -> VerseResponse:
        verse = (
            self.db.query(Verse)
            .filter(Verse.song_id == song_id, Verse.verse_order == order)
            .first()
        )
        if verse is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Verse with song_id={song_id} and verse_order={order} not found",
            )
        return VerseResponse.model_validate(verse)
