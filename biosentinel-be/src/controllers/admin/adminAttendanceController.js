const prisma =
  require('../../config/prisma');


// TODAY ATTENDANCE
const getTodayAttendance =
  async (req, res) => {

    try {

      const today =
        new Date();

      const startOfDay =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0
        );

      const endOfDay =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );

      const attendance =
        await prisma.attendance.findMany({

          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },

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
        total: attendance.length,
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


// ATTENDANCE DETAIL
const getAttendanceDetail =
  async (req, res) => {

    try {

      const { id } = req.params;

      const attendance =
        await prisma.attendance.findUnique({

          where: {
            id: Number(id)
          },

          include: {
            user: true,
            attendanceSession: true
          }

        });

      if (!attendance) {

        return res.status(404).json({

          success: false,
          message: 'Attendance not found'

        });

      }

      return res.status(200).json({

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


// PRESENCE BOARD
const getPresenceBoard =
  async (req, res) => {

    try {

      const users =
        await prisma.user.findMany({

          where: {
            isActive: true
          },

          include: {

            attendances: {

              orderBy: {
                createdAt: 'desc'
              },

              take: 1

            }

          }

        });

      const board =
        users.map((user) => {

          const latest =
            user.attendances[0];

          return {

            id: user.id,

            fullName:
              user.fullName,

            identityNumber:
              user.identityNumber,

            division:
              user.division,

            latestAttendance:
              latest || null

          };

        });

      return res.status(200).json({

        success: true,

        total: board.length,

        data: board

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,
        message: 'Internal server error'

      });

    }

  };

// ATTENDANCE STATISTICS
const getAttendanceStatistics =
  async (req, res) => {

    try {

      const totalAttendance =
        await prisma.attendance.count();

      const hadir =
        await prisma.attendance.count({

          where: {
            status: 'HADIR'
          }

        });

      const absen =
        await prisma.attendance.count({

          where: {
            status: 'ABSEN'
          }

        });

      const spoofDetected =
        await prisma.attendance.count({

          where: {
            spoofDetected: true
          }

        });

      return res.status(200).json({

        success: true,

        data: {

          totalAttendance,
          hadir,
          absen,
          spoofDetected

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


// SPOOF LOGS
const getSpoofLogs =
  async (req, res) => {

    try {

      const logs =
        await prisma.spoofLog.findMany({

          orderBy: {
            createdAt: 'desc'
          }

        });

      return res.status(200).json({

        success: true,
        total: logs.length,
        data: logs

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,
        message: 'Internal server error'

      });

    }

  };


// ACTIVE SESSION
const getActiveSession =
  async (req, res) => {

    try {

      const session =
        await prisma.attendanceSession.findFirst({

          where: {
            isActive: true
          },

          orderBy: {
            createdAt: 'desc'
          }

        });

      if (!session) {

        return res.status(404).json({

          success: false,
          message: 'No active session'

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
  getTodayAttendance,
  getAttendanceDetail,
  getPresenceBoard,
  getAttendanceStatistics,
  getSpoofLogs,
  getActiveSession
}; 