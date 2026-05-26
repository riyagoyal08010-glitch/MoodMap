from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid

from models import (
    JournalEntryRequest,
    JournalEntryResponse,
    HistoryResponse,
    WeeklySummaryResponse,
    SearchRequest,
)
from rag import store_entry, retrieve_similar, get_all_entries, search_entries
from claude_service import analyze_entry, generate_weekly_summary

app = FastAPI(title="MoodMap RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "MoodMap API running"}


@app.post("/analyze", response_model=JournalEntryResponse)
async def analyze(req: JournalEntryRequest):
    """
    Main endpoint: takes a journal entry, runs RAG retrieval,
    sends to Claude for analysis, stores result in ChromaDB.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Journal entry cannot be empty")

    # 1. Retrieve similar past entries (RAG)
    past_entries = retrieve_similar(req.text, req.user_id, n_results=5)

    # 2. Analyze with Claude using retrieved context
    analysis = analyze_entry(req.text, req.tags, past_entries)

    # 3. Store new entry in ChromaDB
    entry_id = f"{req.user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
    store_entry(
        entry_id=entry_id,
        text=req.text,
        tags=req.tags,
        user_id=req.user_id,
        valence=analysis.valence,
        energy=analysis.energy,
        stress=analysis.stress,
        summary=analysis.summary,
        emoji=analysis.emoji,
    )

    return JournalEntryResponse(
        entry_id=entry_id,
        date=datetime.now().strftime("%Y-%m-%d"),
        text=req.text,
        tags=req.tags,
        analysis=analysis,
    )


@app.get("/history/{user_id}", response_model=HistoryResponse)
async def history(user_id: str):
    """Fetch all entries for heatmap + journal history."""
    entries = get_all_entries(user_id)
    return HistoryResponse(entries=entries)


@app.get("/weekly-summary/{user_id}", response_model=WeeklySummaryResponse)
async def weekly_summary(user_id: str):
    """AI-generated weekly summary using last 7 entries."""
    all_entries = get_all_entries(user_id)
    recent = all_entries[:7]  # already sorted by date desc
    summary_data = generate_weekly_summary(recent)
    return WeeklySummaryResponse(**summary_data)


@app.post("/search")
async def search(req: SearchRequest):
    """Semantic search over past entries."""
    results = search_entries(req.query, req.user_id, req.n_results)
    return {"results": results}


@app.delete("/entry/{entry_id}")
async def delete_entry(entry_id: str):
    """Delete a specific entry."""
    from rag import collection
    try:
        collection.delete(ids=[entry_id])
        return {"deleted": entry_id}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
