import express from "express";
import pageRoutes from "./pages.routes.js";
import rolesRoutes from "./roles.routes.js";
import sharesRoutes from "./shares.routes.js";
import folderRoutes from "./folder.routes.js";
import filesRoutes from "./files.routes.js";

const router = express.Router();

// Mount all route modules
router.use("/", pageRoutes);
router.use("/files", filesRoutes);
router.use("/roles", rolesRoutes);
router.use("/shares", sharesRoutes);
router.use("/folders", folderRoutes);

export default router;
