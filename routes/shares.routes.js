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

function getFolderOwner(req, res, next) {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
  req.getUsersFromFile = authData.shares.map(({ username }) => username);
  console.log(req.getUsersFromFile);
  next();
  return;
}

router.get("/getFolderOwner/:id", (req, res) => {
  const id = Number(req.params.id);

  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  
  const share = authData.shares.find(s => s.id === id);
  const owner = authData.users.find(user => user.username === share.owner);

  res.json(owner);
});


router.post('/useradd', (req, res) => {
  try {
    const { username, shareId } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Find the share
    const share = authData.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    const user = authData.users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.shares.some(s => s.id === shareId)) {
      return res.status(400).json({
        success: false,
        message: 'User already has this share'
      });
    }

    // Create new shared for user with no roles
    const newShared = {
      id: shareId,
      name: share.name,
      roles: []
    };
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

router.post('/userrem', (req, res) => {
  try {
    const { username, shareId } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Find the share
    const share = authData.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    const user = authData.users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.shares = user.shares.filter(s => s.id !== shareId);

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'Share removed successfully from user',
      share: share
    });

  } catch (error) {
    console.error('Error removing share from user:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing share',
      error: error.message
    });
  }
});

export default router;