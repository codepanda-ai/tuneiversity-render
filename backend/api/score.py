import asyncio
import random
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from services.score_service import score_pronunciation

router = APIRouter(prefix="/api", tags=["score"])


@router.post("/score")
async def score_audio(
    audio: UploadFile = File(...),
    lyrics_zh: str = Form(""),
    lyrics_pinyin: str = Form(""),
    test: Optional[bool] = None,
    session: Optional[str] = None,
) -> dict[str, int]:
    audio_bytes = await audio.read()

    if test is False:
        print("Scoring audio with Gemini...")
        mime_type = audio.content_type or "audio/webm"
        score = await score_pronunciation(
            audio_bytes, mime_type, lyrics_zh, lyrics_pinyin, session
        )
    else:
        print("Generating random test score...")
        await asyncio.sleep(3)
        score = random.randint(0, 100)

    return {"score": score}
