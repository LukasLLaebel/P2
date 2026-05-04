import express from "express";
import { syncUserFolders } from "../services/users.service.js";
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
<<<<<<< rolesExpansion
});

router.post("/login", authenticateUser, (req, res) => {
  res.redirect('/all');
});

router.get('/all', requireAuth, getAllUsers, syncUserFolders, (req, res) => {
  res.render('all-files', {
    user: req.session.user
  });
});


router.get('/files', (req, res) => {
  res.render('../views/files.ejs', {
    user: req.session.user
  });
=======
});

router.post("/login", authenticateUser, (req, res) => {
  res.redirect('/all');
});
>>>>>>> main

router.get('/all', requireAuth, getAllUsers, syncUserFolders, (req, res) => {
  res.render('all-files', {
    user: req.session.user
  });
});

<<<<<<< rolesExpansion
=======

>>>>>>> main
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


router.post('/logout', (req, res) => {
  logout(req, res);
});

export default router;
