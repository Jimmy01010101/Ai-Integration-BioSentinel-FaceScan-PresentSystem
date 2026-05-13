const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = require('../../config/prisma');

const loginSuperAdmin = async (req, res) => {
  try {

    const { username, password } = req.body;

    const superAdmin = await prisma.superAdmin.findUnique({
      where: {
        username
      }
    });

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      superAdmin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: superAdmin.id,
        role: 'SUPER_ADMIN'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.status(200).json({
      success: true,
      token
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });

  }
};

const loginAdmin = async (req, res) => {
  try {

    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: {
        username
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: 'ADMIN'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.status(200).json({
      success: true,
      token
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