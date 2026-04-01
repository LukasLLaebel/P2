const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db/auth.json');

exports.getAuth = () => {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}


