import express from "express";
const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Import auth routes
import authRoutes from './routes/auth.routes.js';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/shared', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/shared_with_me.html'));
});




app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
