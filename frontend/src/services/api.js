const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const getUserId = () => localStorage.getItem("mm_user_id") || "riya";

export async function analyzeEntry(text, tags) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, tags, user_id: getUserId() }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${BASE_URL}/history/${getUserId()}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchWeeklySummary() {
  const res = await fetch(`${BASE_URL}/weekly-summary/${getUserId()}`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function searchEntries(query) {
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, user_id: getUserId(), n_results: 5 }),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function deleteEntry(entryId) {
  const res = await fetch(`${BASE_URL}/entry/${entryId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}
