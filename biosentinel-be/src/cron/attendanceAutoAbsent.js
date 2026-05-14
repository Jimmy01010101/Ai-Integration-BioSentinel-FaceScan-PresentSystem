const cron = require('node-cron');

const prisma = require('../config/prisma');

const attendanceAutoAbsent = () => {

  cron.schedule('* * * * *', async () => {

    try {

      console.log(
        'Running auto absent engine...'
      );

      const now = new Date();

      const expiredSessions =
        await prisma.attendanceSession.findMany({
          where: {
            isActive: true,
            endTime: {
              lte: now
            }
          }
        });

      for (const session of expiredSessions) {

        const users =
          await prisma.user.findMany({
            where: {
              isActive: true
            }
          });

        for (const user of users) {

          const existingAttendance =
            await prisma.attendance.findFirst({
              where: {
                userId: user.id,
                attendanceSessionId: session.id
              }
            });

          if (!existingAttendance) {

            await prisma.attendance.create({
              data: {
                userId: user.id,
                attendanceSessionId: session.id,

                confidenceScore: 0,

                smileVerified: false,
                blinkVerified: false,
                livenessVerified: false,
                spoofDetected: false,

                status: 'ABSEN'
              }
            });

            console.log(
              `Auto absent created for ${user.fullName}`
            );

          }

        }

        await prisma.attendanceSession.update({
          where: {
            id: session.id
          },
          data: {
            isActive: false
          }
        });

        console.log(
          `Session ${session.title} closed`
        );

      }

    } catch (error) {

      console.error(
        'Auto absent engine error:',
        error
      );

    }

  });

};

module.exports = attendanceAutoAbsent; 