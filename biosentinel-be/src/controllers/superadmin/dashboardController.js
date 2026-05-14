const prisma =
  require('../../config/prisma');


// DASHBOARD STATS
const getDashboardStats =
  async (req, res) => {

    try {

      const totalUsers =
        await prisma.user.count();

      const activeUsers =
        await prisma.user.count({
          where: {
            isActive: true
          }
        });

      const totalAdmins =
        await prisma.admin.count();

      const activeAdmins =
        await prisma.admin.count({
          where: {
            isActive: true
          }
        });

      const totalAttendance =
        await prisma.attendance.count();

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

      const attendanceToday =
        await prisma.attendance.count({

          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }

        });

      const hadirToday =
        await prisma.attendance.count({

          where: {

            status: 'HADIR',

            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }

          }

        });

      const absenToday =
        await prisma.attendance.count({

          where: {

            status: 'ABSEN',

            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }

          }

        });

      const activeSession =
        await prisma.attendanceSession.findFirst({

          where: {
            isActive: true
          },

          orderBy: {
            createdAt: 'desc'
          }

        });

      return res.status(200).json({

        success: true,

        data: {

          users: {
            total: totalUsers,
            active: activeUsers
          },

          admins: {
            total: totalAdmins,
            active: activeAdmins
          },

          attendance: {
            total: totalAttendance,
            today: attendanceToday,
            hadir: hadirToday,
            absen: absenToday
          },

          activeSession

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


// ACTIVE SESSION
const getActiveSession =
  async (req, res) => {

    try {

      const activeSession =
        await prisma.attendanceSession.findFirst({

          where: {
            isActive: true
          },

          orderBy: {
            createdAt: 'desc'
          }

        });

      if (!activeSession) {

        return res.status(404).json({

          success: false,
          message: 'No active session'

        });

      }

      return res.status(200).json({

        success: true,
        data: activeSession

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,
        message: 'Internal server error'

      });

    }

  };


// REALTIME FEED BASE
const getRealtimeFeed =
  async (req, res) => {

    try {

      const feeds =
        await prisma.attendance.findMany({

          include: {
            user: true,
            attendanceSession: true
          },

          orderBy: {
            createdAt: 'desc'
          },

          take: 20

        });

      return res.status(200).json({

        success: true,
        total: feeds.length,
        data: feeds

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
  getDashboardStats,
  getTodayAttendance,
  getActiveSession,
  getRealtimeFeed
};