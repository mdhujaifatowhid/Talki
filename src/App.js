import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const handleLogin = (username) => {
    const id = username.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setUser({ name: username, id });
  };

  return (
    <div className="app">
      {!user
        ? <Login onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />
        : <ChatRoom user={user} theme={theme} toggleTheme={toggleTheme} onLogout={() => setUser(null)} />
      }
    </div>
  );
}

export default App;
