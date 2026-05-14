const prisma =
  require('../../config/prisma');


// DAILY RECAP
const getDailyRecap =
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


// SESSION RECAP
const getSessionRecap =
  async (req, res) => {

    try {

      const { sessionId } =
        req.params;

      const session =
        await prisma.attendanceSession.findUnique({

          where: {
            id: Number(sessionId)
          }

        });

      if (!session) {

        return res.status(404).json({

          success: false,
          message: 'Session not found'

        });

      }

      const attendance =
        await prisma.attendance.findMany({

          where: {
            attendanceSessionId:
              Number(sessionId)
          },

          include: {
            user: true
          },

          orderBy: {
            createdAt: 'desc'
          }

        });

      return res.status(200).json({

        success: true,
        session,
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


// USER ATTENDANCE HISTORY
const getUserAttendanceHistory =
  async (req, res) => {

    try {

      const { userId } =
        req.params;

      const user =
        await prisma.user.findUnique({

          where: {
            id: Number(userId)
          }

        });

      if (!user) {

        return res.status(404).json({

          success: false,
          message: 'User not found'

        });

      }

      const history =
        await prisma.attendance.findMany({

          where: {
            userId: Number(userId)
          },

          include: {
            attendanceSession: true
          },

          orderBy: {
            createdAt: 'desc'
          }

        });

      return res.status(200).json({

        success: true,
        user,
        total: history.length,
        data: history

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// FILTER ATTENDANCE
const filterAttendance =
  async (req, res) => {

    try {

      const {
        status,
        division
      } = req.query;

      const filters = {};

      if (status) {
        filters.status = status;
      }

      const attendance =
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

      let filtered =
        attendance;

      if (division) {

        filtered =
          attendance.filter(

            (item) =>
              item.user.division === division

          );

      }

      return res.status(200).json({

        success: true,
        total: filtered.length,
        data: filtered

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });

    }

  };


// ATTENDANCE SUMMARY
const getAttendanceSummary =
  async (req, res) => {

    try {

      const totalUsers =
        await prisma.user.count({

          where: {
            isActive: true
          }

        });

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

      const spoof =
        await prisma.attendance.count({

          where: {
            spoofDetected: true
          }

        });

      return res.status(200).json({

        success: true,

        data: {

          totalUsers,
          hadir,
          absen,
          spoof

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


module.exports = {
  getDailyRecap,
  getSessionRecap,
  getUserAttendanceHistory,
  filterAttendance,
  getAttendanceSummary
}; 