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

router.get('/', getAllUsers, (req, res) => {
  const view = req.query.view || 'display';
  res.render('../views/roles.ejs', {
    user: "Jeff",
    allUsers: req.allUsers,
    folder: "Folder 1",
    currentView: view
  });
});

router.put('/create', (req, res) => {
  try {
    const { role, 'add-users': addUsers, permission } = req.body;

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    // Improvement make ID generation more random
    const maxRoleId = Math.max(...authData.roles.map(r => r.id), 0);
    const newRoleId = maxRoleId + 1;

    const newRole = {
      id: newRoleId,
      name: role,
      permissions: permission
    };

    authData.roles.push(newRole);


    // add share to user

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
