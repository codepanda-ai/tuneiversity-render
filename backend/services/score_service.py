import json
import os
import re
import uuid

from config import settings

# Pydantic-settings loads .env.local into the Settings object but NOT into
# os.environ.  ADK's Runner internally creates a google.genai.Client that
# reads GOOGLE_API_KEY from os.environ, so we bridge the gap here.
os.environ.setdefault("GOOGLE_API_KEY", settings.GOOGLE_API_KEY)

from google.adk import Agent, Runner  # noqa: E402
from google.adk.sessions.in_memory_session_service import InMemorySessionService  # noqa: E402
from google.genai import types  # noqa: E402

_session_service = InMemorySessionService()
APP_NAME = "tuneiversity"

SCORING_INSTRUCTION = """You are a Mandarin Chinese pronunciation expert.
The user will send you an audio recording of someone reading Chinese text aloud,
along with the reference text (Chinese characters and pinyin) they were asked to read.

Evaluate how accurately the user's pronunciation matches the reference text.
Consider tone accuracy, clarity of each syllable, and overall fluency.

Score the pronunciation on a scale of 0 to 100:
- 90–100: Near-native, all tones correct, clear articulation
- 70–89: Good pronunciation, minor tone or clarity errors
- 50–69: Understandable but noticeable tone/clarity issues
- 30–49: Significant pronunciation problems
- 0–29: Very difficult to understand

Respond with ONLY a valid JSON object and no other text: {"score": <integer 0-100>}"""


def _make_agent() -> Agent:
    return Agent(
        name="pronunciation_scorer",
        model=settings.GEMINI_MODEL,
        instruction=SCORING_INSTRUCTION,
    )


async def score_pronunciation(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    lyrics_zh: str = "",
    lyrics_pinyin: str = "",
) -> int:
    agent = _make_agent()
    runner = Runner(
        app_name=APP_NAME,
        agent=agent,
        session_service=_session_service,
    )

    user_id = "scorer"
    session_id = str(uuid.uuid4())  # fresh session per request

    await _session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
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
        session_id=session_id,
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
