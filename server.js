import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import routes from "./routes/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');

app.use(session({
  secret: 'vitterligt-genetisk-overlegen', // SALT 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24,
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
