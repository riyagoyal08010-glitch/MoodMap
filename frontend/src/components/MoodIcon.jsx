import React from "react";

export default function MoodIcon({ valence, size = 24, className = "" }) {
  const v = Number(valence ?? 5);

  // Set colors and expressions based on valence tier
  let strokeColor = "var(--text-muted)";
  let expression = null;

  if (v >= 8) {
    // Great / Serene (Happy) -> Sage green
    strokeColor = "var(--sage)";
    expression = (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9c.5-.5 1.5-.5 2 0" />
        <path d="M13 9c.5-.5 1.5-.5 2 0" />
      </>
    );
  } else if (v >= 6) {
    // Content / Good -> Ochre orange
    strokeColor = "var(--ochre)";
    expression = (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5 1.5 4 1.5 4-1.5 4-1.5" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
      </>
    );
  } else if (v >= 4) {
    // Okay / Neutral -> Lavender blue
    strokeColor = "var(--lavender)";
    expression = (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </>
    );
  } else {
    // Low / Sad -> Terracotta red
    strokeColor = "var(--terracotta)";
    expression = (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mood-svg-icon ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {expression}
    </svg>
  );
}
