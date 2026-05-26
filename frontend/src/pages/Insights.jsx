import { useState, useEffect } from "react";
import { fetchHistory, fetchWeeklySummary } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Insights() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHistory(), fetchWeeklySummary()])
      .then(([h, s]) => { setEntries(h?.entries || []); setSummary(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...entries].reverse().slice(-14).map((e) => ({
    date: e.date?.slice(5) || "",
    Mood: Number(e.valence || 0).toFixed(1),
    Energy: Number(e.energy || 0).toFixed(1),
    Stress: Number(e.stress || 0).toFixed(1),
  }));

  const tagCount = {};
  entries.forEach((e) => (e.tags || []).filter(Boolean).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const dist = { great: 0, good: 0, okay: 0, low: 0 };
  entries.forEach((e) => {
    if (e.valence >= 8) dist.great++;
    else if (e.valence >= 6) dist.good++;
    else if (e.valence >= 4) dist.okay++;
    else dist.low++;
  });

  if (loading) return <p className="empty-msg" style={{ padding: "2rem" }}>Loading insights...</p>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="greeting">Insights</h1>
          <p className="greeting-sub">Patterns from {entries.length} entries</p>
        </div>
      </div>

      {entries.length < 2 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📊</div>
          <p className="empty-msg">Log at least 2 entries to see insights.</p>
        </div>
      ) : (
        <>
          {/* Line Chart */}
          <div className="card neu">
            <div className="card-title">Mood · Energy · Stress Trends</div>
            <div className="card-sub">Last 14 entries logged</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,107,148,0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                  axisLine={{ stroke: "rgba(236,107,148,0.2)" }}
                  tickLine={{ stroke: "rgba(236,107,148,0.2)" }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                  axisLine={{ stroke: "rgba(236,107,148,0.2)" }}
                  tickLine={{ stroke: "rgba(236,107,148,0.2)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg)",
                    border: "none",
                    borderRadius: 16,
                    fontSize: 12,
                    boxShadow: "6px 6px 16px var(--sd), -6px -6px 16px var(--sl)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                <Line type="monotone" dataKey="Mood"   stroke="var(--pink)"              strokeWidth={2.5} dot={{ r: 4, fill: "var(--pink)" }}              activeDot={{ r: 6 }} animationDuration={900} />
                <Line type="monotone" dataKey="Energy" stroke="rgba(236,107,148,0.6)"    strokeWidth={2.5} dot={{ r: 4, fill: "rgba(236,107,148,0.6)" }}    activeDot={{ r: 6 }} animationDuration={900} />
                <Line type="monotone" dataKey="Stress" stroke="rgba(180,120,140,0.7)"    strokeWidth={2.5} dot={{ r: 4, fill: "rgba(180,120,140,0.7)" }}    activeDot={{ r: 6 }} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mid-row">
            {/* Mood Distribution */}
            <div className="card neu">
              <div className="card-title">Mood Distribution</div>
              <div className="card-sub">All-time metrics</div>
              {[
                { label: "😊 Great (8-10)", count: dist.great },
                { label: "🙂 Good (6-7)",   count: dist.good  },
                { label: "😐 Okay (4-5)",   count: dist.okay  },
                { label: "😔 Low (0-3)",    count: dist.low   },
              ].map(({ label, count }) => {
                const max = Math.max(dist.great, dist.good, dist.okay, dist.low, 1);
                const pct = entries.length ? Math.round((count / entries.length) * 100) : 0;
                return (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, marginBottom:5 }}>
                      <span style={{ color:"var(--text)", fontWeight:500 }}>{label}</span>
                      <span style={{ color:"var(--pink)", fontWeight:700 }}>{count} · {pct}%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{
                        width: `${(count / max) * 100}%`,
                        background: `rgba(236,107,148,${0.25 + (count / max) * 0.65})`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Tags */}
            <div className="card neu">
              <div className="card-title">Top Activity Tags</div>
              <div className="card-sub">Most frequently used</div>
              {topTags.length === 0
                ? <p className="empty-msg">No tags recorded yet.</p>
                : topTags.map(([tag, count]) => (
                  <div key={tag} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span className="tag-small" style={{ minWidth:72, textAlign:"center" }}>{tag}</span>
                    <div className="bar-bg" style={{ flex:1 }}>
                      <div className="bar-fill" style={{
                        width: `${(count / (topTags[0]?.[1] || 1)) * 100}%`,
                        background: "var(--pink)",
                      }} />
                    </div>
                    <span style={{ fontSize:11, color:"var(--muted)", minWidth:16, fontWeight:600 }}>{count}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Weekly Summary */}
          {summary && (
            <div className="card neu">
              <div className="card-title" style={{ color:"var(--pink)" }}>✦ Weekly Reflection</div>
              <p className="ai-text" style={{ marginTop:8 }}>{summary.summary}</p>
              {summary.pattern && (
                <p className="pattern-text" style={{ marginTop:10 }}>
                  <span className="pattern-label">Pattern: </span>{summary.pattern}
                </p>
              )}
              <div className="emotions-row" style={{ marginTop:10 }}>
                {(summary.dominant_emotions || []).map((e) => (
                  <span key={e} className="emotion-pill">{e}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}