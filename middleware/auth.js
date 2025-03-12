 

// middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
      return next();
    }
    return res.status(401).json({ msg: 'Not authorized, please login' });
  };
  
  module.exports = {
    isAuthenticated
  };
  