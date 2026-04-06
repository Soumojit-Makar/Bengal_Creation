import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/api";

const names = [
  "Asha", "Rani", "Sima", "Puja", "Anita",
  "Sunita", "Rekha", "Kavita", "Gita", "Mina",
  "Lata", "Nita", "Sita", "Rupa", "Dipa",
  "Tina", "Rita", "Mala", "Bina", "Nisha",
  "Pinky", "Sweety", "Neha", "Pooja", "Kiran",
  "Anu", "Shila", "Babita", "Arpita", "Sonia",
  "Rima"
];

const randomName = names[Math.floor(Math.random() * names.length)];

const WELCOME = `Hello, my name is ${randomName}. I’m here to assist you. How may I help you today?`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      // Build history for context (skip welcome message)
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const { answer } = await sendChatMessage(q, history,randomName);
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please try again or contact info@digitalindian.co.in" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const s = {
    fab: { position: "fixed", bottom: 28, right: 28, zIndex: 9999, width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--maroon-dark,#6b0f1a), var(--maroon,#8b1a2a))", color: "#fff", border: "none", cursor: "pointer", fontSize: 26, boxShadow: "0 4px 20px rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" },
    window: { position: "fixed", bottom: 100, right: 28, zIndex: 9998, width: 360, maxHeight: 520, background: "#fff", borderRadius: 18, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1.5px solid #eee" },
    header: { background: "linear-gradient(135deg, #6b0f1a, #8b1a2a)", color: "#fff", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 },
    closeBtn: { background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1 },
    messages: { flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#fafafa" },
    bubble: (role) => ({
      maxWidth: "82%",
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      background: role === "user" ? "linear-gradient(135deg, #8b1a2a, #6b0f1a)" : "#fff",
      color: role === "user" ? "#fff" : "#333",
      borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      padding: "10px 14px",
      fontSize: 13.5,
      lineHeight: 1.55,
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      border: role === "assistant" ? "1px solid #eee" : "none",
      whiteSpace: "pre-wrap",
    }),
    inputRow: { display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid #eee", background: "#fff" },
    textInput: { flex: 1, border: "1.5px solid #ddd", borderRadius: 10, padding: "9px 13px", fontSize: 14, outline: "none", resize: "none" },
    sendBtn: { background: "linear-gradient(135deg, #8b1a2a, #6b0f1a)", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", fontSize: 18, fontWeight: 700 },
    typing: { alignSelf: "flex-start", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", fontSize: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", border: "1px solid #eee" },
  };

  return (
    <>
      {open && (
        <div style={s.window}>
          <div style={s.header}>
            <div style={s.headerTitle}>
              <span>🪴</span>
              <div>
                <div>Bengal Creations Assistant</div>
                <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>Powered by AI • Always here to help</div>
              </div>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={s.bubble(m.role)}>{m.content}</div>
            ))}
            {loading && <div style={s.typing}>⋯</div>}
            <div ref={bottomRef} />
          </div>

          <div style={s.inputRow}>
            <textarea
              style={s.textInput}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about products, delivery, returns..."
            />
            <button style={s.sendBtn} onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      )}

      <button style={s.fab} onClick={() => setOpen(v => !v)} title="Chat with us">
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
