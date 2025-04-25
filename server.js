// server.js
const express = require("express");
const cors    = require("cors");
const OpenAI  = require("openai");
const path    = require("path");

const app = express();
app.use(cors());

// 1) Serve static chat UI
app.use(express.static(path.join(__dirname, "public")));

// 2) Chat endpoint
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

// 3) Weather endpoint
app.get("/weather", async (req, res) => {
  try {
    const city   = req.query.city || "London";
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherResp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?` +
      `q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await weatherResp.json();
    if (!weatherResp.ok) {
      return res.status(weatherResp.status).json({ error: data.message });
    }
    const summary =
      `It’s ${data.main.temp.toFixed(1)}°C in ${data.name} ` +
      `with ${data.weather[0].description}.`;
    res.json({ weather: summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
