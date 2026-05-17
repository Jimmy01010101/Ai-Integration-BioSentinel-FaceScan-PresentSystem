const prisma =
  require('../config/prisma');


// CREATE AUDIT LOG
const createAuditLog =
  async ({

    actorId,
    actorRole,
    action,
    targetType,
    targetId,
    description

  }) => {

    try {

      await prisma.auditLog.create({

        data: {

          actorId,
          actorRole,
          action,
          targetType,
          targetId,
          description

        }

      });

    } catch (error) {

      console.error(
        'Audit log error:',
        error
      );

    }

  };


// CREATE LOGIN LOG
const createLoginLog =
  async ({

    username,
    role,
    ipAddress,
    userAgent,
    success

  }) => {

    try {

      await prisma.loginLog.create({

        data: {

          username,
          role,
          ipAddress,
          userAgent,
          success

        }

      });

    } catch (error) {

      console.error(
        'Login log error:',
        error
      );

    }

  };


module.exports = {
  createAuditLog,
  createLoginLog
}; 