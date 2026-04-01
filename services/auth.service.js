const authModel = require('../models/auth.model');

exports.getAuthInfo = () => {
  return authModel.getAuth();
}
