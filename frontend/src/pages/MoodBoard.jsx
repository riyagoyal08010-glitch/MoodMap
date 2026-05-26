import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchHistory } from "../services/api";
import MoodIcon from "../components/MoodIcon";

const COLORS = {
  high:   { bg:"rgba(255,235,240,0.9)",  border:"rgba(236,107,148,0.2)", text:"#5a3a42", accent:"#e8789a" },
  good:   { bg:"rgba(255,242,245,0.95)", border:"rgba(236,107,148,0.15)",text:"#5a3a42", accent:"#d4899e" },
  okay:   { bg:"rgba(253,248,250,0.95)", border:"rgba(210,185,195,0.25)",text:"#5a3a42", accent:"#b89aa4" },
  low:    { bg:"rgba(250,245,247,0.9)",  border:"rgba(200,180,188,0.2)", text:"#5a3a42", accent:"#a08890" },
  neutral:{ bg:"rgba(252,248,250,0.9)",  border:"rgba(215,200,205,0.2)", text:"#5a3a42", accent:"#b0a0a8" },
};
const HEIGHTS = [180,220,160,240,200,180,260,190,210,170];

function tier(v) { return v>=8?"high":v>=6?"good":v>=4?"okay":v>=2?"low":"neutral"; }
function monthYear(d) { try { return new Date(d).toLocaleDateString("en-US",{month:"long",year:"numeric"}); } catch { return ""; } }

export default function MoodBoard() {
  const { onLogMood, refreshKey } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchHistory().then((d) => setEntries(d?.entries||[])).catch(console.error).finally(()=>setLoading(false));
  }, [refreshKey]);

  const filtered = filter==="all"?entries
    :filter==="high"?entries.filter(e=>e.valence>=8)
    :filter==="good"?entries.filter(e=>e.valence>=6&&e.valence<8)
    :filter==="okay"?entries.filter(e=>e.valence>=4&&e.valence<6)
    :entries.filter(e=>e.valence<4);

  const grouped = {};
  filtered.forEach((e) => { const k=monthYear(e.date); if(!grouped[k])grouped[k]=[]; grouped[k].push(e); });

  return (
    <>
      <div className="page-header">
        <div><h1 className="greeting">Mood Board</h1><p className="greeting-sub">Your emotional landscape, represented visually</p></div>
        <button className="log-btn" onClick={onLogMood}>+ Log Mood</button>
      </div>

      <div className="filter-tabs">
        {[
          { key: "all", label: "All Aspects", val: null },
          { key: "high", label: "Great", val: 9 },
          { key: "good", label: "Good", val: 7 },
          { key: "okay", label: "Okay", val: 5 },
          { key: "low", label: "Low", val: 2 }
        ].map(({ key, label, val }) => (
          <button key={key} className={`filter-tab${filter===key?" filter-active":""}`} onClick={()=>setFilter(key)} style={{display: "inline-flex", alignItems: "center"}}>
            {val === null ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px", display: "inline-block", verticalAlign: "middle"}}><path d="M9.01 14L2 12l7.01-2L11 3l1.99 7 7.01 2-7.01 2L11 21l-1.99-7z"/></svg>
            ) : (
              <MoodIcon valence={val} size={15} style={{marginRight: "6px"}} />
            )}
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="empty-state"><p className="empty-msg">Gathering your board...</p></div>}
      {!loading && filtered.length===0 && (
        <div className="empty-state card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "16px", opacity: 0.85}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p className="empty-msg">Your board is empty right now.</p>
          <button className="log-btn" onClick={onLogMood} style={{marginTop:12}}>Log Your First Mood</button>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <div className="board-month-label">{month}</div>
          <div className="pinterest-grid">
            {items.map((e, i) => {
              const c = COLORS[tier(e.valence)];
              const h = HEIGHTS[i % HEIGHTS.length];
              const isHov = hovered === e.entry_id;
              return (
                <div key={e.entry_id} className="pin-card"
                  style={{background:c.bg, border:`1px solid ${c.border}`, minHeight:h,
                    transform:isHov?"translateY(-4px)":"none",
                    boxShadow:isHov?"0 12px 24px rgba(120, 108, 90, 0.12)":"0 4px 12px rgba(120, 108, 90, 0.04)"}}
                  onMouseEnter={()=>setHovered(e.entry_id)} onMouseLeave={()=>setHovered(null)}>
                  <div className="pin-accent-bar" style={{background:c.accent}} />
                  <div className="pin-header">
                    <span className="pin-emoji" style={{display: "inline-flex", alignItems: "center"}}><MoodIcon valence={e.valence} size={28} /></span>
                    <span className="pin-score" style={{background:c.border,color:c.text}}>{Number(e.valence||0).toFixed(1)}</span>
                  </div>
                  <div className="pin-date" style={{color:c.accent}}>
                    {(() => { try { return new Date(e.date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); } catch { return e.date; }})()}
                  </div>
                  <p className="pin-text" style={{color:c.text}}>{(e.text||"").slice(0,h>210?160:100)}{(e.text||"").length>(h>210?160:100)?"...":""}</p>
                  {e.summary&&h>190&&<p className="pin-summary" style={{color:c.accent}}>"{e.summary}"</p>}
                  <div className="pin-tags">
                    {(e.tags||[]).filter(Boolean).slice(0,3).map((t)=><span key={t} className="pin-tag" style={{background:c.border,color:c.text}}>{t}</span>)}
                  </div>
                  <div className="pin-scores">
                    <span style={{color:c.accent, display: "inline-flex", alignItems: "center", gap: "4px"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      {Number(e.energy||0).toFixed(0)}
                    </span>
                    <span style={{color:c.accent, display: "inline-flex", alignItems: "center", gap: "4px"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h6l2 9 4-18 2 9h6"/></svg>
                      {Number(e.stress||0).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}