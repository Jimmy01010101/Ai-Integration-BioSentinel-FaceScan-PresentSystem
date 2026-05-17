const prisma = require('../../config/prisma');
const path = require('path');

const { getIO } = require('../../socket/socket');

const {
  extractFaceDescriptor,
  compareFaceDescriptors
} = require('../../ai/faceMatcher');

const {
  createAttemptLog,
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
        message: 'Tolong Memasukkan Identitas yang Valid'
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
// Frontend mengirim FormData: faceImage (file) +
// identityNumber + smileVerified + blinkVerified +
// livenessVerified + spoofDetected.
// Server mengekstrak descriptor dari foto sendiri.
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

    // =====================================================
    // VALIDASI INPUT
    // =====================================================
    if (!identityNumber) {

      return res.status(400).json({
        success: false,
        message: 'Identity number required'
      });

    }

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

    const activeSession =
      await prisma.attendanceSession.findFirst({
        where: {
          isActive: true,
          startTime: { lte: now },
          endTime: { gte: now }
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
    // ATURAN SISTEM: presensi mensyaratkan SENYUM + bukti
    // manusia nyata (livenessVerified) + tidak spoof.
    // blinkVerified bersifat OPSIONAL — tidak memblokir.
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
      !livenessPassed ||
      spoofDetectedValue
    ) {

      const reason =
        spoofDetectedValue
          ? 'SPOOF_DETECTED'
          : !smileDetected
            ? 'SMILE_NOT_DETECTED'
            : 'LIVENESS_FAILED';

      // CATAT SPOOF LOG
      try {

        await prisma.spoofLog.create({
          data: {
            userId: user.id,
            identityNumber: user.identityNumber,
            imagePath:
              req.file
                ? req.file.path.replace(/\\/g, '/')
                : null,
            reason
          }
        });

      } catch (logError) {

        console.error('SpoofLog error:', logError);

      }

      // ALERT REALTIME KE ADMIN
      try {

        const io = getIO();

        io.to('admins').emit('spoof:alert', {
          user: {
            fullName: user.fullName,
            identityNumber: user.identityNumber,
            division: user.division
          },
          reason,
          createdAt: new Date()
        });

      } catch (ioError) {

        console.error('Socket error:', ioError);

      }

      return res.status(400).json({
        success: false,
        message: 'Liveness verification failed'
      });

    }

    // =====================================================
    // FACE MATCHING
    // Server mengekstrak descriptor dari foto yang dikirim.
    // =====================================================
    const uploadedImagePath = path.join(
      process.cwd(),
      req.file.path
    );

    const realtimeDescriptor =
      await extractFaceDescriptor(uploadedImagePath);

    if (!realtimeDescriptor) {

      await createAttemptLog({
        identityNumber: user.identityNumber,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success: false,
        reason: 'FACE_NOT_DETECTED'
      });

      return res.status(400).json({
        success: false,
        message: 'Wajah tidak terdeteksi pada gambar'
      });

    }

    // DESCRIPTOR TERSIMPAN DI DB
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

    // BANDINGKAN WAJAH
    const matchResult =
      compareFaceDescriptors(
        realtimeDescriptor,
        databaseDescriptor
      );

    if (!matchResult.isMatch) {

      await createAttemptLog({
        identityNumber: user.identityNumber,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success: false,
        reason: 'FACE_NOT_MATCHED'
      });

      return res.status(400).json({
        success: false,
        message: 'Wajah tidak sesuai dengan user',
        data: matchResult
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

          confidenceScore: Number(
            confidenceScore ||
            matchResult.confidence ||
            0
          ),

          faceDistance:
            matchResult.distance ?? null,

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

    // CATAT PERCOBAAN BERHASIL
    await createAttemptLog({
      identityNumber: user.identityNumber,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: true,
      reason: 'ATTENDANCE_SUCCESS'
    });

    // SOCKET REALTIME
    try {

      const io = getIO();

      io.to('admins').emit(
        'attendance:new',
        attendance
      );

    } catch (ioError) {

      console.error('Socket error:', ioError);

    }

    // AUDIT TRAIL
    await createAuditTrail({
      actorRole: 'USER',
      actorId: user.id,
      action: 'ATTENDANCE_CHECKIN',
      entity: 'Attendance',
      entityId: attendance.id,
      description:
        `${user.fullName} successfully checked in`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance success',
      data: attendance
    });

  } catch (error) {

    console.error('CHECK IN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Attendance failed'
    });

  }

};


// =====================================================
// HISTORY (ADMIN / SUPER ADMIN)
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
// REALTIME FEED (ADMIN / SUPER ADMIN)
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
// UPDATE STATUS (KELOLA STATUS - ADMIN)
// ATURAN: hanya record ABSEN yang boleh diubah, dan
// hanya menjadi IZIN / CUTI / SAKIT.
// =====================================================
const updateAttendanceStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = ['IZIN', 'CUTI', 'SAKIT'];

    if (!status) {

      return res.status(400).json({
        success: false,
        message: 'Status wajib diisi'
      });

    }

    if (!allowedStatuses.includes(status)) {

      return res.status(400).json({
        success: false,
        message:
          'Status hanya boleh diubah menjadi IZIN, CUTI, atau SAKIT'
      });

    }

    const attendance =
      await prisma.attendance.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          attendanceSession: true
        }
      });

    if (!attendance) {

      return res.status(404).json({
        success: false,
        message: 'Attendance tidak ditemukan'
      });

    }

    if (attendance.status !== 'ABSEN') {

      return res.status(400).json({
        success: false,
        message:
          'Hanya attendance dengan status ABSEN yang dapat diubah'
      });

    }

    const updatedAttendance =
      await prisma.attendance.update({
        where: { id: Number(id) },
        data: {
          status,
          note: note || null
        },
        include: {
          user: true,
          attendanceSession: true
        }
      });

    // AUDIT TRAIL
    await createAuditTrail({
      actorRole: req.user?.role || 'ADMIN',
      actorId: req.user?.id || null,
      action: 'MANAGE_ATTENDANCE_STATUS',
      entity: 'Attendance',
      entityId: updatedAttendance.id,
      description:
        `Status presensi ${attendance.user?.fullName} diubah dari ABSEN menjadi ${status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance status berhasil diperbarui',
      data: updatedAttendance
    });

  } catch (error) {

    console.error(
      'UPDATE ATTENDANCE STATUS ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed update attendance'
    });

  }

};


// =====================================================
// RIWAYAT PRESENSI USER (PUBLIK)
// Tanpa login — diakses USER dengan Nomor Karyawan.
// Filter: weekly / monthly / yearly / date
// =====================================================
const getUserPublicHistory = async (req, res) => {

  try {

    const {
      identityNumber,
      filter,
      year,
      month,
      date
    } = req.query;

    if (!identityNumber) {

      return res.status(400).json({
        success: false,
        message: 'Tolong Memasukkan Identitas yang Valid'
      });

    }

    const user = await prisma.user.findFirst({
      where: { identityNumber },
      select: {
        id: true,
        fullName: true,
        identityNumber: true,
        division: true
      }
    });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'Tolong Memasukkan Identitas yang Valid'
      });

    }

    const now = new Date();

    const where = { userId: user.id };

    const activeFilter = filter || 'weekly';

    if (activeFilter === 'yearly') {

      const y = Number(year) || now.getFullYear();

      where.createdAt = {
        gte: new Date(y, 0, 1, 0, 0, 0),
        lte: new Date(y, 11, 31, 23, 59, 59)
      };

    } else if (activeFilter === 'monthly') {

      const y = Number(year) || now.getFullYear();
      const m =
        month !== undefined && month !== ''
          ? Number(month) - 1
          : now.getMonth();

      where.createdAt = {
        gte: new Date(y, m, 1, 0, 0, 0),
        lte: new Date(y, m + 1, 0, 23, 59, 59)
      };

    } else if (activeFilter === 'date' && date) {

      const target = new Date(date);

      where.createdAt = {
        gte: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
          0, 0, 0
        ),
        lte: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
          23, 59, 59
        )
      };

    } else {

      // WEEKLY (default) — Senin s/d Minggu minggu ini
      const dayOfWeek = now.getDay();
      const diffToMonday =
        dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: monday,
        lte: sunday
      };

    }

    const history = await prisma.attendance.findMany({
      where,
      include: {
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

    const summary = {
      hadir: 0,
      absen: 0,
      izin: 0,
      cuti: 0,
      sakit: 0,
      total: history.length
    };

    history.forEach((item) => {
      const key = item.status.toLowerCase();
      if (summary[key] !== undefined) {
        summary[key] += 1;
      }
    });

    return res.status(200).json({
      success: true,
      filter: activeFilter,
      user,
      summary,
      total: history.length,
      data: history
    });

  } catch (error) {

    console.error(
      'GET USER PUBLIC HISTORY ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed get attendance history'
    });

  }

};


module.exports = {
  verifyUserAttendance,
  checkInAttendance,
  getAttendanceHistory,
  getUserPublicHistory,
  updateAttendanceStatus,
  getRealtimeAttendanceFeed
}; 