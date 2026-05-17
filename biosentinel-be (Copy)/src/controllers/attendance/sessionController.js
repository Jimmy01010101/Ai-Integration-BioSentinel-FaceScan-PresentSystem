const prisma = require('../../config/prisma');

const {
  convertWIBToUTC,
  convertUTCToWIB
} = require('../../utils/timezone');

const createAttendanceSession = async (req, res) => {
  try {

    const {
      title,
      startTime,
      endTime
    } = req.body;

    if (
      !title ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete session data'
      });
    }

    // NONAKTIFKAN SESSION LAMA
    await prisma.attendanceSession.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // BUAT SESSION BARU
    const session =
      await prisma.attendanceSession.create({
        data: {
          title,

          startTime:
            convertWIBToUTC(startTime),

          endTime:
            convertWIBToUTC(endTime),

          isActive: true
        }
      });

    return res.status(201).json({
      success: true,
      message:
        'Attendance session created',

      data: {
        ...session,

        startTimeWIB:
          convertUTCToWIB(
            session.startTime
          ),

        endTimeWIB:
          convertUTCToWIB(
            session.endTime
          )
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Internal server error'
    });

  }
};

const getActiveSession = async (
  req,
  res
) => {
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
        message:
          'No active attendance session'
      });

    }

    return res.status(200).json({
      success: true,

      data: {
        ...session,

        startTimeWIB:
          convertUTCToWIB(
            session.startTime
          ),

        endTimeWIB:
          convertUTCToWIB(
            session.endTime
          )
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Internal server error'
    });

  }
};

module.exports = {
  createAttendanceSession,
  getActiveSession
}; 