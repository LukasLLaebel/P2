import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, '../db/auth.json');

export function getAllPermissions(req, res, next) {
  try {
    const authData = JSON.parse(fs.readFileSync(DBFilePath, 'utf-8'));
    req.allPermissions = authData.permissions.map(({ name }) => name);
    next();
  } catch (error) {
    console.error('Error reading permissions:', error);
    res.status(500).json({ error: 'Failed to loading permissions' });
  }
}
