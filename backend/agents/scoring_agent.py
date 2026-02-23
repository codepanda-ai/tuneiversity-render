import os

from config import settings

# Pydantic-settings loads .env.local into the Settings object but NOT into
# os.environ.  ADK's Runner internally creates a google.genai.Client that
# reads GOOGLE_API_KEY from os.environ, so we bridge the gap here.
os.environ.setdefault("GOOGLE_API_KEY", settings.GOOGLE_API_KEY)

from google.adk import Agent, Runner  # noqa: E402
from google.adk.sessions.in_memory_session_service import InMemorySessionService  # noqa: E402

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

session_service = InMemorySessionService()


def make_runner() -> Runner:
    agent = Agent(
        name="pronunciation_scorer",
        model=settings.GEMINI_MODEL,
        instruction=SCORING_INSTRUCTION,
    )
    return Runner(
        app_name=APP_NAME,
        agent=agent,
        session_service=session_service,
    )
