const prisma = require('../../config/prisma');

const validateAttendanceCode = async (req, res) => {
  try {

    const { attendanceCode } = req.body;

    const now = new Date();

    const session =
      await prisma.attendanceSession.findFirst({
        where: {
          attendanceCode,
          isActive: true,
          startTime: {
            lte: now
          },
          endTime: {
            gte: now
          }
        }
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired attendance code'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
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
      userId,
      attendanceSessionId,
      confidenceScore,
      smileVerified,
      blinkVerified,
      livenessVerified,
      spoofDetected,
      status
    } = req.body;

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          userId,
          attendanceSessionId
        }
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists'
      });
    }

    const attendance =
      await prisma.attendance.create({
        data: {
          userId,
          attendanceSessionId,
          confidenceScore,
          smileVerified,
          blinkVerified,
          livenessVerified,
          spoofDetected,
          status
        }
      });

    return res.status(201).json({
      success: true,
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

    const attendances =
      await prisma.attendance.findMany({
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

module.exports = {
  validateAttendanceCode,
  checkInAttendance,
  getAttendanceHistory
}; 