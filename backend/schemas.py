from pydantic import BaseModel, ConfigDict


class SuggestedSong(BaseModel):
    id: int
    title_zh: str
    title_en: str
    artist_zh: str


class ReportResponse(BaseModel):
    song_id: int
    session_id: str
    overall_score: int
    positives: list[str]
    improvements: list[str]
    suggested_songs: list[SuggestedSong]


class SongResponse(BaseModel):
    id: int
    title_zh: str
    title_en: str
    artist_zh: str
    artist_en: str
    difficulty: str
    num_verses: int
    youtube_url: str | None

    model_config = ConfigDict(from_attributes=True)


class VerseResponse(BaseModel):
    id: int
    song_id: int
    verse_order: int
    lyrics_zh: str
    lyrics_pinyin: str
    lyrics_en: str | None

    model_config = ConfigDict(from_attributes=True)
