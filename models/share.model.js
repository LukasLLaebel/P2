import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DBFilePath = path.join(__dirname, '../db/auth.json');

export const ShareModel = {
  // Pull data
  getAllData: () => {
    const rawData = fs.readFileSync(DBFilePath, 'utf-8');
    return JSON.parse(rawData);
  },

  // Push data (example for future use)
  saveAllData: (data) => {
    fs.writeFileSync(DBFilePath, JSON.stringify(data, null, 2));
  },

  // Helper specific to shares
  findShareById: (id) => {
    const data = ShareModel.getAllData();
    return data.shares.find(share => share.id === id);
  }
};
