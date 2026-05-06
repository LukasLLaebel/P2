import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { syncUserFolders, searchFolders } from "../services/users.service.js";
import { getAllUsers } from "../middleware/users.middleware.js";
import { getFoldersForUser } from "../middleware/folders-polling.middleware.js";
import { authenticateUser, requireAuth, logout } from "../middleware/auth.middleware.js";

const router = express.Router();


// middleware
router.use((req, res, next) => {
  res.locals.currentPage = req.path;
  res.locals.user = req.session?.user;
  next();
});

router.get("/", (req, res) => {
  if (req.session?.user) {
    return res.redirect('/all');
  }
  res.render('login');
});

router.post("/login", authenticateUser, (req, res) => {
  res.redirect('/all');
});

router.get('/all', requireAuth, getAllUsers, syncUserFolders, (req, res) => {
  res.render('all-files', {
    user: req.session.user
  });
});


router.get('/files', requireAuth, (req, res) => {
  res.render('../views/files.ejs', {
    user: req.session.user
  });
});

router.get("/shared", requireAuth, (req, res) => {
  res.render('shared-with-me', {
    user: req.session.user
  });
});

router.get('/owned', requireAuth, getFoldersForUser, (req, res) => {
  res.render('my-files', {
    user: req.session.user,
    userFolders: req.userFolders,
    currentUser: req.currentUser
  });
});
router.get("/folders/search", getFoldersForUser, (req, res) => {
  const searchText = req.query.q;

  const searchedFolders = searchFolders(req.userFolders, searchText);

  res.json({
    folders: searchedFolders,
  });
});

router.post('/logout', (req, res) => {
  logout(req, res);
});

export default router;
