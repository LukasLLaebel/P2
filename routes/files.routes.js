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


function getAllFilesFromFolder(req, res, next) {
  const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
  req.allFiles = authData.shares.map(
    ({ name, id }) => ({ name, id })
  )
  console.log(req.allFiles);
  next();
  return;
}

router.get("/getAllFiles/:id", (req, res) => {
  const id = Number(req.params.id);
  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  const files = authData.shares.find(share => share.id === id)?.files;

  res.json(files);
});

router.get("/getFolder/:id", (req, res) => {
  const id = Number(req.params.id);
  const authData = JSON.parse(fs.readFileSync(DBFilePath, "utf-8"));
  const folder = authData.shares.find(share => share.id === id);

  res.json(folder);
});

export default router;