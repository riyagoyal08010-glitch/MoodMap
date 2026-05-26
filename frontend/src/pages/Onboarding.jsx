import { useState, useEffect } from "react";
import MoodIcon from "../components/MoodIcon";

const MOODS = [
  { name: "Happy", val: 9, type: "mood" },
  { name: "Calm", val: 7, type: "mood" },
  { name: "Energetic", val: 8, type: "energy" },
  { name: "Focused", val: 6, type: "focused" },
  { name: "Sad", val: 2, type: "mood" },
  { name: "Anxious", val: 3, type: "mood" }
];
const GOALS = [
  "Track my emotions",
  "Reduce daily stress",
  "Build self-awareness",
  "Improve mental health",
  "Just mindful journaling"
];

export default function Onboarding({ onComplete }) {
  const [profiles, setProfiles] = useState([]);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [error, setError] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mm_profiles");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfiles(Array.isArray(parsed) ? parsed : []);
        // If there are profiles, show profile selector first.
        // Otherwise, show the onboarding form directly.
        if (parsed.length > 0) {
          setShowNewForm(false);
        } else {
          setShowNewForm(true);
        }
      } else {
        setShowNewForm(true);
      }
    } catch {
      setShowNewForm(true);
    }
  }, []);

  const toggleMood = (m) =>
    setSelectedMoods((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m]);

  const handleNext = () => {
    if (step === 0) {
      if (!name.trim() || name.trim().length < 2) {
        setError("Please enter your name (at least 2 characters)");
        return;
      }
      setError("");
      setStep(1);
    } else if (step === 1) {
      if (selectedMoods.length === 0) {
        setError("Pick at least one mood");
        return;
      }
      setError("");
      setStep(2);
    } else {
      if (!selectedGoal) {
        setError("Please select a goal");
        return;
      }
      
      const newProfile = {
        id: name.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
        name: name.trim(),
        moods: selectedMoods,
        goal: selectedGoal,
        joinedAt: new Date().toISOString(),
      };

      // Save to profiles list
      const updatedProfiles = [newProfile, ...profiles.filter(p => p.name.toLowerCase() !== newProfile.name.toLowerCase())];
      localStorage.setItem("mm_profiles", JSON.stringify(updatedProfiles));
      onComplete(newProfile);
    }
  };

  const handleProfileSelect = (profile) => {
    // Bring this profile to the top of the list
    const updatedProfiles = [profile, ...profiles.filter(p => p.id !== profile.id)];
    localStorage.setItem("mm_profiles", JSON.stringify(updatedProfiles));
    onComplete(profile);
  };

  const handleDeleteProfile = (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Remove this profile from your PC? (Your journal history remains intact in backend)")) return;
    const filtered = profiles.filter(p => p.id !== id);
    setProfiles(filtered);
    localStorage.setItem("mm_profiles", JSON.stringify(filtered));
    if (filtered.length === 0) {
      setShowNewForm(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleNext();
  };

  return (
    <div className="landing-container">
      <div className="landing-wrapper">
        
        {/* Left Side: Calligraphy Story Landing */}
        <div className="landing-narrative">
          <div className="landing-brand">
            <h1 className="landing-logo">
              Mood<em>Map</em>
            </h1>
            <p className="landing-motto serif-italic">Your Emotional Cartography</p>
          </div>

          <div className="landing-story">
            <div className="story-block">
              <h2 className="story-title">Map Your Inner Weather</h2>
              <p className="story-desc">
                Journal freely in a beautifully designed workspace. Log your moods, energies, and thoughts, and watch your emotions take visual form.
              </p>
            </div>

            <div className="story-block">
              <h2 className="story-title">AI-Powered Reflections</h2>
              <p className="story-desc">
                Receive deeply intuitive, highly personalized weekly summaries and psychological insights to guide your mindfulness and self-awareness.
              </p>
            </div>

            <div className="story-block">
              <h2 className="story-title">A Secure Personal Haven</h2>
              <p className="story-desc">
                Everything is private, beautifully custom-tailored, and designed to reside seamlessly on your personal machine.
              </p>
            </div>
            
            <p className="story-quote">
              "The mind is a beautiful, winding map... let us navigate it together."
            </p>
          </div>
        </div>

        {/* Right Side: Authentication Portal Card */}
        <div className="onboarding-card glass-panel">
          
          {/* Active Profile Switcher */}
          {!showNewForm && profiles.length > 0 ? (
            <div className="ob-step">
              <div className="ob-header-group">
                <div className="ob-brand-micro">
                  Welcome to Mood<em>Map</em>
                </div>
                <p className="ob-sub">Choose a mind to open on this PC</p>
              </div>

              <div className="profiles-title">Recent Profiles</div>
              <div className="profiles-list">
                {profiles.map((p) => (
                  <div key={p.id} className="profile-item" onClick={() => handleProfileSelect(p)}>
                    <div className="profile-info">
                      <div className="profile-avatar">{p.name[0].toUpperCase()}</div>
                      <div>
                        <div className="profile-name">{p.name}</div>
                        <div className="profile-goal-tag">{p.goal}</div>
                      </div>
                    </div>
                    <button 
                      className="profile-delete-btn" 
                      onClick={(e) => handleDeleteProfile(e, p.id)}
                      title="Remove profile"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="profile-divider">Or begin a new journey</div>

              <button 
                className="ob-btn" 
                style={{ background: "transparent", color: "var(--rose)", border: "2px solid var(--rose)", boxShadow: "none" }}
                onClick={() => { setShowNewForm(true); setStep(0); }}
              >
                Create New Profile →
              </button>
            </div>
          ) : (
            /* Onboarding Steps */
            <div className="ob-step">
              <div className="ob-header-group">
                <div className="ob-brand-micro">
                  Mood<em>Map</em>
                </div>
                <div className="ob-dots">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`ob-dot${step >= i ? " ob-dot-active" : ""}`} />
                  ))}
                </div>
              </div>

              {/* Step 0 — Name */}
              {step === 0 && (
                <div className="ob-step">
                  <h1 className="ob-title serif-italic">Enter the Map</h1>
                  <p className="ob-sub">Let's create a beautiful, private space for your thoughts.</p>
                  
                  <div className="ob-field">
                    <label className="ob-label">What is your name?</label>
                    <input
                      className="ob-input"
                      placeholder="e.g. Riya, Alex..."
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      maxLength={30}
                    />
                  </div>
                  
                  {error && <p className="ob-error">{error}</p>}
                  
                  <button className="ob-btn" onClick={handleNext} disabled={!name.trim()}>
                    Continue →
                  </button>

                  {profiles.length > 0 && (
                    <button 
                      className="ob-btn"
                      style={{ background: "transparent", color: "var(--text-muted)", boxShadow: "none", marginTop: "-0.5rem" }}
                      onClick={() => setShowNewForm(false)}
                    >
                      ← Back to Recent Profiles
                    </button>
                  )}
                </div>
              )}

              {/* Step 1 — Moods */}
              {step === 1 && (
                <div className="ob-step">
                  <h1 className="ob-title serif-italic" style={{display: "flex", alignItems: "center", gap: "8px", justifyContent: "center"}}>Hey {name.trim()} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707"/></svg></h1>
                  <p className="ob-sub">Which moods do you experience most often? Pick all that apply.</p>
                  
                  <div className="ob-mood-grid">
                    {MOODS.map((m) => (
                      <button
                        key={m.name}
                        className={`ob-mood-chip${selectedMoods.includes(m.name) ? " ob-mood-active" : ""}`}
                        onClick={() => { toggleMood(m.name); setError(""); }}
                        style={{display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center"}}
                      >
                        {m.type === "mood" ? (
                          <MoodIcon valence={m.val} size={15} />
                        ) : m.type === "energy" ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        )}
                        {m.name}
                      </button>
                    ))}
                  </div>
                  
                  {error && <p className="ob-error">{error}</p>}
                  
                  <button className="ob-btn" onClick={handleNext} disabled={selectedMoods.length === 0}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2 — Goal */}
              {step === 2 && (
                <div className="ob-step">
                  <h1 className="ob-title serif-italic" style={{display: "flex", alignItems: "center", gap: "8px", justifyContent: "center"}}>Almost there <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></h1>
                  <p className="ob-sub">What is your main goal with MoodMap?</p>
                  
                  <div className="ob-goals">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        className={`ob-goal-item${selectedGoal === g ? " ob-goal-active" : ""}`}
                        onClick={() => { setSelectedGoal(g); setError(""); }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  
                  {error && <p className="ob-error">{error}</p>}
                  
                  <button className="ob-btn" onClick={handleNext} disabled={!selectedGoal}>
                    <span style={{display: "inline-flex", alignItems: "center", gap: "6px"}}>Start journaling <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22C2 22 8 20 12 16C16 12 22 2 22 2C22 2 12 8 8 12C4 16 2 22 2 22Z"/><path d="M12 16L17 11"/><path d="M8 12L11 9"/></svg></span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}