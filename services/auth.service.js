import authModel from '../models/auth.model.js';

export default {
  getAuthInfo: () => {
    return authModel.getAuth();
  }
};

