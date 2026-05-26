import { useState } from "react";
import { analyzeEntry } from "../services/api";
import MoodIcon from "./MoodIcon";

const TAGS = ["study","work","social","health","outdoors","exercise","sleep","stress","family","creative"];

export default function JournalModal({ onClose, onEntryAdded }) {
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const toggle = (t) => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await analyzeEntry(text.trim(), tags);
      setResult(data);
      onEntryAdded(data);
    } catch {
      setError("Could not reach backend. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
        {!result ? (
          <>
            <div className="modal-header">
              <h2>How is your mind today?</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
 

            <textarea
  className="journal-textarea neu-in"
  placeholder="Write freely... what's on your mind today?"
  value={text}
  onChange={(e) => setText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !loading) submit();
    }
  }}
  rows={5}
  autoFocus
/>
            <p className="tag-label">Theme your thoughts</p>
            <div className="tags-row">
              {TAGS.map((t) => (
                <button key={t} className={`tag-chip${tags.includes(t) ? " tag-active" : ""}`} onClick={() => toggle(t)}>{t}</button>
              ))}
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="submit-btn" onClick={submit} disabled={loading || !text.trim()}>
              {loading ? "Consulting AI Cartographer..." : "Reveal Insights & Save →"}
            </button>
          </>
        ) : (
          <div className="result-view">
            <div className="result-emoji" style={{display: "flex", justifyContent: "center", marginBottom: "1.5rem"}}>
              <MoodIcon valence={result.analysis?.valence} size={64} />
            </div>
            <p className="result-summary">{result.analysis?.summary}</p>
            <div className="score-grid">
              {[["Mood", result.analysis?.valence], ["Energy", result.analysis?.energy], ["Stress", result.analysis?.stress]].map(([l, v]) => (
                <div key={l} className="score-item">
                  <span className="score-val">{Number(v || 0).toFixed(1)}</span>
                  <span className="score-name">{l}</span>
                </div>
              ))}
            </div>
            <div className="insight-box">
              <p className="insight-label">Mind Wave Insight</p>
              <p className="insight-text">{result.analysis?.pattern_insight}</p>
            </div>
            <div className="suggestion-box">
              <p className="insight-label">Soothe / Mindful Action</p>
              <p className="insight-text">{result.analysis?.suggestion}</p>
            </div>
            <div className="tags-row" style={{justifyContent:"center"}}>
              {(result.analysis?.emotions || []).map((e) => <span key={e} className="emotion-pill">{e}</span>)}
            </div>
            <button className="submit-btn" onClick={onClose}>Done ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}