// server.js
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

// pull your key from env
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

app.get("/agent", async (req, res) => {
  try {
    // you can grab a prompt from query params if you like:
    const prompt = req.query.q || "Say hello!";
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    const text = completion.data.choices[0].message.content.trim();
    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
