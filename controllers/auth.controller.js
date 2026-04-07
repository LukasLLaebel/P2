import authService from '../services/auth.service.js';

export default {
  getAuth: (req, res) => {
    const data = authService.getAuthInfo();
    res.json(data);
  }
};

