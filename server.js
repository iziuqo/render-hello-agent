const express = require("express");
const app = express();

app.get("/agent", (req, res) => {
  res.json({ response: "Hello, world!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
