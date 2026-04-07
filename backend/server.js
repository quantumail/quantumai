const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test routes
app.get("/", (req, res) => {
  res.send("QuantumAI API çalışıyor 🚀");
});

app.get("/api/ask", (req, res) => {
  res.send("API çalışıyor ✅ (GET test)");
});

// Port
const PORT = process.env.PORT || 5000;

// Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log("GROQ KEY VAR MI:", !!process.env.GROQ_API_KEY);
// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlandı ✅"))
  .catch((err) => console.log("Mongo HATA ❌:", err.message));

// Soru kayıt şeması
const QuestionSchema = new mongoose.Schema(
  {
    question: String,
    extra: String,
    answer: String,
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", QuestionSchema);

// Kullanıcı limit şeması
const UserSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// Ana AI endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { question, extra } = req.body;

    if (!question) {
      return res.json({ answer: "Soru boş ❌" });
    }

    // 🔥 API KEY kontrol
    if (!process.env.GROQ_API_KEY) {
      return res.json({ answer: "API key yok ❌" });
    }

    // 🔥 AI
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
      console.log("GROQ HATA:", err.message);
      return res.json({ answer: "AI geçici olarak çalışmıyor ⚠️" });
    }

    res.json({ answer });

  } catch (err) {
    console.log("GENEL HATA:", err.message);
    res.json({ answer: "Sunucu hatası ❌" });
  }
});
  try {
    const { question, extra } = req.body;

    if (!question) {
      return res.json({ answer: "Soru boş ❌" });
    }

    // 🔥 API KEY KONTROL
    if (!process.env.GROQ_API_KEY) {
      return res.json({ answer: "API key yok ❌" });
    }

    // 🔥 AI İSTEĞİ
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
      console.log("GROQ HATA:", err.message);
      return res.json({ answer: "AI geçici olarak çalışmıyor ⚠️" });
    }

    // 🔥 MONGO KAPALI
    // await newData.save();

    res.json({ answer });

  } catch (err) {
    console.log("GENEL HATA:", err.message);
    res.json({ answer: "Sunucu hatası ❌" });
  }
});
  try {
    const { question, extra } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ answer: "Soru boş olamaz ❌" });
    }

    // Kullanıcı IP al
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown";

    // Kullanıcıyı bul / oluştur
    
    // API key kontrol
   if (!process.env.GROQ_API_KEY) {
  return res.json({ answer: "API key yok ❌" });
}

const chat = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `${question} ${extra || ""}`.trim(),
          },
        ],
        model: "llama-3.1-8b-instant",
      });

      answer =
        chat?.choices?.[0]?.message?.content ||
        "Cevap alınamadı ⚠️";
    } catch (err) {
      console.log("GROQ HATA ❌:", err.message);
      return res.json({
        answer: "AI geçici olarak çalışmıyor ⚠️",
      });
    }

    // Soru-cevap kaydı
    try {
      const newData = new Question({
        question,
        extra,
        answer,
      });
      // await newData.save();
    } catch (err) {
      console.log("Mongo kayıt hatası ❌:", err.message);
    }

    return res.json({ answer });
  } catch (err) {
    console.log("GENEL SUNUCU HATASI ❌:", err.message);
    return res.status(500).json({
      answer: "Sunucu hatası ❌",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server çalışıyor 🚀 PORT: ${PORT}`);
});