const prisma = require('../../config/prisma');

const {
  convertWIBToUTC,
  convertUTCToWIB
} = require('../../utils/timezone');

const createAttendanceSession = async (req, res) => {
  try {

    const {
      title,
      startTime,
      endTime
    } = req.body;

    if (
      !title ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete session data'
      });
    }

    // NONAKTIFKAN SESSION LAMA
    await prisma.attendanceSession.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // BUAT SESSION BARU
    const session =
      await prisma.attendanceSession.create({
        data: {
          title,

          startTime:
            convertWIBToUTC(startTime),

          endTime:
            convertWIBToUTC(endTime),

          isActive: true
        }
      });

    return res.status(201).json({
      success: true,
      message:
        'Attendance session created',

      data: {
        ...session,

        startTimeWIB:
          convertUTCToWIB(
            session.startTime
          ),

        endTimeWIB:
          convertUTCToWIB(
            session.endTime
          )
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

const getActiveSession = async (
  req,
  res
) => {
  try {

    const now = new Date();

    const session =
      await prisma.attendanceSession.findFirst({
        where: {
          isActive: true,

          startTime: {
            lte: now
          },

          endTime: {
            gte: now
          }
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    if (!session) {

      return res.status(404).json({
        success: false,
        message:
          'No active attendance session'
      });

    }

    return res.status(200).json({
      success: true,

      data: {
        ...session,

        startTimeWIB:
          convertUTCToWIB(
            session.startTime
          ),

        endTimeWIB:
          convertUTCToWIB(
            session.endTime
          )
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


// =====================================================
// GET SESSION LIST
// Mengembalikan seluruh sesi presensi (terbaru dulu),
// lengkap dengan rekap jumlah presensi per status.
// Dipakai halaman "Riwayat Session" (Admin & Super Admin).
// =====================================================
const getSessionList = async (req, res) => {
  try {

    // AMBIL SEMUA SESI
    const sessions =
      await prisma.attendanceSession.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

    // REKAP JUMLAH PRESENSI PER STATUS PER SESI
    const grouped =
      await prisma.attendance.groupBy({
        by: ['attendanceSessionId', 'status'],
        _count: {
          _all: true
        }
      });

    // PETA: { sessionId: { HADIR: n, ABSEN: n, ... } }
    const recapMap = {};

    grouped.forEach((row) => {

      const sid = row.attendanceSessionId;

      if (!recapMap[sid]) {
        recapMap[sid] = {};
      }

      recapMap[sid][row.status] =
        row._count._all;

    });

    // GABUNGKAN SESI + REKAP
    const data = sessions.map((session) => {

      const recap = recapMap[session.id] || {};

      const totalHadir = recap.HADIR || 0;
      const totalAbsen = recap.ABSEN || 0;
      const totalIzin = recap.IZIN || 0;
      const totalCuti = recap.CUTI || 0;
      const totalSakit = recap.SAKIT || 0;

      return {
        id: session.id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
        createdAt: session.createdAt,

        startTimeWIB:
          convertUTCToWIB(session.startTime),

        endTimeWIB:
          convertUTCToWIB(session.endTime),

        totalHadir,
        totalAbsen,
        totalIzin,
        totalCuti,
        totalSakit,

        totalRecord:
          totalHadir +
          totalAbsen +
          totalIzin +
          totalCuti +
          totalSakit
      };

    });

    return res.status(200).json({
      success: true,
      total: data.length,
      data
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
  createAttendanceSession,
  getActiveSession,
  getSessionList
};