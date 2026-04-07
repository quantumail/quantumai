const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// TEST
app.get("/", (req, res) => {
  res.send("QuantumAI API çalışıyor 🚀");
});

// GROQ
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// API
app.post("/api/ask", async (req, res) => {
  try {
    const { question, extra } = req.body;

    if (!question) {
      return res.json({ answer: "Soru boş ❌" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.json({ answer: "API key yok ❌" });
    }

    const chat = await groq.chat.completions.create({
      messages: [
        { role: "user", content: question + " " + (extra || "") }
      ],
      model: "llama-3.1-8b-instant"
    });

    const answer = chat.choices[0].message.content;

    res.json({ answer });

  } catch (err) {
    console.log("HATA:", err.message);
    res.json({ answer: "Sunucu hatası ❌" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server çalışıyor 🚀");
});