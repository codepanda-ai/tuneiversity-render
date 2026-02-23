from schemas import ReportResponse, SuggestedSong

_SUGGESTED_SONGS = [
    SuggestedSong(
        id=2,
        title_zh="月亮代表我的心",
        title_en="The Moon Represents My Heart",
        artist_zh="邓丽君",
    ),
    SuggestedSong(
        id=3,
        title_zh="告白气球",
        title_en="Love Confession",
        artist_zh="周杰伦",
    ),
    SuggestedSong(
        id=4,
        title_zh="晴天",
        title_en="Sunny Day",
        artist_zh="周杰伦",
    ),
]


def _feedback(score: int) -> tuple[list[str], list[str]]:
    """Return (positives, improvements) based on score. Mirrors getFeedback() in song-report.tsx."""
    if score >= 85:
        return (
            [
                "Strong tone accuracy throughout",
                "Clear pronunciation on most syllables",
            ],
            ["Refine rising tones (Tone 2)", "Work on syllable-final consonants"],
        )
    return (
        ["Good effort and persistence", "Some syllables pronounced correctly"],
        [
            "Start with slower practice songs",
            "Review fundamental tone rules",
            "Practice individual syllables before full lines",
            "Listen to native pronunciation more frequently",
        ],
    )


class ReportService:
    def get_report(self, song_id: int, session_id: str) -> ReportResponse:
        # Mock: fixed score of 72 until real scoring service is wired in
        score = 72
        positives, improvements = _feedback(score)
        return ReportResponse(
            song_id=song_id,
            session_id=session_id,
            overall_score=score,
            positives=positives,
            improvements=improvements,
            suggested_songs=_SUGGESTED_SONGS,
        )
