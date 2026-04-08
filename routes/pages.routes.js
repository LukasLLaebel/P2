import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get('/all', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/all-files.html'));
});

router.get("/shared", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/shared_with_me.html"));
});

router.get('/owned', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/my-files.html'));
});

router.get('/roles', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/make-roles.html'));
});

export default router;
