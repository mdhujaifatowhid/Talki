import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabase/client";

const COLORS = ["#7c6aff","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6"];

function avatarColor(name) {
  let hash = 0;
  for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[Math.abs(hash)];
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "আজ";
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "গতকাল";
  return d.toLocaleDateString("bn-BD");
}

export default function ChatRoom({ user, theme, toggleTheme, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const channelRef = useRef(null);

  // ── Presence + Typing via Supabase Realtime channel ──
  useEffect(() => {
    const channel = supabase.channel("talki-room", {
      config: { presence: { key: user.id } }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).map(arr => arr[0]).filter(Boolean);
        setOnlineUsers(users);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === user.id) return;
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== payload.userId);
          if (payload.typing) return [...filtered, { userId: payload.userId, name: payload.name }];
          return filtered;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: user.name, userId: user.id });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ── Load messages + realtime subscription ──
  useEffect(() => {
    // Initial fetch
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setMessages(data); });

    // Realtime new messages
    const sub = supabase
      .channel("messages-db")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ── Typing broadcast ──
  const broadcastTyping = (typing) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, name: user.name, typing }
    });
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    broadcastTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => broadcastTyping(false), 2000);
  };

  // ── Send message ──
  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    clearTimeout(typingTimerRef.current);
    broadcastTyping(false);

    await supabase.from("messages").insert({
      sender_name: user.name,
      sender_id: user.id,
      text: trimmed,
    });
  }, [text, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Typing label ──
  const typingLabel = typingUsers.length === 1
    ? `${typingUsers[0].name} লিখছে`
    : typingUsers.length > 1
    ? `${typingUsers.slice(0,2).map(u=>u.name).join(", ")} লিখছে`
    : null;

  // ── Group messages by date ──
  const grouped = [];
  let lastDate = null;
  let lastSender = null;

  messages.forEach((msg, i) => {
    const dateLabel = formatDate(msg.created_at);
    if (dateLabel !== lastDate) {
      grouped.push({ type: "divider", label: dateLabel, key: `d-${i}` });
      lastDate = dateLabel; lastSender = null;
    }
    const isSelf = msg.sender_id === user.id;
    const showName = lastSender !== msg.sender_id;
    const showAvatar = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id;
    lastSender = msg.sender_id;
    grouped.push({ type: "msg", msg, isSelf, showName, showAvatar, key: msg.id });
  });

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-logo">Talki</div>
          <div className="online-count">
            <span className="online-dot" />
            {onlineUsers.length} অনলাইন
          </div>
        </div>
        <div className="chat-header-right">
          <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <button className="logout-btn" onClick={onLogout}>বের হও</button>
        </div>
      </div>

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div className="online-users-bar">
          {onlineUsers.map((u) => (
            <div className="user-chip" key={u.userId}>
              <div className="user-avatar" style={{ background: avatarColor(u.name) }}>
                {u.name[0].toUpperCase()}
              </div>
              <div className="user-status-dot" />
              <span className="user-chip-name">{u.name}{u.userId === user.id ? " (তুমি)" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        {grouped.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>এখনো কোনো message নেই। প্রথমটা পাঠাও!</p>
          </div>
        )}
        {grouped.map(item => {
          if (item.type === "divider") return (
            <div className="date-divider" key={item.key}><span>{item.label}</span></div>
          );
          const { msg, isSelf, showName, showAvatar } = item;
          return (
            <div className={`message-row ${isSelf ? "self" : "other"}`} key={item.key}>
              <div className={`msg-avatar ${showAvatar ? "" : "hidden"}`}
                style={{ background: showAvatar ? avatarColor(msg.sender_name) : "transparent" }}>
                {showAvatar ? msg.sender_name[0].toUpperCase() : ""}
              </div>
              <div className="msg-content">
                {showName && !isSelf && <div className="msg-name">{msg.sender_name}</div>}
                <div className="msg-bubble">{msg.text}</div>
                {showAvatar && <div className="msg-time">{formatTime(msg.created_at)}</div>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Typing */}
      <div className="typing-bar">
        {typingLabel && (
          <div className="typing-text">
            <div className="typing-dots"><span /><span /><span /></div>
            {typingLabel}...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-row">
          <textarea
            className="msg-input" rows={1}
            placeholder="message লেখো... (Enter = send)"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!text.trim()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
