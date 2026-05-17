const prisma =
  require('../../config/prisma');

const fs =
  require('fs');

const path =
  require('path');

const {
  extractFaceDescriptor
} = require('../../ai/faceMatcher');


const {
  createAuditTrail
} = require('../../utils/auditTrail');


// =====================================================
// SAVE BASE64 IMAGE -> FILE
// =====================================================
const saveBase64Image = (base64String) => {

  if (!base64String) {
    return null;
  }

  // Format: data:image/jpeg;base64,xxxx
  const matches =
    base64String.match(
      /^data:image\/(\w+);base64,(.+)$/
    );

  if (!matches) {
    return null;
  }

  const extension = matches[1];
  const data = matches[2];

  const uploadDir =
    path.join('uploads', 'users');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName =
    `${Date.now()}.${extension}`;

  const filePath =
    path.join(uploadDir, fileName);

  fs.writeFileSync(
    filePath,
    Buffer.from(data, 'base64')
  );

  // Simpan path relatif (dipakai untuk URL /uploads/...)
  return filePath.replace(/\\/g, '/');
};


// =====================================================
// CREATE USER
// =====================================================
// PENTING: descriptor wajah HARUS diekstrak di server
// menggunakan extractFaceDescriptor yang sama dengan
// proses check-in. Descriptor dari browser TIDAK boleh
// dipercaya karena model/preprocessing-nya berbeda,
// sehingga akan selalu "tidak cocok" saat check-in.
// =====================================================
const createUser =
  async (req, res) => {

    try {

      const {
        fullName,
        identityNumber,
        division,
        faceImage
      } = req.body;

      // VALIDASI FIELD WAJIB
      if (
        !fullName ||
        !identityNumber ||
        !division
      ) {

        return res.status(400).json({
          success: false,
          message: 'Nama, nomor karyawan, dan divisi wajib diisi'
        });

      }

      // CEK DUPLIKAT NOMOR KARYAWAN
      const existingUser =
        await prisma.user.findUnique({
          where: {
            identityNumber
          }
        });

      if (existingUser) {

        return res.status(400).json({
          success: false,
          message: 'Nomor karyawan sudah terdaftar'
        });

      }

      // SIMPAN FOTO WAJAH
      // Dukung 2 cara kirim foto:
      // 1. multipart (req.file)  2. base64 (req.body.faceImage)
      let savedImagePath = null;

      if (req.file) {

        savedImagePath =
          req.file.path.replace(/\\/g, '/');

      } else if (faceImage) {

        savedImagePath =
          saveBase64Image(faceImage);

      }

      // FOTO WAJIB ADA UNTUK ENROLLMENT
      if (!savedImagePath) {

        return res.status(400).json({
          success: false,
          message: 'Foto wajah wajib diunggah untuk pendaftaran'
        });

      }

      // EKSTRAK DESCRIPTOR DI SERVER (konsisten dgn check-in)
      const descriptor =
        await extractFaceDescriptor(
          savedImagePath
        );

      if (!descriptor) {

        // Hapus foto yg gagal diproses
        try {
          if (fs.existsSync(savedImagePath)) {
            fs.unlinkSync(savedImagePath);
          }
        } catch (cleanupError) {
          console.error(cleanupError);
        }

        return res.status(400).json({
          success: false,
          message:
            'Wajah tidak terdeteksi pada foto. ' +
            'Gunakan foto wajah yang jelas dan terang.'
        });

      }

      // BUAT USER — descriptor disimpan sbg STRING JSON
      // (format yang sama dengan reEnrollFace)
      const user =
        await prisma.user.create({
          data: {
            fullName,
            identityNumber,
            division,
            faceDescriptor:
              JSON.stringify(descriptor),
            faceImage: savedImagePath,
            isActive: true
          }
        });

      // AUDIT TRAIL
      await createAuditTrail({
        actorRole: req.user?.role || 'SUPER_ADMIN',
        actorId: req.user?.id || null,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        description: `User ${fullName} (${identityNumber}) dibuat`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: {
          id: user.id,
          fullName: user.fullName,
          identityNumber: user.identityNumber,
          division: user.division,
          faceImage: user.faceImage,
          isActive: user.isActive
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
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  reEnrollFace
}; 