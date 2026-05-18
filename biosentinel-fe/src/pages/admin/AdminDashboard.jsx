import {
  Activity,
  ShieldAlert,
  Users,
  UserCheck,
  CalendarClock
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  getAttendanceSummary,
  getPresenceBoard,
  getActiveSession,
  getSpoofLogs
} from '../../services/adminService';


function AdminDashboard() {

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);

  const [presenceBoard, setPresenceBoard] = useState([]);

  const [session, setSession] = useState(null);

  const [spoofLogs, setSpoofLogs] = useState([]);


  // LOAD DASHBOARD
  const loadDashboard = async () => {

    try {

      const [
        summaryRes,
        boardRes,
        sessionRes,
        spoofRes
      ] = await Promise.all([
        getAttendanceSummary(),
        getPresenceBoard(),
        getActiveSession(),
        getSpoofLogs()
      ]);

      setSummary(summaryRes?.data || null);

      setPresenceBoard(boardRes?.data || []);

      setSession(sessionRes?.data || null);

      setSpoofLogs(spoofRes?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat dashboard admin');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadDashboard();

    const interval = setInterval(loadDashboard, 15000);

    return () => clearInterval(interval);

  }, []);


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID');

  };


  if (loading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bs-red-dim border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-red-200">Memuat Dashboard Admin...</p>
        </div>
      </div>
    );

  }

  return (

    <div className="text-white">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-2xl sm:text-2xl sm:text-3xl font-black text-bs-red mb-2">
          Admin Dashboard
        </h1>

        <p className="text-bs-muted">
          Pemantauan presensi & pusat operasional
        </p>

      </div>


      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* TOTAL USER */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bs-muted text-sm mb-2">Total User Aktif</p>
              <h2 className="text-2xl sm:text-2xl sm:text-3xl font-black">{summary?.totalUsers ?? 0}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-bs-red-deep border border-bs-line flex items-center justify-center">
              <Users className="text-bs-red" size={28} />
            </div>
          </div>
        </div>

        {/* HADIR */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bs-muted text-sm mb-2">Total Hadir</p>
              <h2 className="text-2xl sm:text-2xl sm:text-3xl font-black">{summary?.hadir ?? 0}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-bs-red-deep border border-bs-line flex items-center justify-center">
              <UserCheck className="text-bs-red" size={28} />
            </div>
          </div>
        </div>

        {/* ABSEN */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bs-muted text-sm mb-2">Total Absen</p>
              <h2 className="text-2xl sm:text-2xl sm:text-3xl font-black">{summary?.absen ?? 0}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-bs-red-deep border border-bs-line flex items-center justify-center">
              <Activity className="text-bs-red" size={28} />
            </div>
          </div>
        </div>

        {/* SPOOF */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bs-muted text-sm mb-2">Deteksi Spoof</p>
              <h2 className="text-2xl sm:text-2xl sm:text-3xl font-black">{summary?.spoof ?? 0}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-bs-red-deep border border-bs-line flex items-center justify-center">
              <ShieldAlert className="text-bs-red" size={28} />
            </div>
          </div>
        </div>

      </div>


      {/* SESSION INFO */}
      <div className="bg-bs-panel border border-bs-line rounded-3xl p-8 mb-8">

        <div className="flex items-center gap-3 mb-6">
          <CalendarClock className="text-bs-red" size={26} />
          <h2 className="text-2xl font-bold">Sesi Presensi Aktif</h2>
        </div>

        {session ? (

          <div className="grid grid-cols-1 grid-cols-1 sm:grid-cols-3 gap-5">

            <div className="bg-bs-abyss border border-bs-line rounded-2xl p-5">
              <p className="text-bs-muted text-sm mb-1">Judul</p>
              <p className="font-bold">{session.title}</p>
            </div>

            <div className="bg-bs-abyss border border-bs-line rounded-2xl p-5">
              <p className="text-bs-muted text-sm mb-1">Mulai</p>
              <p className="font-bold">
                {formatTime(session.startTime)}
              </p>
            </div>

            <div className="bg-bs-abyss border border-bs-line rounded-2xl p-5">
              <p className="text-bs-muted text-sm mb-1">Berakhir</p>
              <p className="font-bold">
                {formatTime(session.endTime)}
              </p>
            </div>

          </div>

        ) : (

          <div className="bg-bs-abyss border border-bs-line rounded-2xl p-6 text-center text-bs-muted">
            Tidak ada sesi presensi yang aktif
          </div>

        )}

      </div>


      {/* GRID: PRESENCE BOARD + SPOOF */}
      <div className="grid grid-cols-1 grid-cols-1 sm:grid-cols-2 gap-6">

        {/* PRESENCE BOARD */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-8">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-bold mb-1">Daftar Pengguna</h2>
              <p className="text-bs-muted text-sm">
                Status presensi terbaru tiap user
              </p>
            </div>

            <div className="flex items-center gap-2 text-green-400">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>

          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">

            {presenceBoard.length > 0 ? (

              presenceBoard.map((item) => {

                const status =
                  item.latestAttendance?.status || 'Belum presensi';

                return (

                  <div
                    key={item.id}
                    className="bg-bs-abyss border border-bs-line rounded-2xl p-5 flex items-center justify-between"
                  >

                    <div>
                      <h3 className="font-bold">{item.fullName}</h3>
                      <p className="text-bs-muted text-sm">
                        {item.identityNumber} · {item.division}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === 'HADIR'
                        ? 'bg-green-900/40 text-green-400'
                        : status === 'ABSEN'
                          ? 'bg-red-900/40 text-bs-red-bright'
                          : 'bg-bs-panel-2 text-bs-muted'
                    }`}>
                      {status}
                    </span>

                  </div>

                );

              })

            ) : (

              <div className="bg-bs-abyss border border-bs-line rounded-2xl p-6 text-center text-bs-muted">
                Belum ada data pengguna
              </div>

            )}

          </div>

        </div>


        {/* SPOOF LOGS */}
        <div className="bg-bs-panel border border-bs-line rounded-3xl p-8">

          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-bs-red" size={24} />
            <h2 className="text-2xl font-bold">Deteksi Spoof Terbaru</h2>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">

            {spoofLogs.length > 0 ? (

              spoofLogs.map((log) => (

                <div
                  key={log.id}
                  className="bg-bs-abyss border border-bs-line rounded-2xl p-5"
                >

                  <p className="font-semibold text-bs-red-bright">
                    {log.reason}
                  </p>

                  <p className="text-bs-faint text-sm mt-1">
                    {log.identityNumber
                      ? `Nomor Karyawan: ${log.identityNumber} · `
                      : ''}
                    {formatTime(log.createdAt)}
                  </p>

                </div>

              ))

            ) : (

              <div className="bg-bs-abyss border border-bs-line rounded-2xl p-6 text-center text-bs-muted">
                Tidak ada deteksi spoof
              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminDashboard;