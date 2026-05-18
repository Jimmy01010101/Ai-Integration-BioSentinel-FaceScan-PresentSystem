import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  ShieldAlert,
  RefreshCcw,
  ScanFace
} from 'lucide-react';

import {
  getSpoofLogs,
  getAttendanceStatistics
} from '../../services/adminService';


const AdminSecurityPage = () => {

  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);


  const fetchData = async () => {

    try {

      setLoading(true);

      const [spoofRes, statRes] = await Promise.all([
        getSpoofLogs(),
        getAttendanceStatistics()
      ]);

      setLogs(spoofRes?.data || []);

      setStats(statRes?.data || null);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat data keamanan');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID');

  };


  return (

    <div className="text-white">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

        <div>

          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <ShieldAlert className="text-bs-red" size={32} />
            Security
          </h1>

          <p className="text-bs-muted mt-1 text-sm">
            Deteksi spoof & pemantauan keamanan presensi
          </p>

        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-bs-panel-2 border border-bs-line hover:bg-bs-red-deep/30 transition-all px-4 py-3 rounded-2xl"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>

      </div>


      {/* STATS */}
      <div className="grid grid-cols-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <p className="text-bs-muted text-sm mb-2">Total Presensi</p>
          <p className="text-2xl sm:text-3xl font-black">{stats?.totalAttendance ?? 0}</p>
        </div>

        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <p className="text-bs-muted text-sm mb-2">Hadir</p>
          <p className="text-2xl sm:text-3xl font-black text-green-400">{stats?.hadir ?? 0}</p>
        </div>

        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <p className="text-bs-muted text-sm mb-2">Absen</p>
          <p className="text-2xl sm:text-3xl font-black text-bs-red-bright">{stats?.absen ?? 0}</p>
        </div>

        <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">
          <p className="text-bs-muted text-sm mb-2">Spoof Terdeteksi</p>
          <p className="text-2xl sm:text-3xl font-black text-bs-red-bright">
            {stats?.spoofDetected ?? 0}
          </p>
        </div>

      </div>


      {/* SPOOF LOGS */}
      <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">

        <h2 className="font-bold mb-4 flex items-center gap-2">
          <ScanFace size={18} className="text-bs-red" />
          Riwayat Deteksi Spoof
        </h2>

        {loading ? (

          <p className="text-bs-faint text-center py-6 sm:py-10">Memuat data...</p>

        ) : logs.length === 0 ? (

          <p className="text-bs-faint text-center py-6 sm:py-10">
            Tidak ada deteksi spoof
          </p>

        ) : (

          <div className="space-y-3">

            {logs.map((log) => (

              <div
                key={log.id}
                className="bg-bs-panel-2 border border-bs-line rounded-2xl p-5 flex items-center justify-between"
              >

                <div>
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

                {log.imagePath && (
                  <img
                    src={`http://localhost:5050/${log.imagePath}`}
                    alt="spoof"
                    className="w-16 h-16 rounded-xl object-cover border border-bs-line"
                  />
                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

};

export default AdminSecurityPage; 