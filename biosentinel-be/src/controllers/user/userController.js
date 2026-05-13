const prisma = require('../../config/prisma');

const createUser = async (req, res) => {
  try {

    const {
      fullName,
      identityNumber,
      division,
      faceDescriptor
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        identityNumber
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Identity number already exists'
      });
    }

    let faceImage = null;

    if (req.file) {
      faceImage = req.file.path;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        identityNumber,
        division,
        faceDescriptor: JSON.parse(faceDescriptor),
        faceImage
      }
    });

    return res.status(201).json({
      success: true,
      data: user
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
  createUser
}; 