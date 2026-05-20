import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, "../db/auth.json");

export function getFoldersForUser(mode = "all") {
  return async function (req, res, next) {
    try {
      const username = req.session?.user?.username;
      if (!username) return res.status(401).json({ error: "Not logged in" });

      const dbData = fs.readFileSync(DBFilePath, "utf-8");
      const database = JSON.parse(dbData);

      const user = database.users.find((u) => u.username === username);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Build a set of share IDs this user has in their "shares" list
      const userShareIds = new Set((user.shares || []).map((s) => s.id));

      // Start from canonical shares list, then limit to only shares the user is part of
      let sharesForUser = (database.shares || []).filter((s) =>
        userShareIds.has(s.id)
      );

      // Apply mode filter
      if (mode === "shared") {
        // "shared with me" = user is a member but NOT the owner
        sharesForUser = sharesForUser.filter((s) => s.owner !== username);
      } else if (mode === "owned") {
        // "owned by me"
        sharesForUser = sharesForUser.filter((s) => s.owner === username);
      } // else "all" => no additional filter

      // Create a lookup for the user's per-share roles (if you store them there)
      const rolesByShareId = new Map(
        (user.shares || []).map((s) => [s.id, s.roles || []])
      );

      // Final shape for templates/API
      const userFolders = sharesForUser.map((s) => ({
        id: s.id,
        name: s.name,
        path: s.path ?? null,
        owner: s.owner,
        users: s.users ?? [],
        roles: rolesByShareId.get(s.id) ?? [],
      }));

      req.userFolders = userFolders;
      req.currentUser = username;

      next();
    } catch (error) {
      console.error("Error reading folders for user:", error);
      res.status(500).json({ error: "Failed to load folders for user" });
    }
  };
}
