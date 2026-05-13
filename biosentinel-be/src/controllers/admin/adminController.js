const bcrypt = require('bcrypt');

const prisma = require('../../config/prisma');

const createAdmin = async (req, res) => {
  try {

    const {
      username,
      password,
      fullName
    } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        username
      }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username already used'
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        fullName
      }
    });

    return res.status(201).json({
      success: true,
      data: admin
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
  createAdmin
}; 