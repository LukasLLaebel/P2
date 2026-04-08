import express from "express";
import authRoutes from "./auth.routes.js";
import pageRoutes from "./pages.routes.js";

const router = express.Router();

// Mount all route modules
router.use("/auth", authRoutes);
router.use("/", pageRoutes);

export default router;
