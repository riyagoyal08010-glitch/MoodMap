import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import JournalModal from "./JournalModal";

export default function Layout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryAdded = () => setRefreshKey((k) => k + 1);
  const closeSidebar = () => setSidebarOpen(false);

  const navCls = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  const sideCls = ({ isActive }) => "s-item" + (isActive ? " s-active" : "");

  const initial = user?.name?.[0]?.toUpperCase() || "?";

  return (
    <div className="nm">
      <nav className="topnav">
        <div className="topnav-left">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
          <div className="logo">Mood<em>Map</em></div>
        </div>
        <div className="nav-links">
          <NavLink to="/dashboard" className={navCls}>Dashboard</NavLink>
          <NavLink to="/journal"   className={navCls}>Journal</NavLink>
          <NavLink to="/insights"  className={navCls}>Insights</NavLink>
          <NavLink to="/moodboard" className={navCls}>Mood Board</NavLink>
          <NavLink to="/search"    className={navCls}>Search</NavLink>
        </div>
        <div className="topnav-right">
          <button className="log-btn" onClick={() => setShowModal(true)}>+ Log Mood</button>
          <div className="avatar-menu">
            <div className="nav-avatar" title={user?.name}>{initial}</div>
          </div>
        </div>
      </nav>

      <div className="body-grid">
        {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div>
              <div className="sidebar-name">{user?.name}</div>
              <div className="sidebar-goal">{user?.goal}</div>
            </div>
          </div>
          <div className="sidebar-divider" />
          <NavLink to="/dashboard" className={sideCls} onClick={closeSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle"}}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
          </NavLink>
          <NavLink to="/journal"   className={sideCls} onClick={closeSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle"}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Journal
          </NavLink>
          <NavLink to="/insights"  className={sideCls} onClick={closeSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle"}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Insights
          </NavLink>
          <NavLink to="/moodboard" className={sideCls} onClick={closeSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle"}}><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/></svg>
            Mood Board
          </NavLink>
          <NavLink to="/search"    className={sideCls} onClick={closeSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", verticalAlign: "middle"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search
          </NavLink>
          
          <div className="sidebar-bottom">
            <div className="sidebar-date">
              <div className="date-big">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
              <div className="date-sub">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</div>
            </div>
            <button className="logout-btn" onClick={onLogout}>Sign Out →</button>
          </div>
        </aside>

        <main className="content">
          <Outlet context={{ onLogMood: () => setShowModal(true), refreshKey, user }} />
        </main>
      </div>

      {showModal && (
        <JournalModal onClose={() => setShowModal(false)} onEntryAdded={handleEntryAdded} />
      )}
    </div>
  );
}