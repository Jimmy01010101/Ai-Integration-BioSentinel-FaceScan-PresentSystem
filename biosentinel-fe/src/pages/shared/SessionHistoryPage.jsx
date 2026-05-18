import {
  useEffect,
  useMemo,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  History,
  Search,
  CalendarClock,
  ChevronRight,
  ArrowLeft,
  Users,
  Clock,
  CircleDot
} from 'lucide-react';

import {
  getSessionList,
  getSessionAttendance
} from '../../services/adminService';


// BADGE STATUS PRESENSI
const StatusBadge = ({ status }) => {

  const map = {
    HADIR: 'bg-[#0c2a1c] text-bs-ok border border-[#1a3a2a]',
    ABSEN: 'bg-bs-red-deep text-bs-red-bright border border-bs-red-dim',
    IZIN:  'bg-[#0c2030] text-bs-info border border-[#16344a]',
    CUTI:  'bg-[#1e1430] text-[#b98bff] border border-[#3a2a5a]',
    SAKIT: 'bg-[#2a2410] text-bs-warn border border-[#4a3e1a]'
  };

  return (
    <span className={`bs-chip ${map[status] || 'bg-bs-panel-2 text-bs-muted'}`}>
      {status}
    </span>
  );

};


// HALAMAN RIWAYAT SESSION
// Dipakai oleh Admin & Super Admin.
// Menampilkan daftar sesi presensi, lalu filter presensi
// langsung per sesi yang dipilih.
function SessionHistoryPage() {

  // --- DAFTAR SESI ---
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- DETAIL SESI TERPILIH ---
  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');


  // FETCH DAFTAR SESI
  const fetchSessions = async () => {

    try {

      setLoading(true);

      const response = await getSessionList();

      setSessions(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat daftar sesi');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchSessions();

  }, []);


  // FETCH PRESENSI SATU SESI
  const openSession = async (session) => {

    try {

      setSelected(session);

      setStatusFilter('');

      setDetailLoading(true);

      const response =
        await getSessionAttendance(session.id);

      setAttendance(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat presensi sesi');

      setAttendance([]);

    } finally {

      setDetailLoading(false);

    }

  };


  // FILTER DAFTAR SESI
  const filteredSessions = useMemo(() => {

    return sessions.filter((s) =>
      s.title?.toLowerCase().includes(search.toLowerCase())
    );

  }, [sessions, search]);


  // FILTER PRESENSI PER STATUS
  const filteredAttendance = useMemo(() => {

    if (!statusFilter) return attendance;

    return attendance.filter(
      (a) => a.status === statusFilter
    );

  }, [attendance, statusFilter]);


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  };

  const isSessionActive = (s) => {

    if (s.isActive) return true;

    const now = new Date();

    return (
      new Date(s.startTime) <= now &&
      new Date(s.endTime) >= now
    );

  };


  // =====================================================
  // TAMPILAN DETAIL SESI
  // =====================================================
  if (selected) {

    return (

      <div>

        {/* BACK */}
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-bs-muted hover:text-bs-text transition-all mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Sesi
        </button>

        {/* HEADER SESI */}
        <div className="bs-panel p-6 mb-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div className="flex items-start gap-3">
              <div className="bs-accent-bar h-12 self-stretch" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black">
                  {selected.title}
                </h1>
                <p className="bs-mono text-xs text-bs-muted mt-1">
                  SESSION #{String(selected.id).padStart(4, '0')}
                </p>
              </div>
            </div>

            {isSessionActive(selected) ? (
              <span className="bs-chip bg-[#0c2a1c] text-bs-ok border border-[#1a3a2a]">
                <CircleDot size={11} /> AKTIF
              </span>
            ) : (
              <span className="bs-chip bg-bs-panel-2 text-bs-muted border border-bs-line">
                SELESAI
              </span>
            )}

          </div>

          <div className="grid grid-cols-1 grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

            <div className="bg-bs-abyss border border-bs-line rounded-xl p-4">
              <p className="bs-mono text-[10px] text-bs-faint mb-1">MULAI</p>
              <p className="text-sm font-semibold">{formatTime(selected.startTime)}</p>
            </div>

            <div className="bg-bs-abyss border border-bs-line rounded-xl p-4">
              <p className="bs-mono text-[10px] text-bs-faint mb-1">BERAKHIR</p>
              <p className="text-sm font-semibold">{formatTime(selected.endTime)}</p>
            </div>

            <div className="bg-bs-abyss border border-bs-line rounded-xl p-4">
              <p className="bs-mono text-[10px] text-bs-faint mb-1">TOTAL PRESENSI</p>
              <p className="text-sm font-semibold">{attendance.length} record</p>
            </div>

          </div>

        </div>


        {/* FILTER STATUS */}
        <div className="flex flex-wrap gap-2 mb-5">

          {['', 'HADIR', 'ABSEN', 'IZIN', 'CUTI', 'SAKIT'].map((s) => (

            <button
              key={s || 'ALL'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'bg-bs-red text-white'
                  : 'bg-bs-panel-2 text-bs-muted border border-bs-line hover:text-bs-text'
              }`}
            >
              {s || 'SEMUA'}
            </button>

          ))}

        </div>


        {/* TABEL PRESENSI SESI */}
        <div className="bs-panel overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm min-w-[640px]">

              <thead className="bg-bs-panel-2 text-bs-muted">
                <tr>
                  <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">NAMA</th>
                  <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">NO. KARYAWAN</th>
                  <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">DIVISI</th>
                  <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">STATUS</th>
                  <th className="px-5 py-3.5 bs-mono text-[11px] tracking-wider">WAKTU</th>
                </tr>
              </thead>

              <tbody>

                {detailLoading ? (

                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-bs-faint">
                      Memuat presensi...
                    </td>
                  </tr>

                ) : filteredAttendance.length === 0 ? (

                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-bs-faint">
                      Tidak ada data presensi
                    </td>
                  </tr>

                ) : (

                  filteredAttendance.map((row) => (

                    <tr
                      key={row.id}
                      className="border-t border-bs-line hover:bg-bs-panel-2/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold">
                        {row.user?.fullName || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-bs-muted bs-mono text-xs">
                        {row.user?.identityNumber || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-bs-muted">
                        {row.user?.division || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-3.5 text-bs-muted text-xs">
                        {formatTime(row.createdAt)}
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


  // =====================================================
  // TAMPILAN DAFTAR SESI
  // =====================================================
  return (

    <div>

      {/* HEADER */}
      <div className="flex items-start gap-3 mb-7">
        <div className="bs-accent-bar h-11 self-stretch" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5">
            <History className="text-bs-red" size={26} />
            Riwayat Session
          </h1>
          <p className="text-bs-muted text-sm mt-1">
            Lihat dan filter presensi langsung dari sesinya
          </p>
        </div>
      </div>


      {/* SEARCH */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-bs-faint"
          size={17}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari sesi presensi..."
          className="bs-input pl-11 pr-4 py-3 text-sm"
        />
      </div>


      {/* DAFTAR SESI */}
      {loading ? (

        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bs-skeleton h-20 rounded-xl" />
          ))}
        </div>

      ) : filteredSessions.length === 0 ? (

        <div className="bs-panel p-14 text-center">
          <CalendarClock className="mx-auto mb-3 text-bs-faint" size={40} />
          <p className="text-bs-muted">Belum ada sesi presensi</p>
        </div>

      ) : (

        <div className="grid gap-3">

          {filteredSessions.map((session) => (

            <button
              key={session.id}
              onClick={() => openSession(session)}
              className="bs-panel bs-panel-hover p-5 text-left flex items-center gap-4 group"
            >

              {/* IKON */}
              <div className="w-12 h-12 shrink-0 rounded-xl bg-bs-red-deep border border-bs-red-dim flex items-center justify-center">
                <CalendarClock className="text-bs-red-bright" size={22} />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold truncate">{session.title}</h3>
                  {isSessionActive(session) && (
                    <span className="bs-chip bg-[#0c2a1c] text-bs-ok border border-[#1a3a2a]">
                      <CircleDot size={10} /> AKTIF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1.5 text-xs text-bs-muted flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatTime(session.startTime)}
                  </span>
                  {(session.totalHadir !== undefined ||
                    session.totalAbsen !== undefined) && (
                    <span className="flex items-center gap-1.5">
                      <Users size={12} />
                      {session.totalHadir ?? 0} hadir · {session.totalAbsen ?? 0} absen
                    </span>
                  )}
                </div>

              </div>

              {/* ARROW */}
              <ChevronRight
                className="text-bs-faint group-hover:text-bs-red-bright transition-colors shrink-0"
                size={20}
              />

            </button>

          ))}

        </div>

      )}

    </div>

  );

}

export default SessionHistoryPage;
