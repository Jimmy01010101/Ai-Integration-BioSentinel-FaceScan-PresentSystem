const prisma =
  require('../config/prisma');


// CREATE AUDIT TRAIL
const createAuditTrail =
  async ({

    actorRole,
    actorId,

    action,
    entity,

    entityId,
    description,

    ipAddress,
    userAgent

  }) => {

    try {

      await prisma.auditTrail.create({

        data: {

          actorRole,
          actorId,

          action,
          entity,

          entityId,
          description,

          ipAddress,
          userAgent

        }

      });

    } catch (error) {

      console.error(
        'Audit trail error:',
        error
      );

    }

  };


module.exports = {
  createAuditTrail
}; 