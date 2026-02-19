from sqlalchemy.orm import Session

from models import Song
from schemas import SongResponse


class SongService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_songs(self) -> list[SongResponse]:
        songs = self.db.query(Song).order_by(Song.id).all()
        return [SongResponse.model_validate(song) for song in songs]
