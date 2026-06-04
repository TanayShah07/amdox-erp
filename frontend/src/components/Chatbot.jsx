import { useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // SEND MESSAGE FUNCTION
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;

    setChat((prev) => [...prev, { type: "user", text: userMsg }]);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/chatbot/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg }),
        }
      );

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { type: "bot", text: data.reply },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { type: "bot", text: "Server error" },
      ]);
    }
  };

  // ENTER KEY SUPPORT
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* ================= FLOATING ICON ================= */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 25,
          right: 25,
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "white",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          transition: "0.3s",
        }}
        title="Chat with AI"
      >
        {/* PROFESSIONAL CHAT ICON (SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        </svg>
      </div>

      {/* ================= CHAT WINDOW ================= */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 25,
            right: 25,
            width: 340,
            height: 440,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "600",
            }}
          >
            <span>ERP Assistant</span>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* CHAT AREA */}
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              background: "#f3f4f6",
            }}
          >
            {chat.map((c, i) => (
              <div
                key={i}
                style={{
                  textAlign: c.type === "user" ? "right" : "left",
                  margin: "6px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background:
                      c.type === "user" ? "#2563eb" : "#e5e7eb",
                    color: c.type === "user" ? "white" : "black",
                    fontSize: 14,
                  }}
                >
                  {c.text}
                </span>
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div style={{ display: "flex", padding: 8, gap: 6 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}   // 🔥 ENTER KEY ADDED
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                outline: "none",
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}