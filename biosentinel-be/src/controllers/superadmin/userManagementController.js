const prisma =
  require('../../config/prisma');

const fs =
  require('fs');

const path =
  require('path');

const {
  extractFaceDescriptor
} = require('../../ai/faceMatcher');


// GET ALL USERS
const getAllUsers =
  async (req, res) => {

    try {

      const users =
        await prisma.user.findMany({

          orderBy: {
            createdAt: 'desc'
          },

          select: {
            id: true,
            fullName: true,
            identityNumber: true,
            division: true,
            faceImage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }

        });

      return res.status(200).json({
        success: true,
        total: users.length,
        data: users
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// GET USER DETAIL
const getUserById =
  async (req, res) => {

    try {

      const { id } = req.params;

      const user =
        await prisma.user.findUnique({

          where: {
            id: Number(id)
          },

          select: {
            id: true,
            fullName: true,
            identityNumber: true,
            division: true,
            faceImage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }

        });

      if (!user) {

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });

      }

      return res.status(200).json({
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


// UPDATE USER
const updateUser =
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        fullName,
        identityNumber,
        division
      } = req.body;

      const existingUser =
        await prisma.user.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!existingUser) {

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });

      }

      if (identityNumber) {

        const duplicateIdentity =
          await prisma.user.findFirst({

            where: {
              identityNumber,
              NOT: {
                id: Number(id)
              }
            }

          });

        if (duplicateIdentity) {

          return res.status(400).json({
            success: false,
            message: 'Identity number already used'
          });

        }

      }

      const updatedUser =
        await prisma.user.update({

          where: {
            id: Number(id)
          },

          data: {
            fullName,
            identityNumber,
            division
          }

        });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// TOGGLE USER STATUS
const toggleUserStatus =
  async (req, res) => {

    try {

      const { id } = req.params;

      const user =
        await prisma.user.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!user) {

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });

      }

      const updatedUser =
        await prisma.user.update({

          where: {
            id: Number(id)
          },

          data: {
            isActive: !user.isActive
          }

        });

      return res.status(200).json({
        success: true,
        message: 'User status updated',
        data: updatedUser
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// DELETE USER
const deleteUser =
  async (req, res) => {

    try {

      const { id } = req.params;

      const user =
        await prisma.user.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!user) {

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });

      }

      await prisma.attendance.deleteMany({

        where: {
          userId: Number(id)
        }

      });

      await prisma.user.delete({

        where: {
          id: Number(id)
        }

      });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// RE-ENROLL FACE
const reEnrollFace =
  async (req, res) => {

    try {

      const { id } = req.params;

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: 'Face image required'
        });

      }

      const user =
        await prisma.user.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!user) {

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });

      }

      const descriptor =
        await extractFaceDescriptor(
          req.file.path
        );

      if (!descriptor) {

        return res.status(400).json({
          success: false,
          message: 'Face not detected'
        });

      }

      // DELETE OLD IMAGE
      if (
        user.faceImage &&
        fs.existsSync(user.faceImage)
      ) {

        fs.unlinkSync(user.faceImage);

      }

      const updatedUser =
        await prisma.user.update({

          where: {
            id: Number(id)
          },

          data: {
            faceImage: req.file.path,
            faceDescriptor:
              JSON.stringify(descriptor)
          }

        });

      return res.status(200).json({
        success: true,
        message: 'Face re-enrollment successful',
        data: updatedUser
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
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  reEnrollFace
}; 