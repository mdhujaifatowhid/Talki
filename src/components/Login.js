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
              <span>Real-time chat</span>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <p className="login-subtitle">
          তোমার নাম দাও — কোনো account লাগবে না।<br />
          সরাসরি chat এ ঢুকে যাও।
        </p>
        <form onSubmit={handleSubmit}>
          <label className="login-label">তোমার নাম</label>
          <input
            className="login-input"
            type="text"
            placeholder="যেমন: Rahim, Karim..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <button className="login-btn" type="submit" disabled={name.trim().length < 2}>
            Chat এ যাও →
          </button>
        </form>
      </div>
    </div>
  );
}
