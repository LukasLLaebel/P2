const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route: GET /auth
router.get('/', authController.getAuth);

module.exports = router;
