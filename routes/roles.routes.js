import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const rolesFilePath = path.join(__dirname, '../db/auth.json');

router.get('/', (req, res) => {
  const view = req.query.view || 'display';
  res.render('../views/roles.ejs', {
    user: "Jeff",
    folder: "Folder 1",
    currentView: view
  });
});

router.put('/create', (req, res) => {
  try {
    const { role, 'add-users': addUsers, permission } = req.body;

    // Read the current auth.json
    const authData = JSON.parse(fs.readFileSync(rolesFilePath, 'utf-8'));

    // Generate new role ID
    const maxRoleId = Math.max(...authData.roles.map(r => r.id), 0);
    const newRoleId = maxRoleId + 1;

    // Create the new role object
    const newRole = {
      id: newRoleId,
      name: role,
      permissions: permission
    };

    // Add role to roles array
    authData.roles.push(newRole);

    // Add role to each user's share
    // Get the folder from the GET route (you may need to pass this from frontend)
    const folderName = "Folder 1"; // or pass from request

    addUsers.forEach(username => {
      const user = authData.users.find(u => u.username === username);
      if (user) {
        // Find or create the share for this folder
        let userShare = user.shares.find(s => s.name === folderName);

        if (!userShare) {
          // Create new share if it doesn't exist
          const maxShareId = Math.max(...authData.shares.map(s => s.id), 0);
          userShare = {
            id: maxShareId + 1,
            name: folderName,
            roles: []
          };
          user.shares.push(userShare);
        }

        // Add role if not already present
        if (!userShare.roles.includes(role)) {
          userShare.roles.push(role);
        }
      }
    });

    // Write updated auth.json back to file
    fs.writeFileSync(rolesFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Role created successfully',
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
