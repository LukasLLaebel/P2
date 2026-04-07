import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../db/auth.json");

export default {
  getAuth: () => {
    try {
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading/parsing auth.json:", error);
      throw error;
    }
  }
};

