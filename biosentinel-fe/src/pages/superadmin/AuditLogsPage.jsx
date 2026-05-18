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


function AuditLogsPage() {

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

    <div>

      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">

        <div className="flex items-start gap-3">
          <div className="bs-accent-bar h-11 self-stretch" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5">
              <ClipboardList className="text-bs-red" size={26} />
              Audit Logs
            </h1>
            <p className="text-bs-muted text-sm mt-1">
              Riwayat aktivitas sistem & kejadian keamanan
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(tab)}
          className="bs-btn bs-btn-ghost px-4 py-2.5 text-sm"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>

      </div>


      {/* TABS */}
      <div className="flex gap-2 mb-6">

        <button
          onClick={() => setTab('audit')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'audit'
              ? 'bg-bs-red text-white'
              : 'bg-bs-panel-2 text-bs-muted border border-bs-line hover:text-bs-text'
          }`}
        >
          Audit Trail
        </button>

        <button
          onClick={() => setTab('security')}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            tab === 'security'
              ? 'bg-bs-red text-white'
              : 'bg-bs-panel-2 text-bs-muted border border-bs-line hover:text-bs-text'
          }`}
        >
          <ShieldAlert size={15} />
          Security Events
        </button>

      </div>


      {/* TABLE */}
      <div className="bs-panel overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm min-w-[640px]">

            <thead className="bg-bs-panel-2 text-bs-muted">
              <tr>
                <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">WAKTU</th>
                <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">AKSI</th>
                <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">AKTOR</th>
                <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">KETERANGAN</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-bs-faint">
                    Memuat data...
                  </td>
                </tr>

              ) : logs.length === 0 ? (

                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-bs-faint">
                    Belum ada log
                  </td>
                </tr>

              ) : (

                logs.map((log) => (

                  <tr
                    key={log.id}
                    className="border-t border-bs-line hover:bg-bs-panel-2/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-bs-muted bs-mono text-xs whitespace-nowrap">
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bs-chip bg-bs-red-deep text-bs-red-bright border border-bs-red-dim">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-bs-muted">
                      {log.actorRole || '-'}
                      {log.actorId ? ` #${log.actorId}` : ''}
                    </td>
                    <td className="px-5 py-3.5 text-bs-muted">
                      {log.description || log.reason || '-'}
                    </td>
                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default AuditLogsPage;
