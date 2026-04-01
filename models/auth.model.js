const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/auth.json');

exports.getAuth = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading/parsing auth.json:', error);
    throw error;
  }
}


