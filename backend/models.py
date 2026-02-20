from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


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
    num_verses: Mapped[int]
    youtube_url: Mapped[str | None]
    created_at: Mapped[datetime]

    verses: Mapped[list["Verse"]] = relationship(
        "Verse", back_populates="song", order_by="Verse.verse_order"
    )


class Verse(Base):
    __tablename__ = "verses"

    id: Mapped[int] = mapped_column(primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), nullable=False)
    verse_order: Mapped[int] = mapped_column(nullable=False)
    lyrics_zh: Mapped[str]
    lyrics_pinyin: Mapped[str]
    lyrics_en: Mapped[str | None]
    created_at: Mapped[datetime]

    song: Mapped["Song"] = relationship("Song", back_populates="verses")
