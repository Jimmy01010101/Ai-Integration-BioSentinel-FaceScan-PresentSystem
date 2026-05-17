const prisma =
  require('../../config/prisma');


// GET ALL AUDIT LOGS
const getAuditLogs =
  async (req, res) => {

    try {

      const logs =
        await prisma.auditTrail.findMany({

          orderBy: {
            createdAt: 'desc'
          },

          take: 500

        });

      return res.status(200).json({

        success: true,

        total:
          logs.length,

        data: logs

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


// GET SECURITY EVENTS
const getSecurityEvents =
  async (req, res) => {

    try {

      const events =
        await prisma.auditTrail.findMany({

          where: {

            OR: [

              {
                action:
                  'LIVENESS_FAILED'
              },

              {
                action:
                  'FACE_MISMATCH'
              },

              {
                action:
                  'FACE_NOT_DETECTED'
              },

              {
                action:
                  'USER_NOT_FOUND'
              }

            ]

          },

          orderBy: {
            createdAt: 'desc'
          },

          take: 200

        });

      return res.status(200).json({

        success: true,

        total:
          events.length,

        data: events

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

  getAuditLogs,
  getSecurityEvents

}; 