import React, { useState } from "react";

export default function Login({ onLogin, theme, toggleTheme }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) onLogin(name.trim());
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape s1" />
      <div className="login-bg-shape s2" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">💬</div>
            <div>
              <h1>Talki</h1>
              <span>real-time chat</span>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <p className="login-subtitle">
          Enter your name to join — no account needed.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="login-label">Your name</label>
          <input
            className="login-input"
            type="text"
            placeholder="e.g. Hujaifa, Lamya..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <button className="login-btn" type="submit" disabled={name.trim().length < 2}>
            Enter chat →
          </button>
        </form>
      </div>
    </div>
  );
}
