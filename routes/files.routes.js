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

export default router;
