from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import VerseResponse
from services.verse_service import VerseService

router = APIRouter(prefix="/api/verses", tags=["verses"])


@router.get("/{verse_id}")
def get_verse(verse_id: int, db: Session = Depends(get_db)) -> VerseResponse:
    return VerseService(db).get_verse_by_id(verse_id)
