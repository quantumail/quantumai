const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== TEST ROUTES (404 ÇÖZER) =====
app.get("/", (req, res) => {
  res.send("QuantumAI API çalışıyor 🚀");
});

app.get("/api/ask", (req, res) => {
  res.send("API çalışıyor ✅ (GET test)");
});

// ===== GROQ =====
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ===== PORT =====
const PORT = process.env.PORT || 5000;

// ===== MONGO (HATA VERSE BİLE ÇALIŞSIN) =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlandı ✅"))
  .catch(err => console.log("Mongo HATA ❌:", err.message));

// ===== SCHEMA =====
const QuestionSchema = new mongoose.Schema({
  question: String,
  extra: String,
  answer: String
}, { timestamps: true });

const Question = mongoose.model("Question", QuestionSchema);

// ===== ANA API =====
app.post("/api/ask", async (req, res) => {
  try {
    const { question, extra } = req.body;

    if (!question) {
      return res.json({ answer: "Soru boş ❌" });
    }

    console.log("AI isteği geldi...");

    let answer = "";

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { role: "user", content: question + " " + (extra || "") }
        ],
        model: "llama-3.1-8b-instant"
      });

      answer = chat.choices?.[0]?.message?.content || "Cevap alınamadı";

    } catch (err) {
      console.log("GROQ HATA:", err.message);
      answer = "AI geçici olarak çalışmıyor ⚠️";
    }

    // 🔥 MONGO KAYIT (İSTERSEN AÇ)
    try {
      const newData = new Question({ question, extra, answer });
      // await newData.save(); // İSTERSEN AÇ
    } catch (err) {
      console.log("Mongo kayıt hatası:", err.message);
    }

    res.json({ answer });

  } catch (err) {
    console.log("GENEL HATA:", err.message);
    res.json({ answer: "Sunucu hatası ❌" });
  }
});

// ===== SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server çalışıyor 🚀 PORT:", PORT);
});