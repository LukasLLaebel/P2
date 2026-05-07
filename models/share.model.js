/**
 *
 *  Takes all data from the database
 *  used by SHARES Service and FILES Service 
 *  
 *  - GetAllData: Reads the entire auth.json file and returns it as a JavaScript object.
 *  - SaveAllData: Takes a JavaScript object and writes it back to the auth.json file in a formatted manner.
 *  - findShareById: Searches for a share with a specific ID within the shares array and returns it if found.
 *
 **/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DBFilePath = path.join(__dirname, '../db/auth.json');

export const ShareModel = {

  getAllData: () => {
    const rawData = fs.readFileSync(DBFilePath, 'utf-8');
    return JSON.parse(rawData);
  },

  saveAllData: (data) => {
    fs.writeFileSync(DBFilePath, JSON.stringify(data, null, 2));
  },

  findShareById: (id) => {
    const data = ShareModel.getAllData();
    return data.shares.find(share => share.id === id);
  }
};
