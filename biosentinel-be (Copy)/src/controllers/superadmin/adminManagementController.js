const bcrypt = require('bcrypt');

const prisma =
  require('../../config/prisma');


// CREATE ADMIN
const createAdmin =
  async (req, res) => {

    try {

      const {
        username,
        password,
        fullName
      } = req.body;

      if (
        !username ||
        !password ||
        !fullName
      ) {

        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });

      }

      const existingAdmin =
        await prisma.admin.findUnique({

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

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const admin =
        await prisma.admin.create({

          data: {
            username,
            password: hashedPassword,
            fullName
          }

        });

      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
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


// GET ALL ADMINS
const getAllAdmins =
  async (req, res) => {

    try {

      const admins =
        await prisma.admin.findMany({

          orderBy: {
            createdAt: 'desc'
          },

          select: {
            id: true,
            username: true,
            fullName: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }

        });

      return res.status(200).json({
        success: true,
        total: admins.length,
        data: admins
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// GET ADMIN DETAIL
const getAdminById =
  async (req, res) => {

    try {

      const { id } = req.params;

      const admin =
        await prisma.admin.findUnique({

          where: {
            id: Number(id)
          },

          select: {
            id: true,
            username: true,
            fullName: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }

        });

      if (!admin) {

        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });

      }

      return res.status(200).json({
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


// UPDATE ADMIN
const updateAdmin =
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        username,
        fullName,
        password
      } = req.body;

      const admin =
        await prisma.admin.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!admin) {

        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });

      }

      const updateData = {};

      if (username) {

        const existingUsername =
          await prisma.admin.findFirst({

            where: {
              username,
              NOT: {
                id: Number(id)
              }
            }

          });

        if (existingUsername) {

          return res.status(400).json({
            success: false,
            message: 'Username already used'
          });

        }

        updateData.username = username;

      }

      if (fullName) {
        updateData.fullName = fullName;
      }

      if (password) {

        updateData.password =
          await bcrypt.hash(
            password,
            10
          );

      }

      const updatedAdmin =
        await prisma.admin.update({

          where: {
            id: Number(id)
          },

          data: updateData

        });

      return res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: updatedAdmin
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// TOGGLE ACTIVE STATUS
const toggleAdminStatus =
  async (req, res) => {

    try {

      const { id } = req.params;

      const admin =
        await prisma.admin.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!admin) {

        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });

      }

      const updatedAdmin =
        await prisma.admin.update({

          where: {
            id: Number(id)
          },

          data: {
            isActive: !admin.isActive
          }

        });

      return res.status(200).json({
        success: true,
        message: 'Admin status updated',
        data: updatedAdmin
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// DELETE ADMIN
const deleteAdmin =
  async (req, res) => {

    try {

      const { id } = req.params;

      const admin =
        await prisma.admin.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!admin) {

        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });

      }

      await prisma.admin.delete({

        where: {
          id: Number(id)
        }

      });

      return res.status(200).json({
        success: true,
        message: 'Admin deleted successfully'
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
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin
}; 