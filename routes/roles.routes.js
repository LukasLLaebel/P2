import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const DBFilePath = path.join(__dirname, '../db/auth.json');

// middleware 
function getAllUsers(req, res, next) {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
  req.allUsers = authData.users.map(({ username }) => username);
  //console.log(req.allUsers);
  next();
  return;
}

router.get("/users", (req, res) => {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  const users = authData.users.map(u => u.username);

  res.json(users);
});

router.get('/', getAllUsers, (req, res) => {
  const view = req.query.view || 'display';
  res.render('../views/roles.ejs', {
    user: "Jeff",
    allUsers: req.allUsers,
    folder: "Folder 1",
    currentView: view
  });
});

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

router.put('/create', (req, res) => {
  try {
    const { role, users, permission } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Improvement make ID generation random
    const maxRoleId = Math.max(...authData.roles.map(r => r.id), 0);
    const newRoleId = maxRoleId + 1;

    const newRole = {
      id: newRoleId,
      name: role,
      permissions: permission,
      users: users || []
    };

    authData.roles.push(newRole);

    // testing: 
    console.log('Users assigned to role:', users);

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

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
