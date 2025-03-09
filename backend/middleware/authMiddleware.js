const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Extract token from 'Bearer <token>' format
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: 'Forbidden access' });
      }

      // Set user info in request object
      req.userId = user.userId;
      req.userRole = user.role;

      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
  }
};


const authenticateUser = (req, res, next) => {
  // For development purposes, bypass authentication
  // Set req.userId and req.userRole manually
  req.userId = 'your_test_user_id'; // Replace with a valid user ID from your database
  req.userRole = 'Medical Secretary'; // Or 'Patient', depending on the test
  next();
};


module.exports = { authenticateJWT, authenticateUser };
