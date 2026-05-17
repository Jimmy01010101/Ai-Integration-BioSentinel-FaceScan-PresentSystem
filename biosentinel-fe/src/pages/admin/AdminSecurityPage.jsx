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
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-black flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} />
            Security
          </h1>

          <p className="text-red-100/50 mt-1 text-sm">
            Deteksi spoof & pemantauan keamanan presensi
          </p>

        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-[#101827] border border-red-950 hover:bg-red-950/30 transition-all px-4 py-3 rounded-2xl"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>

      </div>


      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6">
          <p className="text-red-100/60 text-sm mb-2">Total Presensi</p>
          <p className="text-3xl font-black">{stats?.totalAttendance ?? 0}</p>
        </div>

        <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6">
          <p className="text-red-100/60 text-sm mb-2">Hadir</p>
          <p className="text-3xl font-black text-green-400">{stats?.hadir ?? 0}</p>
        </div>

        <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6">
          <p className="text-red-100/60 text-sm mb-2">Absen</p>
          <p className="text-3xl font-black text-red-400">{stats?.absen ?? 0}</p>
        </div>

        <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6">
          <p className="text-red-100/60 text-sm mb-2">Spoof Terdeteksi</p>
          <p className="text-3xl font-black text-red-400">
            {stats?.spoofDetected ?? 0}
          </p>
        </div>

      </div>


      {/* SPOOF LOGS */}
      <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6">

        <h2 className="font-bold mb-4 flex items-center gap-2">
          <ScanFace size={18} className="text-red-500" />
          Riwayat Deteksi Spoof
        </h2>

        {loading ? (

          <p className="text-red-100/40 text-center py-10">Memuat data...</p>

        ) : logs.length === 0 ? (

          <p className="text-red-100/40 text-center py-10">
            Tidak ada deteksi spoof
          </p>

        ) : (

          <div className="space-y-3">

            {logs.map((log) => (

              <div
                key={log.id}
                className="bg-[#101827] border border-red-950 rounded-2xl p-5 flex items-center justify-between"
              >

                <div>
                  <p className="font-semibold text-red-400">
                    {log.reason}
                  </p>
                  <p className="text-red-100/40 text-sm mt-1">
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
                    className="w-16 h-16 rounded-xl object-cover border border-red-950"
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