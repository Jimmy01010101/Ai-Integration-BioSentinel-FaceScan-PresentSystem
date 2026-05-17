const prisma =
  require('../config/prisma');


// CREATE ATTEMPT LOG
const createAttemptLog =
  async ({

    identityNumber,
    ipAddress,
    userAgent,
    success,
    reason

  }) => {

    try {

      await prisma.attendanceAttempt.create({

        data: {

          identityNumber,

          ipAddress,

          userAgent,

          success,

          reason

        }

      });

    } catch (error) {

      console.error(
        'Attempt log error:',
        error
      );

    }

  };


// FAILED ATTEMPTS
const getFailedAttempts =
  async (
    identityNumber
  ) => {

    const tenMinutesAgo =
      new Date(
        Date.now() -
        10 * 60 * 1000
      );

    const failed =
      await prisma.attendanceAttempt.count({

        where: {

          identityNumber,

          success: false,

          createdAt: {
            gte: tenMinutesAgo
          }

        }

      });

    return failed;

  };


// COOLDOWN CHECK
const checkCooldown =
  async (
    userId,
    attendanceSessionId
  ) => {

    const lastAttendance =
      await prisma.attendance.findFirst({

        where: {

          userId,
          attendanceSessionId

        },

        orderBy: {
          createdAt: 'desc'
        }

      });

    if (!lastAttendance) {

      return false;

    }

    const now =
      new Date();

    const diffSeconds =
      (
        now -
        lastAttendance.createdAt
      ) / 1000;

    return diffSeconds < 30;

  };


module.exports = {

  createAttemptLog,
  getFailedAttempts,
  checkCooldown

}; 