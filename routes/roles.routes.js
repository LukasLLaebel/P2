import express from "express";
import { getAllUsers } from "../middleware/users.middleware.js";
import { getAllPermissions } from "../middleware/permissions.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRoleCreation } from "../middleware/valid-roles.middleware.js";
import * as rolesController from "../controllers/roles.controller.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// main roles route '/roles'
router.get('/', requireAuth, getAllUsers, getAllPermissions, rolesController.renderRolesPage);

router.post('/create', requireAuth, validateRoleCreation, rolesController.createRole);
router.get('/getRolesFromFolder/:id', requireAuth, rolesController.getRolesFromFolder);
router.get('/getUsersWithRole/:id', requireAuth, rolesController.getUsersWithRole);
router.post('/assignRoleToUser', requireAuth, rolesController.assignRoleToUser);
router.post('/editRoleName', requireAuth, rolesController.editRoleName);
router.post('/removeRoleFromUser/:id', requireAuth, rolesController.removeRoleFromUser);
router.post('/deleteRole', requireAuth, rolesController.deleteRole);

export default router;
