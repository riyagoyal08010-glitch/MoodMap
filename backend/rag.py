import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

# Load embedding model once at startup
print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded.")

# Persistent ChromaDB client
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection(
    name="mood_entries",
    metadata={"hnsw:space": "cosine"}
)


def embed(text: str) -> list[float]:
    return embedder.encode(text).tolist()


def store_entry(
    entry_id: str,
    text: str,
    tags: list[str],
    user_id: str,
    valence: float,
    energy: float,
    stress: float,
    summary: str,
    emoji: str,
):
    """Embed and store a journal entry in ChromaDB."""
    embedding = embed(text)
    collection.add(
        ids=[entry_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[{
            "user_id": user_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tags": ",".join(tags),
            "valence": valence,
            "energy": energy,
            "stress": stress,
            "summary": summary,
            "emoji": emoji,
        }]
    )


def retrieve_similar(text: str, user_id: str, n_results: int = 5) -> list[dict]:
    """Retrieve top-k most similar past entries for RAG context."""
    total = collection.count()
    if total == 0:
        return []

    embedding = embed(text)
    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(n_results, total),
        where={"user_id": user_id},
        include=["documents", "metadatas", "distances"]
    )

    entries = []
    for i, doc in enumerate(results["documents"][0]):
        meta = results["metadatas"][0][i]
        entries.append({
            "text": doc,
            "date": meta.get("date", ""),
            "tags": meta.get("tags", ""),
            "valence": meta.get("valence", 5),
            "energy": meta.get("energy", 5),
            "stress": meta.get("stress", 5),
            "summary": meta.get("summary", ""),
            "emoji": meta.get("emoji", ""),
            "similarity": 1 - results["distances"][0][i],
        })

    return entries


def get_all_entries(user_id: str) -> list[dict]:
    """Fetch all entries for a user (for history/heatmap)."""
    total = collection.count()
    if total == 0:
        return []

    results = collection.get(
        where={"user_id": user_id},
        include=["documents", "metadatas"]
    )

    ids = results.get("ids", [])
    entries = []
    for i, doc in enumerate(results["documents"]):
        meta = results["metadatas"][i]
        entries.append({
            "entry_id": ids[i] if i < len(ids) else f"entry_{i}",
            "text": doc,
            "date": meta.get("date", ""),
            "tags": meta.get("tags", "").split(",") if meta.get("tags") else [],
            "valence": meta.get("valence", 5),
            "energy": meta.get("energy", 5),
            "stress": meta.get("stress", 5),
            "summary": meta.get("summary", ""),
            "emoji": meta.get("emoji", ""),
        })

    # Sort by date descending
    entries.sort(key=lambda x: x["date"], reverse=True)
    return entries


def search_entries(query: str, user_id: str, n_results: int = 5) -> list[dict]:
    """Semantic search over past entries."""
    return retrieve_similar(query, user_id, n_results)