const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const PORT = process.env.PORT || 5000;

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlandı ✅"))
  .catch(err => console.log("Mongo HATA ❌:", err));

// Schema
const QuestionSchema = new mongoose.Schema({
  question: String,
  extra: String,
  answer: String
}, { timestamps: true });

const Question = mongoose.model("Question", QuestionSchema);

// ✅ GROQ API
app.post("/api/ask", async (req, res) => {
  try {
    const { question, extra } = req.body;

    console.log("AI geliyor...");

    let answer = "";

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { role: "user", content: question + " " + (extra || "") }
        ],
       model: "llama-3.1-8b-instant"
      });

      answer = chat.choices[0].message.content;

    } catch (err) {
      console.log("AI HATA:", err.message);
      answer = "Groq çalışmıyor ⚠️";
    }

    // Mongo kayıt
    const newData = new Question({
      question,
      extra,
      answer
    });

    await newData.save();

    res.json({ answer });

  } catch (err) {
    res.json({ answer: "Sunucu hatası ❌" });
  }
});

app.listen(PORT, () => {
  console.log("Server çalışıyor 🚀");
});