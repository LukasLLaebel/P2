import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as FilesController from "../controllers/files.controller.js";

const router = express.Router();

// Middleware can go here or directly on the routes
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Routes map cleanly to Controllers
router.get("/getAllFiles/:id", requireAuth, FilesController.getFiles);
router.get("/getFolder/:id", FilesController.getFolder);

export default router;
