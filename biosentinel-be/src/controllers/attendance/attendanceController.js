const prisma = require('../../config/prisma');
const path = require('path');

const { getIO } = require('../../socket/socket');

const {
  extractFaceDescriptor,
  compareFaceDescriptors
} = require('../../ai/faceMatcher');

const {
  createAttemptLog,
  getFailedAttempts,
  checkCooldown
} = require('../../utils/attendanceSecurity');

const {
  createAuditTrail
} = require('../../utils/auditTrail');

// =====================================================
// VERIFY USER
// =====================================================
const verifyUserAttendance = async (req, res) => {
  try {
    const { identityNumber } = req.body;

    if (!identityNumber) {
      return res.status(400).json({
        success: false,
        message: 'Identity number required'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        identityNumber,
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        identityNumber: true,
        division: true,
        faceDescriptor: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User verified',
      data: user
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Verify user failed'
    });
  }
};

// =====================================================
// CHECK IN ATTENDANCE
// =====================================================
const checkInAttendance = async (req, res) => {
  try {
    const {
      identityNumber,
      smileVerified,
      blinkVerified,
      livenessVerified,
      spoofDetected,
      confidenceScore
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Face image is required'
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================
    const user = await prisma.user.findFirst({
      where: {
        identityNumber,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // =====================================================
    // ACTIVE SESSION
    // =====================================================
    const now = new Date();

    const activeSession = await prisma.attendanceSession.findFirst({
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
        message: 'Attendance session expired'
      });
    }

    // =====================================================
    // DUPLICATE CHECK
    // =====================================================
    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          userId: user.id,
          attendanceSessionId: activeSession.id
        }
      });

    if (existingAttendance) {
      return res.status(200).json({
        success: true,
        duplicated: true,
        message: 'Attendance already recorded',
        data: existingAttendance
      });
    }

    // =====================================================
    // COOLDOWN CHECK
    // =====================================================
    const cooldown = await checkCooldown(
      user.id,
      activeSession.id
    );

    if (cooldown) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before next attempt'
      });
    }

    // =====================================================
    // LIVENESS VALIDATION
    // =====================================================
    const smileDetected =
      smileVerified === true ||
      smileVerified === 'true';

    const blinkDetected =
      blinkVerified === true ||
      blinkVerified === 'true';

    const livenessPassed =
      livenessVerified === true ||
      livenessVerified === 'true';

    const spoofDetectedValue =
      spoofDetected === true ||
      spoofDetected === 'true';

    if (
      !smileDetected ||
      !blinkDetected ||
      !livenessPassed ||
      spoofDetectedValue
    ) {
      const io = getIO();

      io.to('admins').emit('spoof:alert', {
        user: {
          fullName: user.fullName,
          identityNumber: user.identityNumber,
          division: user.division
        },
        createdAt: new Date()
      });

      return res.status(400).json({
        success: false,
        message: 'Liveness verification failed'
      });
    }

    // =====================================================
    // FACE MATCHING
    // =====================================================
    const uploadedImagePath = path.join(
      process.cwd(),
      req.file.path
    );

    const realtimeDescriptor =
      await extractFaceDescriptor(uploadedImagePath);

    if (!realtimeDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Face not detected'
      });
    }

    let databaseDescriptor = [];

    try {
      databaseDescriptor =
        typeof user.faceDescriptor === 'string'
          ? JSON.parse(user.faceDescriptor)
          : user.faceDescriptor;

    } catch (error) {
      console.error(
        'FACE DESCRIPTOR PARSE ERROR:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Invalid face descriptor'
      });
    }

    const matchResult = compareFaceDescriptors(
      realtimeDescriptor,
      databaseDescriptor
    );

    if (!matchResult.isMatch) {
      await createAttemptLog({
        userId: user.id,
        attendanceSessionId: activeSession.id,
        reason: 'FACE_NOT_MATCHED'
      });

      return res.status(400).json({
        success: false,
        message: 'Face verification failed'
      });
    }

    // =====================================================
    // SAVE ATTENDANCE
    // =====================================================
    const attendance =
      await prisma.attendance.create({
        data: {
          userId: user.id,
          attendanceSessionId: activeSession.id,

          confidenceScore:
            Number(confidenceScore || matchResult.confidence || 0),

          smileVerified: smileDetected,
          blinkVerified: blinkDetected,
          livenessVerified: livenessPassed,
          spoofDetected: spoofDetectedValue,

          status: 'HADIR'
        },

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
        }
      });

    // =====================================================
    // SOCKET REALTIME
    // =====================================================
    const io = getIO();

    io.to('admins').emit(
      'attendance:new',
      attendance
    );

    // =====================================================
    // AUDIT
    // =====================================================
    await createAuditTrail({
      action: 'ATTENDANCE_CHECKIN',
      description: `${user.fullName} checked in attendance`,
      userId: user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance success',
      data: attendance
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Attendance failed'
    });
  }
};

// =====================================================
// HISTORY
// =====================================================
const getAttendanceHistory = async (req, res) => {
  try {
    const attendances =
      await prisma.attendance.findMany({
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
      total: attendances.length,
      data: attendances
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed get attendance history'
    });
  }
};

// =====================================================
// REALTIME FEED
// =====================================================
const getRealtimeAttendanceFeed = async (req, res) => {
  try {
    const attendances =
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
        },

        take: 50
      });

    return res.status(200).json({
      success: true,
      total: attendances.length,
      data: attendances
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed get realtime feed'
    });
  }
};

// =====================================================
// UPDATE STATUS
// =====================================================
const updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const attendance =
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
      message: 'Attendance updated',
      data: attendance
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed update attendance'
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