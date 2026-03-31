const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/*
let clients = [];
let scores = {};
let questions = JSON.parse(fs.readFileSync("questions.json", "utf-8"));
let currentQuestion = null;


app.get("/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache"
  });

  clients.push(res);

  sendScoreboard();

  if (!currentQuestion) sendNewQuestion();

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

function sendNewQuestion() {
  currentQuestion = questions[Math.floor(Math.random() * questions.length)];

  clients.forEach(client => {
    client.write(`event: question\n`);
    client.write(`data: ${JSON.stringify(currentQuestion)}\n\n`);
  });
}

function sendScoreboard() {
  clients.forEach(client => {
    client.write(`event: scoretable\n`);
    client.write(`data: ${JSON.stringify(scores)}\n\n`);
  });
}

setInterval(() => {
  sendNewQuestion();
}, 30000);

app.post("/answer", (req, res) => {
  const { username, answer } = req.body;
  if (!currentQuestion) return res.sendStatus(200);

  if (answer === currentQuestion.correct) {
    scores[username] = (scores[username] || 0) + 1;
    sendScoreboard();
    sendNewQuestion();
  }

  res.sendStatus(200);
});
*/

app.listen(5173, () => {
  console.log("Running on http://localhost:5173");
});

