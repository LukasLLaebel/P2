import express from "express";
const router = express.Router();
import authController from '../controllers/auth.controller.js';
// Route: GET /auth
router.get('/', authController.getAuth);

//module.exports = router;

export default router;


