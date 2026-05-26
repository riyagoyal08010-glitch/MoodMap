from pydantic import BaseModel
from typing import Optional
from datetime import date

class JournalEntryRequest(BaseModel):
    text: str
    tags: list[str] = []
    user_id: str = "default"

class MoodAnalysis(BaseModel):
    valence: float       # 0-10, overall positivity
    energy: float        # 0-10
    stress: float        # 0-10
    emotions: list[str]
    summary: str         # one-line mood summary
    pattern_insight: str # RAG-powered: references past entries
    suggestion: str      # what helped before, or new tip
    emoji: str

class JournalEntryResponse(BaseModel):
    entry_id: str
    date: str
    text: str
    tags: list[str]
    analysis: MoodAnalysis

class EntryRecord(BaseModel):
    entry_id: str
    date: str
    text: str
    tags: list[str]
    valence: float
    energy: float
    stress: float
    summary: str
    emoji: str

class HistoryResponse(BaseModel):
    entries: list[EntryRecord]

class WeeklySummaryResponse(BaseModel):
    summary: str
    avg_valence: float
    avg_energy: float
    avg_stress: float
    dominant_emotions: list[str]
    pattern: str

class SearchRequest(BaseModel):
    query: str
    user_id: str = "default"
    n_results: int = 5
