import { GoogleGenerativeAI } from "@google/generative-ai";

export const handleChat = async (req, res) => {
  try {
    const msg = req.body.message?.toLowerCase().trim() || "";

    if (msg.includes("hello") || msg.includes("hi")) {
      return res.json({
        reply: "Hello! How can I help you today?",
      });
    }

    if (msg.includes("leave")) {
      return res.json({
        reply:
          "You can apply leave from the Leaves section.",
      });
    }

    return res.json({
      reply:
        "Chatbot route working successfully.",
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      reply: "Server Error",
    });
  }
};