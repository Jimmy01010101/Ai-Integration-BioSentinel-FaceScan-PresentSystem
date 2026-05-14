const prisma = require('../../config/prisma');

const verifyUserAttendance = async (req, res) => {
  try {

    const { identityNumber } = req.body;

    if (!identityNumber) {
      return res.status(400).json({
        success: false,
        message: 'Identity number is required'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        identityNumber,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();

    const activeSession =
      await prisma.attendanceSession.findFirst({
        where: {
          isActive: true,
          startTime: {
            lte: now
          },
          endTime: {
            gte: now
          }
        }
      });

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'Attendance session is not active'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User verified',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          identityNumber: user.identityNumber,
          division: user.division,
          faceImage: user.faceImage
        },
        attendanceSession: activeSession
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

const checkInAttendance = async (req, res) => {
  try {

    const {
      identityNumber,
      confidenceScore,
      smileVerified,
      blinkVerified,
      livenessVerified,
      spoofDetected
    } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        identityNumber,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();

    const activeSession =
      await prisma.attendanceSession.findFirst({
        where: {
          isActive: true,
          startTime: {
            lte: now
          },
          endTime: {
            gte: now
          }
        }
      });

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'Attendance session expired'
      });
    }

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          userId: user.id,
          attendanceSessionId: activeSession.id
        }
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists'
      });
    }

    if (
      !smileVerified ||
      !livenessVerified ||
      spoofDetected
    ) {
      return res.status(400).json({
        success: false,
        message: 'Liveness verification failed'
      });
    }

    const attendance =
      await prisma.attendance.create({
        data: {
          userId: user.id,
          attendanceSessionId: activeSession.id,
          confidenceScore,
          smileVerified,
          blinkVerified,
          livenessVerified,
          spoofDetected,
          status: 'HADIR'
        }
      });

    return res.status(201).json({
      success: true,
      message: 'Attendance successful',
      data: attendance
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });

  }
};

const getAttendanceHistory = async (req, res) => {
  try {

    const {
      year,
      month,
      date,
      division,
      status
    } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (division) {
      filters.user = {
        division
      };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);

      endDate.setHours(23, 59, 59, 999);

      filters.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    if (month && year) {

      const startMonth =
        new Date(year, month - 1, 1);

      const endMonth =
        new Date(year, month, 0);

      filters.createdAt = {
        gte: startMonth,
        lte: endMonth
      };

    }

    const attendances =
      await prisma.attendance.findMany({
        where: filters,
        include: {
          user: true,
          attendanceSession: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

    return res.status(200).json({
      success: true,
      data: attendances
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });

  }
};

const updateAttendanceStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const { status } = req.body;

    const allowedStatuses = [
      'IZIN',
      'SAKIT',
      'CUTI'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          id: Number(id)
        }
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance not found'
      });
    }

    if (attendance.status !== 'ABSEN') {
      return res.status(400).json({
        success: false,
        message: 'Only ABSEN can be updated'
      });
    }

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id: Number(id)
        },
        data: {
          status
        }
      });

    return res.status(200).json({
      success: true,
      data: updatedAttendance
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
  verifyUserAttendance,
  checkInAttendance,
  getAttendanceHistory,
  updateAttendanceStatus
}; 