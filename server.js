const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000; // Choose the port you want your website to run on

// Serve static files in this directory
app.use(express.static(path.join(__dirname)));

// Optional: Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Static webserver running on http://localhost:${PORT}`);
});
