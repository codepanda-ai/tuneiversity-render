from datetime import datetime

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title_zh: Mapped[str]
    title_en: Mapped[str]
    artist_zh: Mapped[str]
    artist_en: Mapped[str]
    difficulty: Mapped[str]
    youtube_url: Mapped[str | None]
    created_at: Mapped[datetime]
