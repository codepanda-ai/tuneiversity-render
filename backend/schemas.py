from pydantic import BaseModel, ConfigDict


class SongResponse(BaseModel):
    id: int
    title_zh: str
    title_en: str
    artist_zh: str
    artist_en: str
    difficulty: str
    youtube_url: str | None

    model_config = ConfigDict(from_attributes=True)
