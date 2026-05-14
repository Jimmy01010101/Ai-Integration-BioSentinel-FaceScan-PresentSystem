const prisma =
  require('../../config/prisma');


// GET AUDIT LOGS
const getAuditLogs =
  async (req, res) => {

    try {

      const logs =
        await prisma.auditLog.findMany({

          orderBy: {
            createdAt: 'desc'
          },

          take: 100

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


// GET LOGIN LOGS
const getLoginLogs =
  async (req, res) => {

    try {

      const logs =
        await prisma.loginLog.findMany({

          orderBy: {
            createdAt: 'desc'
          },

          take: 100

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


module.exports = {
  getAuditLogs,
  getLoginLogs
}; 