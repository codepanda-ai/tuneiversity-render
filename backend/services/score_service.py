import json
import re
import uuid
from typing import Optional

from google.genai import types

from agents.scoring_agent import APP_NAME, make_runner, session_service


async def score_pronunciation(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    lyrics_zh: str = "",
    lyrics_pinyin: str = "",
    session_id: Optional[str] = None,
) -> int:
    runner = make_runner()

    user_id = "scorer"
    effective_session_id = session_id or str(uuid.uuid4())

    # Reuse existing ADK session if one exists for this ID; create it on first use
    existing = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=effective_session_id,
    )
    if existing is None:
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=effective_session_id,
        )

    user_message = types.Content(
        role="user",
        parts=[
            types.Part(inline_data=types.Blob(mime_type=mime_type, data=audio_bytes)),
            types.Part(
                text=f"Reference text:\nChinese: {lyrics_zh}\nPinyin: {lyrics_pinyin}"
            ),
        ],
    )

    response_text = ""
    async for event in runner.run_async(
        user_id=user_id,
        session_id=effective_session_id,
        new_message=user_message,
    ):
        if event.author != "user" and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    response_text += part.text

    # Strip markdown code fences if present, then parse JSON
    cleaned = re.sub(r"```(?:json)?|```", "", response_text).strip()
    result = json.loads(cleaned)
    score = int(result["score"])
    return max(0, min(100, score))  # clamp to valid range
