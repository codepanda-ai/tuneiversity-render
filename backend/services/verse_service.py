from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models import Song, Verse
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

    def get_all_verses_by_song(self, song_id: int) -> list[VerseResponse]:
        song = self.db.query(Song).filter(Song.id == song_id).first()
        if song is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Song {song_id} not found",
            )
        verses = (
            self.db.query(Verse)
            .filter(Verse.song_id == song_id)
            .order_by(Verse.verse_order)
            .all()
        )
        return [VerseResponse.model_validate(v) for v in verses]

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
