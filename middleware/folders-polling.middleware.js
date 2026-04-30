import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, '../db/auth.json');

export async function getFoldersForUser(req, res, next) {
  try {
    const username = req.session?.user?.username;

    const dbData = fs.readFileSync(DBFilePath, 'utf-8');
    const database = JSON.parse(dbData);

    // Find the user in the database
    const user = database.users.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all shares/folders for this user
    const userFolders = user.shares.map(share => {
      // Find the full share details from the shares array
      const shareDetails = database.shares.find(s => s.id === share.id);

      return {
        id: share.id,
        name: share.name,
        path: shareDetails?.path || null,
        owner: share.owner,
        users: shareDetails?.users || [],
        roles: share.roles || []
      };
    });

    req.userFolders = userFolders;
    req.currentUser = username;

    next();
  } catch (error) {
    console.error('Error reading folders for user:', error);
    res.status(500).json({ error: 'Failed to load folders for user' });
  }
}

