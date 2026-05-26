export default function Heatmap({ entries }) {
  const scoreMap = {};
  (entries || []).forEach((e) => { if (e?.date) scoreMap[e.date] = e.valence; });

  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, score: scoreMap[key] ?? null });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const getColor = (score) => {
    if (score === null) return { bg: "rgba(200,190,185,0.25)", opacity: 1 };
    const intensity = score / 10;
    return {
      bg: `rgba(236, 107, 148, ${0.12 + intensity * 0.82})`,
      opacity: 1,
    };
  };

  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `28px repeat(${weeks.length}, 1fr)`,
        gap: 6,
        width: "100%",
      }}>
        {/* Day labels column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DAY_LABELS.map((d) => (
            <div key={d} style={{
              height: 32,
              display: "flex",
              alignItems: "center",
              fontSize: 9,
              color: "#b0a8a0",
              fontWeight: 500,
              letterSpacing: "0.3px",
            }}>{d}</div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {week.map((day, di) => {
              const { bg } = getColor(day.score);
              return (
                <div
                  key={di}
                  title={day.score !== null ? `${day.date}: mood ${day.score}/10` : `${day.date}: no entry`}
                  style={{
                    height: 32,
                    borderRadius: 10,
                    background: bg,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    cursor: day.score !== null ? "pointer" : "default",
                    boxShadow: day.score !== null
                      ? `2px 2px 6px rgba(236,107,148,${(day.score/10)*0.3}), -2px -2px 6px #ffffff`
                      : "2px 2px 5px #ccc8c2, -2px -2px 5px #ffffff",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#b0a8a0" }}>Low</span>
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((op) => (
          <div key={op} style={{
            width: 14, height: 14, borderRadius: 4,
            background: `rgba(236, 107, 148, ${op})`,
          }} />
        ))}
        <span style={{ fontSize: 10, color: "#b0a8a0" }}>High</span>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(200,190,185,0.25)", marginLeft: 8 }} />
        <span style={{ fontSize: 10, color: "#b0a8a0" }}>No entry</span>
      </div>
    </div>
  );
}