export const handleChat = async (req, res) => {
  try {
    const msg = req.body.message?.toLowerCase().trim() || "";

    // =========================
    // 1. RULE BASED RESPONSES
    // =========================

    if (msg.includes("hello") || msg.includes("hi")) {
      return res.json({
        reply: "👋 Hello! How can I help you today?",
      });
    }

    if (msg.includes("leave")) {
      return res.json({
        reply:
          "📅 You can apply leave from the Leaves section in the dashboard.",
      });
    }

    if (msg.includes("attendance")) {
      return res.json({
        reply:
          "📊 Attendance details are available in the Attendance module.",
      });
    }

    if (msg.includes("payroll")) {
      return res.json({
        reply:
          "💰 Payroll information is available in Payroll section.",
      });
    }

    if (msg.includes("employees")) {
      return res.json({
        reply:
          "👨‍💼 You can manage employees in the Employees section.",
      });
    }

    if (msg.includes("projects")) {
      return res.json({
        reply:
          "📁 Projects are listed in the Projects section.",
      });
    }

    // =========================
    // 2. FREE AI FALLBACK
    // =========================
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer YOUR_HUGGINGFACE_TOKEN`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: req.body.message,
        }),
      }
    );

    const data = await response.json();

    return res.json({
      reply:
        data?.generated_text ||
        "🤖 Sorry, I couldn't understand that.",
    });
  } catch (err) {
    console.log("Chatbot Error:", err);

    return res.status(500).json({
      reply: "⚠️ Server error. Please try again later.",
    });
  }
};