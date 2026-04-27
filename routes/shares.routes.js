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


function getAllFiles(req, res, next) {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
  req.allFiles = authData.shares.map(
    ({ name, id }) => ({ name, id })
  )
  console.log(req.allFiles);
  next();
  return;
}

router.get("/files", (req, res) => {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  const files = authData.shares.map(u => 
    ({name: u.name, id: u.id})
  );

  res.json(files);
});

function getUsersFromFile(req, res, next) {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
  req.getUsersFromFile = authData.shares.map(({ username }) => username);
  console.log(req.getUsersFromFile);
  next();
  return;
}

router.get("/usersFromFile/:id", (req, res) => {
  const id = Number(req.params.id);

  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  
  const filteredUsers = authData.users.filter(user => 
    user.shares.some (share => share.id === id)
  ); 

  res.json(filteredUsers);
});


router.post('/useradd', (req, res) => {
  try {
    const id = Number(req.params.id);

    const { username, shareId } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const shareName = "Folder Placeholder";

    // Find the share
    const share = authData.shares.find(s => s.id === shareId);
    console.log("Share "+share.name);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    console.log("Username "+username);
    const user = authData.users.find(u => u.username === username);
    console.log("Share "+share.name);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    // Create new shared for user with no roles
    const newShared = {
      id: shareId,
      name: share.name,
      roles: []
    };
    console.log("User "+user.username);
    user.shares.push(newShared);

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Share assigned successfully to user',
      share: newShared
    });

  } catch (error) {
    console.error('Error sharing share:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing share',
      error: error.message
    });
  }
});

export default router;