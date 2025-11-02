const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'demo-secret';

module.exports = {
  sign(payload, expiresIn = '2h') {
    return jwt.sign(payload, SECRET, { expiresIn });
  },
  verify(token) {
    try {
      return jwt.verify(token, SECRET);
    } catch (e) {
      return null;
    }
  }
};
