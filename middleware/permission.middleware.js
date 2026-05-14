import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, "../db/auth.json");

export function requirePermission(permission) {
    return async function (req, res, next) {
        try {

            // Finds the user who is logged in
            const username = req.session?.user?.username;
            if (!username) {
                return res.status(401).json({
                    success: false, 
                    message: "Not logged in"
                });
            }
            
            // Reads and converts auth.json
            const dbData = fs.readFileSync(DBFilePath, "utf-8");
            const database = JSON.parse(dbData);

            // Finds the user
            const user = database.users.find ((u) => u.username === username);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Finds shareId of requested folder
            const shareId = Number(req.params.shareId || req.body.shareId);
            if (!shareId) {
                return res.status(400).json({
                    success: false,
                    message: "ShareId not found"
                });
            }

            // Find the share
            const share = database.shares.find(s => s.id === shareId);
            if(!share) {
                return res.status(404).json({
                    success: false,
                    message: "Folder not found"
                });
            }

            // Finds role of user for the share
            const userShare = user.shares?.find(s => s.id === shareId);
            if (!userShare) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Handles string and number combination in auth.json
            const userRoleNames = (userShare.roles || []).filter(r => typeof r === "string");
            const userRoles = (share.roles || []).filter(role => userRoleNames.includes(role.name));
 
            // Checks permission
            const hasPermission = userRoles.some(role => (role.permissions || []).includes(permission));
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Current role does not have required permission"
                });
            }

            next();

        } catch (error) {
            console.error('Permission error:', error);
            res.status(500).json({
              success: false,
              message: 'Permission error',
              error: error.message
            });
        }
    };
}