from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.reports import router as reports_router
from api.score import router as score_router
from api.songs import router as songs_router
from api.verses import router as verses_router

app = FastAPI(title="Tuneiversity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(songs_router)
app.include_router(verses_router)
app.include_router(reports_router)
app.include_router(score_router)
