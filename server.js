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

// 5) Dynamic Styleguide endpoint
app.get("/styleguide", (req, res) => {
  // helper: random hex color
  const randomHex = () => {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
    return `#${hex}`;
  };

  // pick 3–5 font families at random from a list
  const allFonts = [
    "Inter","Roboto","Helvetica Neue","Open Sans",
    "Montserrat","Lato","Source Sans Pro","Poppins"
  ];
  const pickFonts = (n) => {
    const copy = [...allFonts];
    const result = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx,1)[0]);
    }
    return result;
  };
  const [h1Font, h2Font, bodyFont] = pickFonts(3);

  // random theme name
  const themes = ["Aurora", "Midnight", "Sunrise", "Forest", "Desert", "Ocean"];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  // build tokens
  const styleguide = {
    themeName: theme,
    colors: {
      "Primary": randomHex(),
      "Secondary": randomHex(),
      "Accent": randomHex(),
      "Neutral Light": randomHex(),
      "Neutral Dark": randomHex()
    },
    typography: [
      { name: "Heading 1", family: h1Font, style: "Bold", size: 32, lineHeight: 40 },
      { name: "Heading 2", family: h2Font, style: "Bold", size: 24, lineHeight: 32 },
      { name: "Body",      family: bodyFont, style: "Regular", size: 16, lineHeight: 24 }
    ],
    spacing: {
      "XS": 4,
      "S": 8,
      "M": 16,
      "L": 24,
      "XL": 32
    },
    documentation: `
# ${theme} Theme Style Guide

You’re looking at the **${theme}** palette—freshly minted just now.  
- **Colors** generated randomly: play with them or lock in the shades you love.  
- **Type** uses a mix of ${h1Font}, ${h2Font} & ${bodyFont} for hierarchy.  
- **Spacing** follows a 4px base unit.  

Use this as a launchpad: tweak the tokens, remix the docs, and make it yours!  
(Generated at ${new Date().toLocaleString()})
`
  };

  res.json(styleguide);
});

// 4) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
