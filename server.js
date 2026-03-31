const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));


app.get("/auth", (req, res) => {
  const freshAuth = JSON.parse(fs.readFileSync("auth.json", "utf-8"));
  res.json(freshAuth);
});

app.listen(5173, () => {
  console.log("Running on http://localhost:5173");
});

