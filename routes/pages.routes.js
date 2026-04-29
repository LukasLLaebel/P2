import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { syncUserFolders } from "../services/users.service.js";
import { getAllUsers } from "../middleware/users.middleware.js";
import { getFoldersForUser } from "../middleware/folders-polling.middleware.js";


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
router.use((req, res, next) => {
  res.locals.currentPage = req.path;
  next();
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get('/files', (req, res) => {
  res.render('../views/files.ejs', {
    user: req.user
  });

});

router.get('/all', getAllUsers, syncUserFolders, (req, res) => {
  res.render('../views/all-files.ejs', {
    user: req.user
  });

});

router.get("/shared", (req, res) => {
  res.render('../views/shared-with-me.ejs', {
    user: req.user
  });
});

router.get('/owned', getFoldersForUser, (req, res) => {
  res.render('../views/my-files.ejs', {
    user: req.user,
    userFolders: req.userFolders,
    currentUser: req.currentUser
  });
});


export default router;
