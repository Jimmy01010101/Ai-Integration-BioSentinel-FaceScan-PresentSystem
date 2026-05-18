import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import socket from '../../services/socket';

import {
  Users,
  UserCog,
  ScanFace,
  ShieldAlert,
  Activity,
  Database,
  Eye,
  Clock3,
  CircleDot
} from 'lucide-react';

import {
  getDashboardStats,
  getTodayAttendance,
  getActiveSession,
  getRealtimeFeed
} from '../../services/superAdminService';


// KARTU STATISTIK
const StatCard = ({ icon: Icon, label, value, accent }) => (

  <div className="bs-panel bs-panel-hover p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="bs-mono text-[10px] text-bs-muted tracking-wider mb-2">
          {label}
        </p>
        <h2 className="text-3xl font-black">{value}</h2>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
        accent
          ? 'bg-bs-red-deep border-bs-red-dim'
          : 'bg-bs-panel-2 border-bs-line'
      }`}>
        <Icon
          className={accent ? 'text-bs-red-bright' : 'text-bs-muted'}
          size={22}
        />
      </div>
    </div>
  </div>

);


function SuperAdminDashboard() {

  const [stats, setStats] = useState(null);

  const [todayAttendance, setTodayAttendance] = useState(null);

  const [activeSession, setActiveSession] = useState(null);

  const [realtimeFeed, setRealtimeFeed] = useState([]);

  const [loading, setLoading] = useState(true);


  // LOAD DASHBOARD
  const loadDashboard = async () => {

    try {

      setLoading(true);

      try {
        const statsData = await getDashboardStats();
        setStats(statsData.data);
      } catch (error) {
        console.error('Stats Error:', error);
      }

      try {
        const todayData = await getTodayAttendance();
        setTodayAttendance(todayData.data);
      } catch (error) {
        console.error('Today Error:', error);
      }

      try {
        const sessionData = await getActiveSession();
        setActiveSession(sessionData.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setActiveSession(null);
        } else {
          console.error('Session Error:', error);
        }
      }

      try {
        const realtimeData = await getRealtimeFeed();
        setRealtimeFeed(realtimeData.data || []);
      } catch (error) {
        console.error('Realtime Error:', error);
      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };


  // INIT + SOCKET
  useEffect(() => {

    loadDashboard();

    socket.emit('dashboard:join');

    const attendanceHandler = () => {
      toast.success('Presensi baru terdeteksi');
      loadDashboard();
    };

    const sessionHandler = () => {
      toast('Sesi diperbarui');
      loadDashboard();
    };

    const spoofHandler = () => {
      toast.error('Peringatan spoof terdeteksi');
      loadDashboard();
    };

    socket.on('attendance:new', attendanceHandler);
    socket.on('session:update', sessionHandler);
    socket.on('spoof:alert', spoofHandler);

    const interval = setInterval(loadDashboard, 15000);

    return () => {
      clearInterval(interval);
      socket.off('attendance:new', attendanceHandler);
      socket.off('session:update', sessionHandler);
      socket.off('spoof:alert', spoofHandler);
    };

  }, []);


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

  };


  // HITUNG REALTIME PRESENCE (HADIR hari ini)
  const realtimePresence =
    Array.isArray(todayAttendance)
      ? todayAttendance.filter(
          (item) => item.status === 'HADIR'
        ).length
      : 0;

  // HITUNG SECURITY ALERTS (spoof di feed)
  const securityAlerts =
    realtimeFeed.filter(
      (item) => item.spoofDetected
    ).length;


  if (loading && !stats) {

    return (
      <div className="grid gap-4">
        <div className="bs-skeleton h-9 w-72 rounded-lg" />
        <div className="grid grid-cols-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bs-skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="bs-skeleton h-64 rounded-2xl" />
      </div>
    );

  }

  return (

    <div>

      {/* HEADER */}
      <div className="flex items-start gap-3 mb-7">
        <div className="bs-accent-bar h-11 self-stretch" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Super Admin Dashboard
          </h1>
          <p className="text-bs-muted text-sm mt-1">
            Pusat kendali tata kelola & pemantauan sistem
          </p>
        </div>
      </div>


      {/* STATS */}
      <div className="grid grid-cols-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <StatCard
          icon={Users}
          label="TOTAL USERS"
          value={stats?.users?.total ?? 0}
          accent
        />

        <StatCard
          icon={UserCog}
          label="TOTAL ADMIN"
          value={stats?.admins?.total ?? 0}
          accent
        />

        <StatCard
          icon={ScanFace}
          label="PRESENSI HARI INI"
          value={stats?.attendance?.today ?? 0}
          accent
        />

        <StatCard
          icon={ShieldAlert}
          label="SECURITY ALERTS"
          value={securityAlerts}
          accent
        />

      </div>


      {/* GRID UTAMA */}
      <div className="grid grid-cols-1 xl:grid-cols-1 sm:grid-cols-3 gap-6">

        {/* KIRI — MONITORING */}
        <div className="xl:col-span-2 space-y-6">

          {/* REALTIME MONITORING */}
          <div className="bs-panel p-6">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Activity className="text-bs-red" size={20} />
                <h2 className="text-lg font-bold">Realtime Monitoring</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="bs-live-dot" />
                <span className="bs-mono text-[10px] text-bs-ok tracking-wider">
                  ONLINE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 grid-cols-1 sm:grid-cols-2 gap-4">

              {/* ACTIVE SESSION */}
              <div className="bg-bs-abyss border border-bs-line rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock3 size={15} className="text-bs-red" />
                  <p className="bs-mono text-[10px] text-bs-muted tracking-wider">
                    SESI AKTIF
                  </p>
                </div>
                <p className="font-bold text-sm">
                  {activeSession?.title || 'Tidak ada sesi aktif'}
                </p>
                {activeSession && (
                  <p className="text-bs-muted text-xs mt-1">
                    s/d {formatTime(activeSession.endTime)}
                  </p>
                )}
              </div>

              {/* REALTIME PRESENCE */}
              <div className="bg-bs-abyss border border-bs-line rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={15} className="text-bs-red" />
                  <p className="bs-mono text-[10px] text-bs-muted tracking-wider">
                    REALTIME PRESENCE
                  </p>
                </div>
                <p className="text-2xl font-black">{realtimePresence}</p>
                <p className="text-bs-muted text-xs">hadir hari ini</p>
              </div>

              {/* AI DETECTION */}
              <div className="bg-bs-abyss border border-bs-line rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ScanFace size={15} className="text-bs-red" />
                  <p className="bs-mono text-[10px] text-bs-muted tracking-wider">
                    AI DETECTION
                  </p>
                </div>
                <p className="font-bold text-bs-ok flex items-center gap-2">
                  <CircleDot size={14} /> Online
                </p>
              </div>

              {/* DATABASE */}
              <div className="bg-bs-abyss border border-bs-line rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={15} className="text-bs-red" />
                  <p className="bs-mono text-[10px] text-bs-muted tracking-wider">
                    DATABASE HEALTH
                  </p>
                </div>
                <p className="font-bold text-bs-ok flex items-center gap-2">
                  <CircleDot size={14} /> Connected
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* KANAN — SECURITY + FEED */}
        <div className="space-y-6">

          {/* SECURITY */}
          <div className="bs-panel p-6">

            <div className="flex items-center gap-2.5 mb-4">
              <ShieldAlert className="text-bs-red" size={20} />
              <h2 className="text-lg font-bold">Security Alerts</h2>
            </div>

            <div className="bg-bs-abyss border border-bs-line rounded-xl p-5">
              <p className="bs-mono text-[10px] text-bs-muted tracking-wider mb-1">
                SPOOF DETECTION
              </p>
              <p className="text-sm text-bs-muted">
                Sistem deteksi spoof AI aktif.
              </p>
              <p className="text-3xl font-black mt-3">
                {securityAlerts}
              </p>
              <p className="text-bs-muted text-xs">
                peringatan terdeteksi
              </p>
            </div>

          </div>


          {/* REALTIME FEED */}
          <div className="bs-panel p-6">

            <div className="flex items-center gap-2.5 mb-4">
              <Activity className="text-bs-red" size={20} />
              <h2 className="text-lg font-bold">Realtime Feed</h2>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto">

              {realtimeFeed.length === 0 ? (

                <p className="text-bs-faint text-sm text-center py-8">
                  Belum ada aktivitas
                </p>

              ) : (

                realtimeFeed.slice(0, 12).map((item, index) => (

                  <div
                    key={item.id || index}
                    className="bg-bs-abyss border border-bs-line rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.spoofDetected ? 'bg-bs-red-bright' : 'bg-bs-ok'
                      }`} />
                      <p className="text-sm font-semibold truncate">
                        {item.user?.fullName || 'Realtime Activity'}
                      </p>
                    </div>
                    <p className="bs-mono text-[10px] text-bs-faint mt-1 pl-3.5">
                      {formatTime(item.createdAt)}
                    </p>
                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default SuperAdminDashboard;
