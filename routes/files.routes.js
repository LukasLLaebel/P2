import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { fileURLToPath } from "url";
import path from 'path';
import fs from 'fs';
import multer from "multer";
import * as FilesController from "../controllers/files.controller.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: "temp/" });

const DBFilePath = path.join(__dirname, '../db/auth.json');

// Middleware can go here or directly on the routes
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Routes map cleanly to Controllers
router.get("/getAllFiles/:id", requireAuth, FilesController.getFiles);
router.get("/getFolder/:id", FilesController.getFolder);


// Creates the new folder
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { file, shareId } = req.body;

    console.log("req.body:", req.body);

    // Validate input
    if (!file || file.trim() === "") {
      return res.status(400).json({
        success: false,
        message: 'File name cannot be empty'
      });
    }

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'shareId is required'
      });
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    console.log("Looking for shareId:", shareId);

    // FIX: robust comparison (string-safe + trimmed)
    const share = authData.shares.find(
      s => String(s.id).trim() === String(shareId).trim()
    );

    if (!share) {
      console.log("Available shares:", authData.shares.map(s => s.id));

      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Ensure files array exists
    if (!Array.isArray(share.files)) {
      share.files = [];
    }

    const newFile = file.trim();
    share.files.push(newFile);

    // Filesystem paths
    const sharesPath = path.join(process.cwd(), 'shares');
    const userFolderPath = path.join(sharesPath, share.owner);
    const shareFolderPath = path.join(userFolderPath, share.name);

    await fs.promises.mkdir(shareFolderPath, { recursive: true });

    const newFilePath = path.join(shareFolderPath, newFile);
    await fs.promises.writeFile(newFilePath, '');

    // Save DB
    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    return res.json({
      success: true,
      message: 'File created successfully',
      file: newFile
    });

  } catch (error) {
    console.error('Error creating file:', error);

    return res.status(500).json({
      success: false,
      message: 'Error creating file',
      error: error.message
    });
  }
});
// Handles download of files
router.get("/download/:shareId/:fileName", requireAuth, requirePermission("read"), async (req, res) => {
  try {
    const { shareId, fileName } = req.params;
    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const share = authData.shares.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const filePath = path.join(process.cwd(), 'shares', share.owner, share.name, fileName);

    // Checks if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not download file',
      error: error.message
    });
  }
});

// Handles upload of files
router.post("/upload", requireAuth, upload.single("file"), requirePermission("edit"), async (req, res) => {
  try {
    const { shareId, oldFileName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const share = authData.shares.find(s => s.id === shareId);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const sharesPath = path.join(process.cwd(), 'shares');
    const shareFolderPath = path.join(sharesPath, share.owner, share.name);
    await fs.promises.mkdir(shareFolderPath, { recursive: true });
    const finalFileName = oldFileName;
    const finalPath = path.join(shareFolderPath, finalFileName);
    await fs.promises.rename(file.path, finalPath);

    if (!share.files) share.files = [];
    if (!share.files.includes(finalFileName)) {
      share.files.push(finalFileName);
    }

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: finalFileName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

export default router;
