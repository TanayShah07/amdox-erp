import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello, I am your AI ERP Assistant.",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const token = localStorage.getItem("token");

    const currentMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: currentMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "No response",
        },
      ]);
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Server error",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center"
      >
        <Bot size={30} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">
                AI ERP Assistant
              </h2>

              <p className="text-xs opacity-80">
                Powered by Gemini AI
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white shadow px-4 py-3 rounded-2xl rounded-bl-md text-sm">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask something..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}