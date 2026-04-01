const express = require("express");
const app = express();
const path = require("path");

// Import auth routes
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount the /auth endpoint
app.use('/auth', authRoutes);

app.listen(5173, () => {
  console.log("Running on http://localhost:5173");
});
