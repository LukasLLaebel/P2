import express from "express";
import pageRoutes from "./pages.routes.js";

const router = express.Router();

// Mount all route modules
router.use("/", pageRoutes);

export default router;
