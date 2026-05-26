import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchHistory, fetchWeeklySummary } from "../services/api";
import Heatmap from "../components/Heatmap";

function tod() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function scoreClass(v) { return v >= 7 ? "score-high" : v >= 4 ? "score-mid" : "score-low"; }

export default function Dashboard() {
  const { onLogMood, refreshKey, user } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchHistory(), fetchWeeklySummary()])
      .then(([h, s]) => { setEntries(h?.entries || []); setSummary(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="greeting">Good {tod()}, <span className="serif-italic">{user?.name}</span> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{display: "inline-block", verticalAlign: "middle", marginLeft: "6px"}}><path d="M2 22C2 22 8 20 12 16C16 12 22 2 22 2C22 2 12 8 8 12C4 16 2 22 2 22Z"/><path d="M12 16L17 11"/><path d="M8 12L11 9"/></svg></h1>
          <p className="greeting-sub">How is your emotional landscape today?</p>
        </div>
        <button className="log-btn" onClick={onLogMood}>+ Log Mood</button>
      </div>

      <div className="stats-row">
        {[
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <path d="M9 9c.5-.5 1.5-.5 2 0" />
                <path d="M13 9c.5-.5 1.5-.5 2 0" />
              </svg>
            ),
            val: summary?.avg_valence,
            label: "avg mood",
            cls: "ic-sage"
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            ),
            val: summary?.avg_energy,
            label: "avg energy",
            cls: "ic-clay"
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ),
            val: summary?.avg_stress,
            label: "stress level",
            cls: "ic-rose"
          },
        ].map(({ icon, val, label, cls }) => (
          <div key={label} className="stat-card card">
            <div className={`stat-icon ${cls}`} style={{display: "inline-flex", alignItems: "center", justifyContent: "center"}}>{icon}</div>
            <div className="stat-val">{loading ? "..." : val != null ? Number(val).toFixed(1) : "—"}</div>
            <div className="stat-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Mood Calendar</div>
        <div className="card-sub">Last 5 weeks · Hover for details</div>
        <Heatmap entries={entries} />
      </div>

      <div className="card ai-card">
        <div className="card-title" style={{color: "var(--rose)", display: "flex", alignItems: "center", gap: "6px"}}>
          ✦ Weekly Reflection
        </div>
        <div className="card-sub">AI generated insights</div>
        {loading ? <p className="empty-msg">Synthesizing insights...</p> :
         !summary ? <p className="empty-msg">Write some journal entries to receive your weekly reflection.</p> : (
          <>
            <p className="ai-text">{summary.summary || "Keep journaling to get your weekly summary!"}</p>
            {summary.pattern && (
              <p className="pattern-text" style={{marginTop:12}}>
                <span className="pattern-label">Pattern detected: </span>{summary.pattern}
              </p>
            )}
            <div className="emotions-row" style={{marginTop:12}}>
              {(summary.dominant_emotions || []).map((e) => <span key={e} className="emotion-pill">{e}</span>)}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">Recent Entries</div>
        <div className="card-sub">{entries.length} total logged</div>
        {loading ? <p className="empty-msg">Loading entries...</p> :
          entries.length === 0 ? <p className="empty-msg" style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"}}>Your map is empty — log a mood to begin! <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22C2 22 8 20 12 16C16 12 22 2 22 2C22 2 12 8 8 12C4 16 2 22 2 22Z"/><path d="M12 16L17 11"/><path d="M8 12L11 9"/></svg></p> :
         entries.slice(0, 5).map((e) => (
          <div key={e.entry_id} className="entry-row">
            <div className="entry-date">
              {(() => {
                try {
                  return new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                } catch { return e.date; }
              })()}
            </div>
            <div className="entry-body">
              <p className="entry-text">{(e.text || "").slice(0, 120)}{(e.text || "").length > 120 ? "..." : ""}</p>
              {e.summary && <p className="jc-summary" style={{fontSize: "1.2rem", marginTop: "4px"}}>"{e.summary}"</p>}
              <div className="entry-tags">
                {(e.tags || []).filter(Boolean).map((t) => <span key={t} className="tag-small">{t}</span>)}
              </div>
            </div>
            <div className={`score-badge ${scoreClass(e.valence)}`}>{Number(e.valence||0).toFixed(0)}/10</div>
          </div>
        ))}
      </div>
    </>
  );
}