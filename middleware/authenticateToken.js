// middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

// Ensure dotenv.config() is called in server.js to load environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT tokens from the Authorization header
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects 'Bearer TOKEN'

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Log specific JWT errors for debugging
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user; // Attach decoded user payload (id, role) to request
    next(); // Proceed to the next route handler
  });
};

module.exports = authenticateToken;
