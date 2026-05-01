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

// 
router.get('/', requireAuth, (req, res) => {
    const view = req.query.view || 'display';

    res.render('../views/my-files.ejs', {
      user: req.session?.user?.username,
      folder: authData.shares,
      currentView: view
    });
  });

router.post('/create', requireAuth, (req, res) => {
    try {
      const { folder } = req.body;
  
      // validate folder
      if (!folder || folder.trim() === "") {
        return res.status(400).json({
          success: false,
          message: 'Folder name cannot be empty'
        });
      }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Check shares exists
    if(!authData.shares) {
      authData.shares = [];
    }

    // Generate new share ID
    const maxShareId = Math.max(...authData.shares.map(s => s.id), 0);
    const newShareId = maxShareId + 1;

    const owner = req.session?.user?.username;
    const users = [owner];

    // Create new share
    const newShare = {
      id: newShareId,
      name: folder.trim(),
      path: `./home/${owner}/${folder.trim()}`,
      owner: owner,
      users: [owner],
      files: []
    };

    authData.shares.push(newShare);
    
    // Process each user
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
            owner: owner
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