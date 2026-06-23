import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import pool from "../db.js";

const PROJECT_CONTEXT = `
You are an AI assistant for an ERP Management System.

Project Modules:
1. Employee Management
2. Attendance Management
3. Leave Management
4. Payroll Management
5. Project Management
6. Reports & Analytics
7. AI Chatbot

The ERP system helps organizations manage employees, attendance, leaves, payroll, projects and reports from a single platform.

If users ask about the project, explain the ERP system.
If users ask general questions, answer professionally and briefly.
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        reply: "Please enter a message.",
      });
    }

    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage === "hi" ||
      lowerMessage === "hello" ||
      lowerMessage === "hey"
    ) {
      return res.json({
        reply:
          "Hello! Welcome to the ERP Management System. How can I help you today?",
      });
    }

    if (
      lowerMessage.includes("my project") ||
      lowerMessage.includes("about project") ||
      lowerMessage.includes("tell about my project")
    ) {
      return res.json({
        reply:
          "Your project is an ERP Management System that manages Employees, Attendance, Leaves, Payroll, Projects, Reports and includes an AI Chatbot for user assistance.",
      });
    }

    if (
      lowerMessage.includes("how many employees") ||
      lowerMessage.includes("employee count") ||
      lowerMessage.includes("total employees")
    ) {
      const result = await pool.query(
        "SELECT COUNT(*) FROM employees"
      );

      return res.json({
        reply: `There are ${result.rows[0].count} employees in the system.`,
      });
    }

    if (
      lowerMessage.includes("leave") &&
      !lowerMessage.includes("employee")
    ) {
      return res.json({
        reply:
          "You can apply leave through the Leave Management module.",
      });
    }

    if (lowerMessage.includes("attendance")) {
      return res.json({
        reply:
          "Attendance details can be viewed in the Attendance Management module.",
      });
    }

    if (lowerMessage.includes("payroll")) {
      return res.json({
        reply:
          "Payroll information can be viewed in the Payroll Management module.",
      });
    }

    if (lowerMessage.includes("project")) {
      return res.json({
        reply:
          "Project details can be viewed in the Project Management module.",
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: PROJECT_CONTEXT + "\n\nUser: " + message,
      });

      return res.json({
        reply: response.text,
      });
    } catch (error25) {
      console.log(
        "Gemini 2.5 unavailable, trying Gemini 2.0..."
      );

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: PROJECT_CONTEXT + "\n\nUser: " + message,
        });

        return res.json({
          reply: response.text,
        });
      } catch (error20) {
        console.error(
          "Gemini 2.0 also failed:",
          error20
        );

        return res.json({
          reply:
            "I'm currently unable to reach the AI service. Please try again in a few moments.",
        });
      }
    }
  } catch (error) {
    console.error("Chatbot Error:", error);

    return res.status(500).json({
      reply: "Failed to generate response.",
    });
  }
};