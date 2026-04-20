import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getAllUsers } from "../middleware/users.middleware.js";
import { getAllPermissions } from "../middleware/permissions.middleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const DBFilePath = path.join(__dirname, '../db/auth.json');

router.get('/', getAllUsers, getAllPermissions, (req, res) => {
  const view = req.query.view || 'display';
  res.render('../views/roles.ejs', {
    user: "Jeff",
    allPermissions: req.allPermissions,
    allUsers: req.allUsers,
    folder: "Folder 1",
    currentView: view
  });
});

router.post('/create', (req, res) => {
  try {
    const { role, users, permission } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // static!
    const shareId = 1;
    const shareName = "Folder 1";

    // Find the share
    const share = authData.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    // Generate new role ID
    const maxRoleId = Math.max(...authData.roles.map(r => r.id), 0);
    const newRoleId = maxRoleId + 1;

    // Create new role with permissions
    const newRole = {
      id: newRoleId,
      name: role,
      permissions: permission || []
    };

    authData.roles.push(newRole);

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

export default router;
