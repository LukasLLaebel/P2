import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DBFilePath = path.join(__dirname, '../db/auth.json');

export async function authenticateUser(req, res, next) {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).render('login-error', {
        errorMessage: 'Username is required'
      });
    }


    const authData = JSON.parse(await fs.promises.readFile(DBFilePath, 'utf-8'));


    const user = authData.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return res.status(404).render('assets/login-error', {
        errorMessage: `User "${username}" not found. Please try again or register.`
      });
    }


    req.session.user = user;

    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).render('login-error', {
      errorMessage: 'An error occurred during authentication. Please try again.'
    });
  }
}


export function requireAuth(req, res, next) {

  if (!req.session.user) {
    return res.status(401).redirect('/');
  }

  req.user = req.session.user;
  next();
}


export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
}
