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


export default router;
