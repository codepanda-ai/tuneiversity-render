import os
import random
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Any

app = FastAPI(title="Tuneiversity API")

public_api_url = os.getenv("NEXT_PUBLIC_API_URL", "")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", public_api_url],
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


@app.post("/api/score")
async def score_audio(audio: UploadFile = File(...)) -> dict[str, int]:
    # Drain the upload to avoid uvicorn body warnings (mock — contents not used)
    await audio.read()
    return {"score": random.randint(0, 100)}
