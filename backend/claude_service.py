import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from models import MoodAnalysis

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = "llama-3.3-70b-versatile"


def format_past_entries(entries: list[dict]) -> str:
    if not entries:
        return "No past entries yet — this is the user's first entry."
    lines = []
    for e in entries:
        lines.append(
            f"- [{e['date']}] Mood: {e['valence']}/10, Energy: {e['energy']}/10, "
            f"Stress: {e['stress']}/10 | Tags: {e['tags']} | \"{e['text'][:120]}\""
        )
    return "\n".join(lines)


def analyze_entry(today_text: str, tags: list[str], past_entries: list[dict]) -> MoodAnalysis:
    past_context = format_past_entries(past_entries)
    tags_str = ", ".join(tags) if tags else "none"

    prompt = f"""You are MoodMap AI, a compassionate emotional intelligence assistant.

PAST JOURNAL ENTRIES (semantically similar to today's entry):
{past_context}

TODAY'S ENTRY:
"{today_text}"
Tags: {tags_str}

Analyze the emotional state and return ONLY valid JSON, no markdown, no extra text:
{{
  "valence": <float 0-10>,
  "energy": <float 0-10>,
  "stress": <float 0-10>,
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "summary": "<one sentence mood summary>",
  "pattern_insight": "<personalized insight referencing specific past entries and patterns you noticed>",
  "suggestion": "<actionable suggestion based on what has helped this user before, or a new tip>",
  "emoji": "<single most fitting emoji>"
}}

Rules:
- pattern_insight MUST reference patterns from past entries if they exist
- suggestion MUST be specific and actionable
- emotions should be 2-4 precise words
- valence 0=very negative, 10=very positive
- stress 0=very calm, 10=very stressed"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=600,
        response_format={"type": "json_object"},  # Groq supports this — forces valid JSON
    )

    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    return MoodAnalysis(**data)


def generate_weekly_summary(entries: list[dict]) -> dict:
    if not entries:
        return {
            "summary": "No entries this week yet. Start journaling to see your patterns!",
            "avg_valence": 0, "avg_energy": 0, "avg_stress": 0,
            "dominant_emotions": [], "pattern": ""
        }

    avg_valence = round(sum(e["valence"] for e in entries) / len(entries), 1)
    avg_energy  = round(sum(e["energy"]  for e in entries) / len(entries), 1)
    avg_stress  = round(sum(e["stress"]  for e in entries) / len(entries), 1)

    entries_text = "\n".join([
        f"[{e['date']}] Mood:{e['valence']} Energy:{e['energy']} Stress:{e['stress']} "
        f"Tags:{e.get('tags','')} — \"{e['text'][:100]}\""
        for e in entries
    ])

    prompt = f"""You are MoodMap AI. Analyze this week's journal entries and return ONLY valid JSON:

ENTRIES:
{entries_text}

Return:
{{
  "summary": "<2-3 sentence warm, personalized weekly narrative>",
  "dominant_emotions": ["emotion1", "emotion2", "emotion3"],
  "pattern": "<one key behavioral pattern you noticed this week>"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    return {**data, "avg_valence": avg_valence, "avg_energy": avg_energy, "avg_stress": avg_stress}