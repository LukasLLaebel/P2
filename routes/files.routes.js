import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { requireAuth } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({dest:"temp/"});

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

router.get("/getAllFiles/:id", requireAuth, (req, res) => {
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

// Creates the new folder
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { file, shareId } = req.body;

    // Validates input name
    if (!file || file.trim() === "") {
      return res.status(400).json({
        success: false,
        message: 'File name cannot be empty'
      });
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    //Locates selected share
    const share = authData.shares.find(s => s.id === Number(shareId));

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Checks that "files" exists
    if (!share.files) {
      share.files = [];
    }

    // Creates new file
    const newFile = file.trim()
    share.files.push(newFile);

    //Adds file to filesystem
    const sharesPath = path.join(process.cwd(), 'shares');
    const userFolderPath = path.join(sharesPath, share.owner);
    const shareFolderPath = path.join(userFolderPath, share.name);
    await fs.promises.mkdir(userFolderPath, { recursive: true });
    await fs.promises.mkdir(shareFolderPath, { recursive: true, force: true });
    const newFilePath = path.join(shareFolderPath, file.trim());
    await fs.promises.writeFile(newFilePath, '');

    fs.writeFileSync(DBFilePath, JSON.stringify(authData, null, 2));

    res.json({
      success: true,
      message: 'File created successfully',
      file: newFile
    });

  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating file',
      error: error.message
    });
  }
});

// Handles download of files
router.get("/download/:shareId/:fileName", requireAuth, async (req,res) => {
  try {
    const { shareId, fileName } = req.params;
    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const share = authData.shares.find(s => s.id === Number(shareId));
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
    res.status(500).json ({
      success: false,
      message: 'Could not download file',
      error: error.message
    });
  }
});

// Handles upload of files
router.post("/upload", requireAuth, upload.single("file"), async(req, res) => {
  try {
    const { shareId, oldFileName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json ({
        success: false, 
        message: 'No file uploaded'
      }); 
    }

    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));

    const share = authData.shares.find(s => s.id === Number(shareId));

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

    if(!share.files) share.files = [];
    if(!share.files.includes(finalFileName)) {
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
