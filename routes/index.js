import express from "express";
import pageRoutes from "./pages.routes.js";
import rolesRoutes from "./roles.routes.js";

const router = express.Router();

// Mount all route modules
router.use("/", pageRoutes);
router.use("/roles", rolesRoutes);

export default router;
