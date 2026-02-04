index.js
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend alive");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
