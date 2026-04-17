import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.use((req, res, next) => {
  res.locals.currentPage = req.path;
  next();
});


router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get('/all', (req, res) => {
  res.render('../views/all-files.ejs', {
    user: req.user
  });
});

router.get("/shared", (req, res) => {
  res.render('../views/shared-with-me.ejs', {
    user: req.user
  });
});

router.get('/owned', (req, res) => {
  res.render('../views/my-files.ejs', { user: req.user });
});

router.get('/roles', (req, res) => {
  const view = req.query.view || 'display'; // 'display' or 'create'
  res.render('../views/roles.ejs', {
    user: "Jeff",
    folder: "Folder 1",
    currentView: view
  });
});

export default router;
