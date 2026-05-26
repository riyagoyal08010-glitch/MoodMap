export default function AISummary({ summary, loading }) {
  if (loading) return (
    <div className="ai-card card">
      <div className="ai-badge">✦ AI weekly summary</div>
      <p className="ai-text" style={{ opacity: 0.5 }}>Generating your summary...</p>
    </div>
  );
  if (!summary) return null;
  return (
    <div className="ai-card card">
      <div className="ai-badge">✦ AI weekly summary</div>
      <p className="ai-text">{summary.summary}</p>
      <div className="score-row">
        {[["mood", summary.avg_valence], ["energy", summary.avg_energy], ["stress", summary.avg_stress]].map(([lbl, val]) => (
          <div key={lbl} className="mini-score">
            <span className="ms-val">{Number(val || 0).toFixed(1)}</span>
            <span className="ms-lbl">{lbl}</span>
          </div>
        ))}
      </div>
      {summary.pattern && (
        <p className="pattern-text"><span className="pattern-label">Pattern: </span>{summary.pattern}</p>
      )}
      <div className="emotions-row">
        {(summary.dominant_emotions || []).map((e) => (
          <span key={e} className="emotion-pill">{e}</span>
        ))}
      </div>
    </div>
  );
}
