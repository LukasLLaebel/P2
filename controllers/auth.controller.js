const authService = require('../services/auth.service');

exports.getAuth = (req, res) => {
  const data = authService.getAuthInfo();
  res.json(data);
};
