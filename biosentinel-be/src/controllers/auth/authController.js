const bcrypt =
  require('bcrypt');

const jwt =
  require('jsonwebtoken');

const prisma =
  require('../../config/prisma');

const {
  createLoginLog
} = require('../../utils/auditLogger');


// SUPER ADMIN LOGIN
const loginSuperAdmin =
  async (req, res) => {

    try {

      const {
        username,
        password
      } = req.body;

      const superAdmin =
        await prisma.superAdmin.findUnique({

          where: {
            username
          }

        });

      // USER NOT FOUND
      if (!superAdmin) {

        await createLoginLog({

          username,

          role: 'SUPER_ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(404).json({

          success: false,
          message: 'Super admin not found'

        });

      }

      // ACCOUNT DISABLED
      if (!superAdmin.isActive) {

        await createLoginLog({

          username,

          role: 'SUPER_ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(403).json({

          success: false,
          message: 'Account disabled'

        });

      }

      const isMatch =
        await bcrypt.compare(
          password,
          superAdmin.password
        );

      // INVALID PASSWORD
      if (!isMatch) {

        await createLoginLog({

          username,

          role: 'SUPER_ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(401).json({

          success: false,
          message: 'Invalid password'

        });

      }

      const token =
        jwt.sign(

          {

            id: superAdmin.id,
            role: 'SUPER_ADMIN'

          },

          process.env.JWT_SECRET,

          {
            expiresIn: '1d'
          }

        );

      // LOGIN SUCCESS
      await createLoginLog({

        username: superAdmin.username,

        role: 'SUPER_ADMIN',

        ipAddress: req.ip,

        userAgent:
          req.headers['user-agent'],

        success: true

      });

      return res.status(200).json({

        success: true,
        token,

        data: {

          id: superAdmin.id,
          username: superAdmin.username,
          fullName: superAdmin.fullName,
          role: 'SUPER_ADMIN'

        }

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,
        message: 'Internal server error'

      });

    }

  };


// ADMIN LOGIN
const loginAdmin =
  async (req, res) => {

    try {

      const {
        username,
        password
      } = req.body;

      const admin =
        await prisma.admin.findUnique({

          where: {
            username
          }

        });

      // ADMIN NOT FOUND
      if (!admin) {

        await createLoginLog({

          username,

          role: 'ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(404).json({

          success: false,
          message: 'Admin not found'

        });

      }

      // ACCOUNT DISABLED
      if (!admin.isActive) {

        await createLoginLog({

          username,

          role: 'ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(403).json({

          success: false,
          message: 'Account disabled'

        });

      }

      const isMatch =
        await bcrypt.compare(
          password,
          admin.password
        );

      // INVALID PASSWORD
      if (!isMatch) {

        await createLoginLog({

          username,

          role: 'ADMIN',

          ipAddress: req.ip,

          userAgent:
            req.headers['user-agent'],

          success: false

        });

        return res.status(401).json({

          success: false,
          message: 'Invalid password'

        });

      }

      const token =
        jwt.sign(

          {

            id: admin.id,
            role: 'ADMIN'

          },

          process.env.JWT_SECRET,

          {
            expiresIn: '1d'
          }

        );

      // LOGIN SUCCESS
      await createLoginLog({

        username: admin.username,

        role: 'ADMIN',

        ipAddress: req.ip,

        userAgent:
          req.headers['user-agent'],

        success: true

      });

      return res.status(200).json({

        success: true,
        token,

        data: {

          id: admin.id,
          username: admin.username,
          fullName: admin.fullName,
          role: 'ADMIN'

        }

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,
        message: 'Internal server error'

      });

    }

  };


module.exports = {
  loginSuperAdmin,
  loginAdmin
}; 