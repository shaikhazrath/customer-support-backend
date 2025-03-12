// utils/jwt.js
const jwt = require('jsonwebtoken')

// Secret key for signing the token
const JWT_SECRET = process.env.JWT_SECRET 

// Function to generate a JWT
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, // Payload
    process.env.JWT_SECRET ,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};
