import { useState } from "react";
import { searchEntries } from "../services/api";
import MoodIcon from "../components/MoodIcon";

const SUGGESTIONS = ["felt anxious","productive day","couldn't focus","happy and calm","stressed about work","felt tired"];

function scoreClass(v) { return v>=7?"score-high":v>=4?"score-mid":"score-low"; }

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const doSearch = async (q) => {
    const sq = (q || query).trim();
    if (!sq) return;
    setQuery(sq);
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const data = await searchEntries(sq);
      setResults(data?.results || []);
      setSearched(true);
    } catch { setError("Search failed. Is the backend running?"); }
    finally { setLoading(false); }
  };

  const clear = () => { setQuery(""); setResults([]); setSearched(false); setError(""); };

  return (
    <>
      <div className="page-header">
        <div><h1 className="greeting">Search</h1><p className="greeting-sub">Find past entries semantically with AI</p></div>
      </div>

      <div className="search-wrap">
        <div className="search-bar card" style={{boxShadow: "var(--card-inset-shadow)", border: "1px solid rgba(0, 0, 0, 0.04)", background: "#ffffff"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle", opacity: 0.8}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="e.g. felt anxious before exam..."
            value={query} onChange={(e)=>{setQuery(e.target.value);setError("");}}
            onKeyDown={(e)=>e.key==="Enter"&&doSearch()} />
          {query && <button className="icon-btn" onClick={clear}>✕</button>}
        </div>
        <button className="log-btn" onClick={()=>doSearch()} disabled={loading||!query.trim()}>
          {loading?"Searching...":"Search Map"}
        </button>
      </div>

      {!searched && !loading && (
        <div style={{marginTop: "1rem"}}>
          <p className="card-sub" style={{marginBottom:10}}>Try exploring these feelings:</p>
          <div className="tags-row">
            {SUGGESTIONS.map((s)=><button key={s} className="tag-chip" onClick={()=>doSearch(s)}>{s}</button>)}
          </div>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {searched && (
        <div style={{marginTop: "1.5rem"}}>
          <p className="card-sub">{results.length} reflection{results.length!==1?"s":""} retrieved for "{query}"</p>
          {results.length===0
            ? <div className="empty-state card"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "16px", opacity: 0.8}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p className="empty-msg">No similar entries found in your map.</p></div>
            : <div className="journal-list">
                {results.map((e,i)=>(
                  <div key={i} className="journal-card card">
                    <div className="jc-header">
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <MoodIcon valence={e.valence} size={24} />
                        <div>
                          <div className="jc-date">
                            {(() => {
                              try {
                                return new Date(e.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                              } catch { return e.date; }
                            })()}
                          </div>
                          <span className={`score-badge ${scoreClass(e.valence)}`} style={{marginTop:3,display:"inline-block"}}>Mood {Number(e.valence||0).toFixed(1)}/10</span>
                        </div>
                      </div>
                      <span className="similarity-badge">{Math.round((e.similarity||0)*100)}% match</span>
                    </div>
                    <p className="jc-text">{e.text}</p>
                    {e.summary&&<p className="jc-summary">"{e.summary}"</p>}
                    <div className="entry-tags" style={{marginTop:8}}>
                      {(typeof e.tags==="string"?e.tags.split(","):e.tags||[]).filter(Boolean).map((t)=><span key={t} className="tag-small">{t.trim()}</span>)}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </>
  );
}