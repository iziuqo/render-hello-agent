const express = require("express");
const cors    = require("cors");
const OpenAI  = require("openai");
const path    = require("path");      // ← new

const app = express();
app.use(cors());

// serve our chat UI
app.use(express.static(path.join(__dirname, 'public')));  // ← new

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/agent", async (req, res) => {
  try {
    const prompt = req.query.q || "Say hello!";
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    const text = completion.choices[0].message.content.trim();
    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
