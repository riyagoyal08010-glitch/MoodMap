import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchHistory, deleteEntry } from "../services/api";
import MoodIcon from "../components/MoodIcon";

function scoreClass(v) { return v >= 7 ? "score-high" : v >= 4 ? "score-mid" : "score-low"; }

export default function Journal() {
  const { onLogMood, refreshKey } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchHistory()
      .then((d) => setEntries(d?.entries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeleting(id);
    try {
      await deleteEntry(id);
      setEntries((p) => p.filter((e) => e.entry_id !== id));
    } catch { alert("Could not delete. Try again."); }
    finally { setDeleting(null); }
  };

  const filtered = filter === "all" ? entries
    : filter === "good" ? entries.filter((e) => e.valence >= 7)
    : entries.filter((e) => e.valence < 4);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="greeting">Journal</h1>
          <p className="greeting-sub">{entries.length} reflections recorded</p>
        </div>
        <button className="log-btn" onClick={onLogMood}>+ New Reflection</button>
      </div>

      <div className="filter-tabs">
        {[
          { key: "all", label: "All Reflections", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px", display: "inline-block", verticalAlign: "middle"}}><path d="M9.01 14L2 12l7.01-2L11 3l1.99 7 7.01 2-7.01 2L11 21l-1.99-7z"/></svg> },
          { key: "good", label: "Soothing Days", icon: <MoodIcon valence={9} size={15} style={{marginRight: "6px"}} /> },
          { key: "low", label: "Stormy Days", icon: <MoodIcon valence={2} size={15} style={{marginRight: "6px"}} /> }
        ].map(({ key, label, icon }) => (
          <button key={key} className={`filter-tab${filter===key?" filter-active":""}`} onClick={() => setFilter(key)} style={{display: "inline-flex", alignItems: "center"}}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="empty-msg">Gathering journal pages...</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "16px", opacity: 0.85}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <p className="empty-msg">{entries.length === 0 ? "No records in this diary yet. Write your first page!" : "No reflections match this filter."}</p>
          {entries.length === 0 && <button className="log-btn" onClick={onLogMood} style={{marginTop:12}}>Write First Entry</button>}
        </div>
      )}

      <div className="journal-list">
        {filtered.map((e) => (
          <div key={e.entry_id} className="journal-card card">
            <div className="jc-header">
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <MoodIcon valence={e.valence} size={28} />
                <div>
                  <div className="jc-date">
                    {(() => {
                      try {
                        return new Date(e.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                      } catch { return e.date; }
                    })()}
                  </div>
                  <span className={`score-badge ${scoreClass(e.valence)}`} style={{marginTop:4,display:"inline-block"}}>
                    Mood score: {Number(e.valence||0).toFixed(1)}/10
                  </span>
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => handleDelete(e.entry_id)}
                disabled={deleting === e.entry_id}
                aria-label="Delete entry"
                style={{display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%"}}
              >
                {deleting === e.entry_id ? "..." : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                )}
              </button>
            </div>
            <p className="jc-text">{e.text}</p>
            {e.summary && <p className="jc-summary">"{e.summary}"</p>}
            <div className="entry-tags" style={{marginTop:10}}>
              {(e.tags||[]).filter(Boolean).map((t) => <span key={t} className="tag-small">{t}</span>)}
            </div>
            <div className="jc-scores">
              <span style={{display: "inline-flex", alignItems: "center", gap: "4px"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Energy: {Number(e.energy||0).toFixed(1)}
              </span>
              <span style={{display: "inline-flex", alignItems: "center", gap: "4px"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h6l2 9 4-18 2 9h6"/></svg>
                Stress: {Number(e.stress||0).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}