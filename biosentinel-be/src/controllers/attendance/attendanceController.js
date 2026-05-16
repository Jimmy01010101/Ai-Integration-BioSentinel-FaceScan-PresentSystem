const prisma =
  require('../../config/prisma');

const path =
  require('path');

const { getIO } =
  require('../../socket/socket');

const {
  extractFaceDescriptor,
  compareFaceDescriptors
} = require('../../ai/faceMatcher');

const {

  createAttemptLog,
  getFailedAttempts,
  checkCooldown

} = require(
  '../../utils/attendanceSecurity'
);

const {
  createAuditTrail
} = require(
  '../../utils/auditTrail'
);

// VERIFY USER
const verifyUserAttendance = async (
  req,
  res
) => {

  try {

    const { identityNumber } =
      req.body;

    if (!identityNumber) {

      return res.status(400).json({

        success: false,

        message:
          'Identity number is required'

      });

    }

    const failedAttempts =
      await getFailedAttempts(
        identityNumber
      );

    if (failedAttempts >= 5) {

      return res.status(429).json({

        success: false,

        message:
          'Too many failed attempts. Try again later.'

      });

    }

    const user =
      await prisma.user.findFirst({

        where: {

          identityNumber,
          isActive: true

        }

      });

    if (!user) {

      await createAttemptLog({

        identityNumber,

        ipAddress:
          req.ip,

        userAgent:
          req.headers['user-agent'],

        success: false,

        reason:
          'USER_NOT_FOUND'

      });

      await createAuditTrail({

      actorRole:
        'UNKNOWN',

      action:
        'USER_NOT_FOUND',

      entity:
        'Attendance',

      description:
        `Unknown identity number: ${identityNumber}`,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent']

    });

      return res.status(404).json({

        success: false,

        message:
          'User not found'

      });

    }

    const now =
      new Date();

    const activeSession =
      await prisma.attendanceSession.findFirst({

        where: {

          isActive: true,

          startTime: {
            lte: now
          },

          endTime: {
            gte: now
          }

        }

      });

    if (!activeSession) {

      return res.status(400).json({

        success: false,

        message:
          'Attendance session is not active'

      });

    }

    return res.status(200).json({

      success: true,

      message:
        'User verified',

      data: {

        user: {

          id: user.id,

          fullName:
            user.fullName,

          identityNumber:
            user.identityNumber,

          division:
            user.division,

          faceImage:
            user.faceImage

        },

        attendanceSession:
          activeSession

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


// CHECK-IN
const checkInAttendance = async (
  req,
  res
) => {

  try {

    const {

      identityNumber,
      smileVerified,
      blinkVerified,
      livenessVerified,
      spoofDetected

    } = req.body;

    if (!req.file) {

      return res.status(400).json({

        success: false,

        message:
          'Face image is required'

      });

    }

    const failedAttempts =
      await getFailedAttempts(
        identityNumber
      );

    if (failedAttempts >= 5) {

      return res.status(429).json({

        success: false,

        message:
          'Too many failed attempts. Try again later.'

      });

    }

    const user =
      await prisma.user.findFirst({

        where: {

          identityNumber,
          isActive: true

        }

      });

    if (!user) {

      await createAttemptLog({

        identityNumber,

        ipAddress:
          req.ip,

        userAgent:
          req.headers['user-agent'],

        success: false,

        reason:
          'USER_NOT_FOUND'

      });

      return res.status(404).json({

        success: false,

        message:
          'User not found'

      });

    }

    const now =
      new Date();

    const activeSession =
      await prisma.attendanceSession.findFirst({

        where: {

          isActive: true,

          startTime: {
            lte: now
          },

          endTime: {
            gte: now
          }

        }

      });

    if (!activeSession) {

      return res.status(400).json({

        success: false,

        message:
          'Attendance session expired'

      });

    }

    // COOLDOWN
    const cooldown =
      await checkCooldown(

        user.id,
        activeSession.id

      );

    if (cooldown) {

      return res.status(429).json({

        success: false,

        message:
          'Please wait before next attendance attempt'

      });

    }

    const existingAttendance =
      await prisma.attendance.findFirst({

        where: {

          userId:
            user.id,

          attendanceSessionId:
            activeSession.id

        }

      });

    if (existingAttendance) {

      return res.status(400).json({

        success: false,

        message:
          'Attendance already exists'

      });

    }

    // LIVENESS VALIDATION
    if (

      smileVerified !== 'true' ||

      blinkVerified !== 'true' ||

      livenessVerified !== 'true' ||

      spoofDetected === 'true'

    ) {

      await createAttemptLog({

        identityNumber,

        ipAddress:
          req.ip,

        userAgent:
          req.headers['user-agent'],

        success: false,

        reason:
          'LIVENESS_FAILED'

      });

      await createAuditTrail({

      actorRole:
        'USER',

      actorId:
        user.id,

      action:
        'LIVENESS_FAILED',

      entity:
        'Attendance',

      description:
        `${user.fullName} failed liveness verification`,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent']

    });

      const io =
        getIO();

      io.to('admins').emit(

        'spoof:alert',

        {

          user: {

            fullName:
              user.fullName,

            identityNumber:
              user.identityNumber,

            division:
              user.division

          },

          detection: {

            spoofDetected:
              spoofDetected === 'true',

            smileVerified:
              smileVerified === 'true',

            blinkVerified:
              blinkVerified === 'true',

            livenessVerified:
              livenessVerified === 'true'

          },

          createdAt:
            new Date()

        }

      );

      return res.status(400).json({

        success: false,

        message:
          'Liveness verification failed'

      });

    }

    // IMAGE PATH
    const uploadedImagePath =
      path.join(
        process.cwd(),
        req.file.path
      );

    // EXTRACT DESCRIPTOR
    const realtimeDescriptor =
      await extractFaceDescriptor(
        uploadedImagePath
      );

    if (!realtimeDescriptor) {

      await createAttemptLog({

        identityNumber,

        ipAddress:
          req.ip,

        userAgent:
          req.headers['user-agent'],

        success: false,

        reason:
          'FACE_NOT_DETECTED'

      });

      await createAuditTrail({

      actorRole:
        'USER',

      actorId:
        user.id,

      action:
        'FACE_NOT_DETECTED',

      entity:
        'Attendance',

      description:
        `${user.fullName} face was not detected`,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent']

    });

      return res.status(400).json({

        success: false,

        message:
          'Face not detected'

      });

    }

    // DATABASE DESCRIPTOR
    let databaseDescriptor;

    try {

      databaseDescriptor =
        typeof user.faceDescriptor === "string"
          ? JSON.parse(user.faceDescriptor)
          : user.faceDescriptor;

    } catch (error) {

      console.error(
        "FACE DESCRIPTOR PARSE ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Invalid face descriptor format"

      });
    }

    // FACE MATCHING
    const matchResult =
      compareFaceDescriptors(

        realtimeDescriptor,
        databaseDescriptor

      );

    if (!matchResult.isMatch) {

      await createAttemptLog({

        identityNumber,

        ipAddress:
          req.ip,

        userAgent:
          req.headers['user-agent'],

        success: false,

        reason:
          'FACE_MISMATCH'

      });

      await createAuditTrail({

      actorRole:
        'USER',

      actorId:
        user.id,

      action:
        'FACE_MISMATCH',

      entity:
        'Attendance',

      description:
        `${user.fullName} failed face verification`,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent']

    });

      return res.status(401).json({

        success: false,

        message:
          'Face does not match',

        distance:
          matchResult.distance

      });

    }

    // CONFIDENCE
    const confidenceScore =
      Number(

        (
          1 -
          matchResult.distance
        ).toFixed(2)

      );

    // CREATE ATTENDANCE
    const attendance =
      await prisma.attendance.create({

        data: {

          userId:
            user.id,

          attendanceSessionId:
            activeSession.id,

          confidenceScore,

          smileVerified: true,

          blinkVerified: true,

          livenessVerified: true,

          spoofDetected: false,

          status: 'HADIR'

        }

      });

      await createAuditTrail({

      actorRole:
        'USER',

      actorId:
        user.id,

      action:
        'ATTENDANCE_CHECKIN',

      entity:
        'Attendance',

      entityId:
        attendance.id,

      description:
        `${user.fullName} successfully checked in`,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent']

    });

    // SUCCESS ATTEMPT LOG
    await createAttemptLog({

      identityNumber,

      ipAddress:
        req.ip,

      userAgent:
        req.headers['user-agent'],

      success: true,

      reason:
        'ATTENDANCE_SUCCESS'

    });

    // TOTAL ATTENDANCE
    const totalAttendance =
      await prisma.attendance.count({

        where: {

          attendanceSessionId:
            activeSession.id,

          status: 'HADIR'

        }

      });

    const io =
      getIO();

    // REALTIME ATTENDANCE
    io.to('admins').emit(

      'attendance:new',

      {

        user: {

          fullName:
            user.fullName,

          identityNumber:
            user.identityNumber,

          division:
            user.division

        },

        attendance: {

          status: 'HADIR',

          confidenceScore,

          createdAt:
            attendance.createdAt

        },

        statistics: {

          totalAttendance

        }

      }

    );

    // DASHBOARD UPDATE
    io.to('dashboard').emit(

      'dashboard:update',

      {

        latestAttendance: {

          fullName:
            user.fullName,

          identityNumber:
            user.identityNumber,

          division:
            user.division,

          status: 'HADIR',

          confidenceScore

        },

        statistics: {

          totalAttendance

        }

      }

    );

    return res.status(201).json({

      success: true,

      message:
        'AI attendance successful',

      data: {

        confidenceScore,

        distance:
          matchResult.distance

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


// HISTORY
const getAttendanceHistory =
  async (req, res) => {

    try {

      const {

        year,
        month,
        date,
        division,
        status

      } = req.query;

      const filters = {};

      if (status) {
        filters.status = status;
      }

      if (division) {

        filters.user = {
          division
        };

      }

      if (date) {

        const startDate =
          new Date(date);

        const endDate =
          new Date(date);

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filters.createdAt = {

          gte: startDate,
          lte: endDate

        };

      }

      if (month && year) {

        const startMonth =
          new Date(
            year,
            month - 1,
            1
          );

        const endMonth =
          new Date(
            year,
            month,
            0
          );

        filters.createdAt = {

          gte: startMonth,
          lte: endMonth

        };

      }

      const attendances =
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

      return res.status(200).json({

        success: true,

        data: attendances

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

// REALTIME ATTENDANCE FEED
const getRealtimeAttendanceFeed =
  async (req, res) => {

    try {

      const realtimeAttendance =
        await prisma.attendance.findMany({

          include: {

            user: {

              select: {

                id: true,
                fullName: true,
                identityNumber: true,
                division: true

              }

            },

            attendanceSession: {

              select: {

                id: true,
                title: true,
                startTime: true,
                endTime: true

              }

            }

          },

          orderBy: {

            createdAt: 'desc'

          }

        });

      return res.status(200).json({

        success: true,

        total:
          realtimeAttendance.length,

        data:
          realtimeAttendance

      });

    } catch (error) {

      console.error(
        'REALTIME FEED ERROR:',
        error
      );

      return res.status(500).json({

        success: false,

        message:
          'Internal server error'

      });

    }

  };


// UPDATE STATUS
const updateAttendanceStatus =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses = [

        'IZIN',
        'SAKIT',
        'CUTI'

      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid status'

        });

      }

      const attendance =
        await prisma.attendance.findUnique({

          where: {
            id: Number(id)
          }

        });

      if (!attendance) {

        return res.status(404).json({

          success: false,

          message:
            'Attendance not found'

        });

      }

      if (
        attendance.status !==
        'ABSEN'
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Only ABSEN can be updated'

        });

      }

      const updatedAttendance =
        await prisma.attendance.update({

          where: {
            id: Number(id)
          },

          data: {
            status
          }

        });

      return res.status(200).json({

        success: true,

        data:
          updatedAttendance

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

  verifyUserAttendance,
  checkInAttendance,
  getAttendanceHistory,
  updateAttendanceStatus,
  getRealtimeAttendanceFeed

}; 