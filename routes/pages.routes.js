import express from "express";
import { syncUserFolders, searchFolders } from "../services/users.service.js";
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
  if (req.session?.user) return res.redirect("/all");
  res.render("login");
});

router.post("/login", authenticateUser, (req, res) => {
  res.redirect("/all");
});

router.get("/all", requireAuth, syncUserFolders, getFoldersForUser("all"),
  (req, res) => {
    res.render("main", {
      title: "All Files",
      user: req.session.user,
      userFolders: req.userFolders,
      currentUser: req.currentUser,
    });
  }
);

router.get("/shared", requireAuth, syncUserFolders, getFoldersForUser("shared"),
  (req, res) => {
    res.render("main", {
      title: "Shared Files",
      user: req.session.user,
      userFolders: req.userFolders,
      currentUser: req.currentUser,
    });
  }
);

router.get("/owned", requireAuth, syncUserFolders, getFoldersForUser("owned"),
  (req, res) => {
    res.render("main", {
      title: "My Files",
      user: req.session.user,
      userFolders: req.userFolders,
      currentUser: req.currentUser,
    });
  }
);

router.get("/files", requireAuth, (req, res) => {
  res.render("files", { user: req.session.user });
});

// IMPORTANT: call the factory: getFoldersForUser()
router.get("/folders/search", requireAuth, getFoldersForUser("all"), (req, res) => {
  const searchText = req.query.q;
  const searchedFolders = searchFolders(req.userFolders, searchText);
  res.json({ folders: searchedFolders });
});

router.post("/logout", (req, res) => {
  logout(req, res);
});

export default router;
