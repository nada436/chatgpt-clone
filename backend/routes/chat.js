const express = require("express");
const axios = require("axios");

const chatRoute = express.Router();

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL = "Qwen/Qwen2.5-7B-Instruct";

function buildConversationHistory(messages, reply) {
  const history = Array.isArray(messages) ? [...messages] : [];

  if (reply) {
    history.push({ role: "assistant", content: reply });
  }

  return history;
}

chatRoute.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required.",
      });
    }

    const { data } = await axios.post(
      HF_API_URL,
      {
        model: MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: "No response received from the AI model.",
      });
    }

    const history = buildConversationHistory(messages, reply);

    return res.status(200).json({
      success: true,
      reply,
      history,
    });
  } catch (error) {
    console.error("Hugging Face Error:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to generate response.",
    });
  }
});

chatRoute.buildConversationHistory = buildConversationHistory;

module.exports = chatRoute;
