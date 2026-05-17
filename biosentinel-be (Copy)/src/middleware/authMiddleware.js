const jwt =
  require('jsonwebtoken');


// AUTH TOKEN
const authMiddleware =
  async (req, res, next) => {

    try {

      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith('Bearer ')
      ) {

        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });

      }

      const token =
        authHeader.split(' ')[1];

      if (!token) {

        return res.status(401).json({
          success: false,
          message: 'Token missing'
        });

      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      req.user = decoded;

      next();

    } catch (error) {

      console.error(error);

      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });

    }

  };


// SUPER ADMIN ONLY
const superAdminOnly =
  async (req, res, next) => {

    try {

      if (
        req.user.role !==
        'SUPER_ADMIN'
      ) {

        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });

      }

      next();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// ADMIN ONLY
const adminOnly =
  async (req, res, next) => {

    try {

      if (

        req.user.role !== 'ADMIN' &&
        req.user.role !== 'SUPER_ADMIN'

      ) {

        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });

      }

      next();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


module.exports = {
  authMiddleware,
  superAdminOnly,
  adminOnly
}; 