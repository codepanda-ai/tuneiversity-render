from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Any

app = FastAPI(title="Tuneiversity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_SONGS: list[dict[str, Any]] = [
    {
        "id": "1",
        "title": "小幸运",
        "artist": "田馥甄 (Hebe Tien)",
        "album": "我的少女时代 OST",
        "difficulty": "intermediate",
        "language": "zh",
    },
    {
        "id": "2",
        "title": "晴天",
        "artist": "周杰伦 (Jay Chou)",
        "album": "叶惠美",
        "difficulty": "beginner",
        "language": "zh",
    },
    {
        "id": "3",
        "title": "夜曲",
        "artist": "周杰伦 (Jay Chou)",
        "album": "十一月的萧邦",
        "difficulty": "advanced",
        "language": "zh",
    },
]


@app.get("/api/songs")
async def get_songs() -> list[dict[str, Any]]:
    return MOCK_SONGS
