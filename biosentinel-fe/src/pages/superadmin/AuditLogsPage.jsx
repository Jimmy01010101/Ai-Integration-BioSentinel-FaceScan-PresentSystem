import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  ClipboardList,
  RefreshCcw,
  ShieldAlert
} from 'lucide-react';

import {
  getAuditLogs,
  getSecurityLogs
} from '../../services/superAdminService';


const AuditLogsPage = () => {

  const [tab, setTab] = useState('audit');

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);


  const fetchLogs = async (activeTab) => {

    try {

      setLoading(true);

      const response =
        activeTab === 'security'
          ? await getSecurityLogs()
          : await getAuditLogs();

      setLogs(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat log');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchLogs(tab);

  }, [tab]);


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

            <ClipboardList className="text-red-500" size={32} />

            Audit Logs

          </h1>

          <p className="text-red-100/50 mt-1 text-sm">

            Riwayat aktivitas sistem & kejadian keamanan

          </p>

        </div>

        <button
          onClick={() => fetchLogs(tab)}
          className="flex items-center gap-2 bg-[#101827] border border-red-950 hover:bg-red-950/30 transition-all px-4 py-3 rounded-2xl"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>

      </div>


      {/* TABS */}
      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setTab('audit')}
          className={`px-5 py-2.5 rounded-2xl font-semibold transition-all ${
            tab === 'audit'
              ? 'bg-red-700'
              : 'bg-[#101827] border border-red-950'
          }`}
        >
          Audit Trail
        </button>

        <button
          onClick={() => setTab('security')}
          className={`px-5 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
            tab === 'security'
              ? 'bg-red-700'
              : 'bg-[#101827] border border-red-950'
          }`}
        >
          <ShieldAlert size={16} />
          Security Events
        </button>

      </div>


      {/* TABLE */}
      <div className="bg-[#0b1322] border border-red-950 rounded-3xl overflow-hidden">

        <table className="w-full text-left text-sm">

          <thead className="bg-[#101827] text-red-100/60">

            <tr>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4">Aksi</th>
              <th className="px-6 py-4">Aktor</th>
              <th className="px-6 py-4">Keterangan</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-red-100/40">
                  Memuat data...
                </td>
              </tr>

            ) : logs.length === 0 ? (

              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-red-100/40">
                  Belum ada log
                </td>
              </tr>

            ) : (

              logs.map((log) => (

                <tr
                  key={log.id}
                  className="border-t border-red-950/50 hover:bg-[#101827]/50"
                >

                  <td className="px-6 py-4 text-red-100/60">
                    {formatTime(log.createdAt)}
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    {log.action}
                  </td>

                  <td className="px-6 py-4 text-red-100/70">
                    {log.actorRole || '-'}
                    {log.actorId ? ` #${log.actorId}` : ''}
                  </td>

                  <td className="px-6 py-4 text-red-100/60">
                    {log.description ||
                      log.reason ||
                      '-'}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default AuditLogsPage; 