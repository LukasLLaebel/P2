import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const DBFilePath = path.join(__dirname, '../db/auth.json');

// Loads My Files page with all folders for the authenticated user
router.get('/', requireAuth, (req, res) => {
  const view = req.query.view || 'display';

  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

  res.render('../views/my-files.ejs', {
    user: req.session?.user?.username,
    folder: authData.shares,
    currentView: view
  });
});

// Creates the new folder
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { folder } = req.body;

    // Validates input name
    if (!folder || folder.trim() === "") {
      return res.status(400).json({
        success: false,
        message: 'Folder name cannot be empty'
      });
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Checks that "shares" exists
    if (!authData.shares) {
      authData.shares = [];
    }

    // Generates new "shares" ID
    const maxShareId = Math.max(...authData.shares.map(s => s.id), 0);
    const newShareId = maxShareId + 1;

    // Defines owner as current authenticated user
    const owner = req.session?.user?.username;
    const users = [owner];

    // Finds all permissions
    const allPermissions = authData.permissions.map(p => p.name);

    // Creates new folder
    const newShare = {
      id: newShareId,
      name: folder.trim(),
      path: `./shares/${owner}/${folder.trim()}`,
      owner: owner,
      users: [owner],
      files: [],
      roles: [{
        id: 1, 
        name: "owner", 
        permissions: allPermissions
      }]
    };

    authData.shares.push(newShare);

    // Adds folder to filesystem
    const sharesPath = path.join(process.cwd(), 'shares');
    const userFolderPath = path.join(sharesPath, owner);
    const newFolderPath = path.join(userFolderPath, folder.trim());
    await fs.promises.mkdir(userFolderPath, { recursive: true });
    await fs.promises.mkdir(newFolderPath, { recursive: true });
    
    // Adds folder to the user in auth.json
    if (users && Array.isArray(users)) {
      users.forEach(username => {
        if (!newShare.users.includes(username)) {
          newShare.users.push(username);
        }
        let user = authData.users.find(u => u.username === username);
        if (!user) return
        if (!user.shares) user.shares = [];
        let userShare = user.shares.find(s => s.id === newShareId);
        if (!userShare) {
          userShare = {
            id: newShareId,
            name: folder.trim(),
            owner: owner,
            roles: ["owner", 1]
          };
          user.shares.push(userShare);
        }
      });
    }

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Folder created successfully',
      folder: newShare
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating folder',
      error: error.message
    });
  }

});

export default router;
