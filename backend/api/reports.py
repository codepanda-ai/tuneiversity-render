from fastapi import APIRouter

from schemas import ReportResponse
from services.report_service import ReportService

router = APIRouter(prefix="/api/songs", tags=["reports"])


@router.post("/{song_id}/report", response_model=ReportResponse)
def generate_report(song_id: int, session: str) -> ReportResponse:
    return ReportService().get_report(song_id, session)


@router.get("/{song_id}/report", response_model=ReportResponse)
def get_report(song_id: int, session: str) -> ReportResponse:
    return ReportService().get_report(song_id, session)
