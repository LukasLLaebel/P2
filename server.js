import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import routes from "./routes/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

// ⭐ ADD SESSION MIDDLEWARE (BEFORE ROUTES)
app.use(session({
  secret: 'your-secret-key-change-this-in-production', // Change this to a random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    httpOnly: true        // Prevents client-side JS from accessing the cookie
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
