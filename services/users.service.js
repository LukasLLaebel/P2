import fs from "fs";
import path from "path";

export async function syncUserFolders(req, res, next) {
  try {
    const sharesPath = path.join(process.cwd(), 'shares');

    await fs.promises.mkdir(sharesPath, { recursive: true });

    const usernames = req.allUsers;

    for (const username of usernames) {
      const userFolderPath = path.join(sharesPath, username);
      await fs.promises.mkdir(userFolderPath, { recursive: true });
    }

    next();
  } catch (error) {
    console.error('Error syncing user folders:', error);
    res.status(500).json({ error: 'Failed to sync user folders' });
  }
}
export function searchFolders(folders, searchText) {
  if (!folders || folders.length === 0) {
    return [];
  }

  if (!searchText || searchText.trim() === "") {
    return folders;
  }

  const query = searchText.toLowerCase().trim();

  return folders.filter((folder) => {
    return folder.name.toLowerCase().includes(query);
  });
}