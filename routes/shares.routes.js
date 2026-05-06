import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as SharesController from "../controllers/shares.controller.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/files", SharesController.getFiles);
router.get("/usersFromFile/:id", requireAuth, SharesController.getUsersFromFile);
router.get("/getFolderOwner/:id", SharesController.getFolderOwner);

router.post("/useradd", requireAuth, SharesController.addUser);
router.post("/userrem", requireAuth, SharesController.removeUser);

export default router;
