import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getAllUsers } from "../middleware/users.middleware.js";
import { getAllPermissions } from "../middleware/permissions.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const DBFilePath = path.join(__dirname, '../db/auth.json');

// main roles route '/roles'
router.get('/', requireAuth, getAllUsers, getAllPermissions, (req, res) => {
  const view = req.query.view || 'display';
  res.render('../views/roles.ejs', {
    user: req.session.user,
    allPermissions: req.allPermissions,
    allUsers: req.allUsers,
    folder: req.query.folder,
    currentView: view
  });
});

router.post('/create', (req, res) => {
  try {
    const { role, users, permission, folder } = req.body;

    // Validate role
    if (!role || role.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Role name cannot be empty'
      });
    }

    // Validate folder exists
    if (!folder) {
      return res.status(400).json({
        success: false,
        message: 'Folder ID is required'
      });
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
    const shareId = Number(folder);

    // Find the share FIRST to get the actual name
    const share = authData.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }


    const shareName = share.name;

    // Generate new role ID
    const maxRoleId = Math.max(...share.roles.map(r => r.id), 0);
    const newRoleId = maxRoleId + 1;

    const newRole = {
      id: newRoleId,
      name: role,
      permissions: permission || []
    };

    share.roles.push(newRole);

    // Process each user
    if (users && Array.isArray(users)) {
      users.forEach(username => {
        if (!share.users.includes(username)) {
          share.users.push(username);
        }

        let user = authData.users.find(u => u.username === username);

        let userShare = user.shares.find(s => s.id === shareId);
        if (!userShare) {
          userShare = {
            id: shareId,
            name: shareName,
            roles: []
          };
          user.shares.push(userShare);
        }

        if (!userShare.roles.includes(role)) {
          userShare.roles.push(role);
        }
      });
    }

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role created and assigned successfully',
      role: newRole
    });

  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
});

router.get("/getRolesFromFolder/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);

  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));

  const roles = authData.shares.find(share => share.id === id)?.roles;

  res.json(roles);
});

router.get("/getUsersWithRole/:id", requireAuth, (req, res) => {
  const roleId = Number(req.params.id);

  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));

  const users = authData.users.filter(user => user.shares.some(share => share.roles.some(role => role === roleId)));

  res.json(users);
});

router.post("/assignRoleToUser", requireAuth, (req, res) => {
  try {
    const { role, user, shareId } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    authData.users.find(u => u.username === user).shares.find(s => s.id === shareId).roles.push(authData.shares.find(s => s.id === shareId).roles.find(r => r.name === role).id);

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role assigned successfully',
      role: role
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning role',
      error: error.message
    });
  }
});

router.post("/editRoleName", requireAuth, (req, res) => {
  try {
    const { role, shareId, newRoleName } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    authData.shares.find(s => s.id === shareId).roles.find(r => r.name === role).name = newRoleName;

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role edited successfully',
      role: role
    });

  } catch (error) {
    console.error('Error editing role:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing role',
      error: error.message
    });
  }
});

router.post("/removeRoleFromUser/:id", requireAuth, (req, res) => {
  try {
    const { roleId, user } = req.body;
    const shareId = Number(req.params.id);

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const userObject = authData.users.find(u => u.username === user);
    if (!userObject) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //denne share er specifikt sharen til useren og ikke sharen generelt
    const share = userObject.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({ success: false, message: "Share not found" });
    }

    share.roles = share.roles.filter(r => Number(r) !== Number(roleId));

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role removed successfully',
      role: roleId
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing role',
      error: error.message
    });
  }
});

router.post("/deleteRole", requireAuth, (req, res) => {
  try {
    const { roleId, shareId } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const share = authData.shares.find(s => s.id === Number(shareId));
    if (!share) {
      return res.status(404).json({ success: false, message: "Share not found" });
    }

    share.roles = share.roles.filter(r => r.id !== Number(roleId));

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role deleted successfully',
      role: roleId
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
});

export default router;
