import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, '../db/auth.json');

export async function getAllUsers(req, res, next) {
  try {
    const authData = JSON.parse(await fs.promises.readFile(DBFilePath, 'utf-8'));
    req.allUsers = authData.users.map(({ username }) => username);
    next();
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
}
