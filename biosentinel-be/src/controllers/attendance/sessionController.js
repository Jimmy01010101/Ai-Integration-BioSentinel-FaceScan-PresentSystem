const prisma = require('../../config/prisma');

const createAttendanceSession = async (req, res) => {
  try {

    const {
      title,
      attendanceCode,
      startTime,
      endTime
    } = req.body;

    const existingSession =
      await prisma.attendanceSession.findFirst({
        where: {
          attendanceCode
        }
      });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Attendance code already exists'
      });
    }

    const session =
      await prisma.attendanceSession.create({
        data: {
          title,
          attendanceCode,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      });

    return res.status(201).json({
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

const getActiveSession = async (req, res) => {
  try {

    const now = new Date();

    const session =
      await prisma.attendanceSession.findFirst({
        where: {
          isActive: true,
          startTime: {
            lte: now
          },
          endTime: {
            gte: now
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active attendance session'
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

module.exports = {
  createAttendanceSession,
  getActiveSession
};