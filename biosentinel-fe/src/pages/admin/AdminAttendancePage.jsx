import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  Activity,
  CalendarClock,
  Filter,
  Settings2,
  Printer,
  Loader2,
  X
} from 'lucide-react';

import {
  getDailyRecap,
  filterAttendance,
  manageAttendanceStatus,
  getActiveSession
} from '../../services/adminService';


// BADGE STATUS
const StatusBadge = ({ status }) => {

  const map = {
    HADIR: 'bg-green-900/40 text-green-400',
    ABSEN: 'bg-red-900/40 text-red-400',
    IZIN: 'bg-blue-900/40 text-blue-300',
    CUTI: 'bg-purple-900/40 text-purple-300',
    SAKIT: 'bg-yellow-900/40 text-yellow-300'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-[#101827] text-red-100/60'}`}>
      {status}
    </span>
  );

};


const AdminAttendancePage = () => {

  const [tab, setTab] = useState('daily');

  // --- SESI AKTIF (untuk logika "Sedang Dihitung") ---
  const [activeSession, setActiveSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // --- DATA HARIAN ---
  const [dailyLoading, setDailyLoading] = useState(true);
  const [daily, setDaily] = useState([]);

  // --- RIWAYAT ---
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [filterForm, setFilterForm] = useState({
    period: 'all',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    date: '',
    status: '',
    division: ''
  });

  // --- KELOLA STATUS MODAL ---
  const [modalRow, setModalRow] = useState(null);
  const [modalStatus, setModalStatus] = useState('IZIN');
  const [modalNote, setModalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);


  // ============ CEK SESI AKTIF ============
  const fetchActiveSession = async () => {

    try {

      const response = await getActiveSession();

      setActiveSession(response?.data || null);

    } catch (error) {

      // 404 = tidak ada sesi aktif, itu normal
      setActiveSession(null);

    } finally {

      setSessionChecked(true);

    }

  };


  // ============ DATA HARIAN ============
  const fetchDaily = async () => {

    try {

      setDailyLoading(true);

      const response = await getDailyRecap();

      setDaily(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat data presensi harian');

    } finally {

      setDailyLoading(false);

    }

  };

  useEffect(() => {

    fetchActiveSession();

    fetchDaily();

  }, []);


  // APAKAH WAKTU PRESENSI MASIH BERJALAN?
  // Jika sesi aktif & endTime belum lewat -> "Sedang Dihitung"
  const isCalculating = (() => {

    if (!activeSession) return false;

    const now = new Date();

    const endTime = new Date(activeSession.endTime);

    return endTime > now;

  })();


  // FILTER TANGGAL DI FRONTEND
  const applyDateFilter = (rows) => {

    if (filterForm.period === 'all') {
      return rows;
    }

    return rows.filter((item) => {

      const created = new Date(item.createdAt);

      if (filterForm.period === 'yearly') {

        return (
          created.getFullYear() ===
          Number(filterForm.year)
        );

      }

      if (filterForm.period === 'monthly') {

        return (
          created.getFullYear() ===
            Number(filterForm.year) &&
          created.getMonth() + 1 ===
            Number(filterForm.month)
        );

      }

      if (filterForm.period === 'date' && filterForm.date) {

        const target = new Date(filterForm.date);

        return (
          created.getFullYear() === target.getFullYear() &&
          created.getMonth() === target.getMonth() &&
          created.getDate() === target.getDate()
        );

      }

      return true;

    });

  };


  // ============ RIWAYAT PRESENSI ============
  const fetchHistory = async () => {

    try {

      setHistoryLoading(true);

      // Backend hanya dukung filter status & division.
      const params = {};

      if (filterForm.status) {
        params.status = filterForm.status;
      }

      if (filterForm.division) {
        params.division = filterForm.division;
      }

      const response = await filterAttendance(params);

      let rows = response?.data || [];

      // FILTER TANGGAL — dilakukan di sisi frontend
      // (Tahunan / Bulanan / Per Tanggal)
      rows = applyDateFilter(rows);

      setHistory(rows);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat riwayat presensi');

    } finally {

      setHistoryLoading(false);

    }

  };

  useEffect(() => {

    if (tab === 'history') {
      fetchHistory();
    }

  }, [tab]);


  // ============ CETAK LAPORAN ============
  // Mengekspor data yang sedang tampil ke file CSV.
  const handlePrint = () => {

    const rows = tab === 'daily' ? daily : history;

    if (rows.length === 0) {

      toast.error('Tidak ada data untuk dicetak');

      return;

    }

    const header =
      'No,Nama,Nomor Karyawan,Divisi,Status,Sesi,Waktu\n';

    const body = rows.map((item, index) => {

      const cells = [
        index + 1,
        item.user?.fullName || '',
        item.user?.identityNumber || '',
        item.user?.division || '',
        item.status,
        (item.attendanceSession?.title || '').replace(/,/g, ' '),
        new Date(item.createdAt).toLocaleString('id-ID')
      ];

      return cells.join(',');

    }).join('\n');

    const csv = header + body;

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
      `laporan-presensi-${Date.now()}.csv`;

    link.click();

    window.URL.revokeObjectURL(url);

    toast.success('Laporan presensi diunduh');

  };


  // ============ KELOLA STATUS ============
  const openManageModal = (row) => {

    setModalRow(row);
    setModalStatus('IZIN');
    setModalNote('');

  };

  const closeManageModal = () => {

    setModalRow(null);
    setModalNote('');

  };

  const handleManageSubmit = async () => {

    try {

      setSubmitting(true);

      await manageAttendanceStatus(modalRow.id, {
        status: modalStatus,
        note: modalNote
      });

      toast.success('Status presensi berhasil diperbarui');

      closeManageModal();

      fetchDaily();

      if (tab === 'history') {
        fetchHistory();
      }

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Gagal mengubah status'
      );

    } finally {

      setSubmitting(false);

    }

  };


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID');

  };


  // RENDER TABEL PRESENSI
  const renderTable = (rows, isLoading) => (

    <div className="bg-[#0b1322] border border-red-950 rounded-3xl overflow-hidden">

      <table className="w-full text-left text-sm">

        <thead className="bg-[#101827] text-red-100/60">
          <tr>
            <th className="px-6 py-4">Nama User</th>
            <th className="px-6 py-4">Nomor Karyawan</th>
            <th className="px-6 py-4">Divisi</th>
            <th className="px-6 py-4">Keterangan</th>
            <th className="px-6 py-4">Sesi</th>
            <th className="px-6 py-4">Waktu</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>

        <tbody>

          {isLoading ? (

            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-red-100/40">
                Memuat data...
              </td>
            </tr>

          ) : rows.length === 0 ? (

            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-red-100/40">
                Tidak ada data presensi
              </td>
            </tr>

          ) : (

            rows.map((row) => (

              <tr
                key={row.id}
                className="border-t border-red-950/50 hover:bg-[#101827]/50"
              >

                <td className="px-6 py-4 font-semibold">
                  {row.user?.fullName || '-'}
                </td>

                <td className="px-6 py-4 text-red-100/70">
                  {row.user?.identityNumber || '-'}
                </td>

                <td className="px-6 py-4 text-red-100/70">
                  {row.user?.division || '-'}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>

                <td className="px-6 py-4 text-red-100/70">
                  {row.attendanceSession?.title || '-'}
                </td>

                <td className="px-6 py-4 text-red-100/60">
                  {formatTime(row.createdAt)}
                </td>

                <td className="px-6 py-4 text-right">

                  {row.status === 'ABSEN' ? (

                    <button
                      onClick={() => openManageModal(row)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#101827] hover:bg-red-900/40 transition-all text-sm"
                    >
                      <Settings2 size={15} />
                      Kelola Status
                    </button>

                  ) : (

                    <span className="text-red-100/30 text-sm">—</span>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );


  return (

    <div className="text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-black flex items-center gap-3">
            <Activity className="text-red-500" size={32} />
            Presensi
          </h1>

          <p className="text-red-100/50 mt-1 text-sm">
            Data presensi harian, riwayat & kelola status
          </p>

        </div>

        {/* CETAK LAPORAN */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#101827] border border-red-950 hover:bg-red-950/30 transition-all px-5 py-3 rounded-2xl font-semibold"
        >
          <Printer size={18} />
          Cetak Laporan Presensi
        </button>

      </div>


      {/* TABS */}
      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setTab('daily')}
          className={`px-5 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
            tab === 'daily' ? 'bg-red-700' : 'bg-[#101827] border border-red-950'
          }`}
        >
          <CalendarClock size={16} />
          Data Presensi Harian
        </button>

        <button
          onClick={() => setTab('history')}
          className={`px-5 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
            tab === 'history' ? 'bg-red-700' : 'bg-[#101827] border border-red-950'
          }`}
        >
          <Filter size={16} />
          Riwayat Presensi
        </button>

      </div>


      {/* ============ TAB: DATA HARIAN ============ */}
      {tab === 'daily' && (

        <div>

          {/* PESAN "DATA PRESENSI SEDANG DIHITUNG"
              Tampil jika sesi presensi masih berjalan
              (waktu belum habis). */}
          {sessionChecked && isCalculating ? (

            <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-16 text-center">

              <Loader2
                className="mx-auto mb-5 text-red-500 animate-spin"
                size={48}
              />

              <h2 className="text-2xl font-black mb-2">
                Data Presensi Sedang Dihitung
              </h2>

              <p className="text-red-100/50">
                Data presensi harian akan terbuka otomatis saat waktu presensi berakhir
              </p>

              {activeSession && (
                <p className="text-red-100/40 text-sm mt-4">
                  Sesi: {activeSession.title} · berakhir{' '}
                  {formatTime(activeSession.endTime)}
                </p>
              )}

            </div>

          ) : (

            renderTable(daily, dailyLoading)

          )}

        </div>

      )}


      {/* ============ TAB: RIWAYAT PRESENSI ============ */}
      {tab === 'history' && (

        <div>

          {/* FILTER BAR */}
          <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-6 mb-6">

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

              {/* PERIODE */}
              <div>
                <label className="block mb-2 text-xs text-red-200/60">Filter</label>
                <select
                  value={filterForm.period}
                  onChange={(e) =>
                    setFilterForm({ ...filterForm, period: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                >
                  <option value="all">Semua</option>
                  <option value="yearly">Tahunan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="date">Per Tanggal</option>
                </select>
              </div>

              {/* TAHUN */}
              {(filterForm.period === 'yearly' ||
                filterForm.period === 'monthly') && (
                <div>
                  <label className="block mb-2 text-xs text-red-200/60">Tahun</label>
                  <input
                    type="number"
                    value={filterForm.year}
                    onChange={(e) =>
                      setFilterForm({ ...filterForm, year: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                  />
                </div>
              )}

              {/* BULAN */}
              {filterForm.period === 'monthly' && (
                <div>
                  <label className="block mb-2 text-xs text-red-200/60">Bulan</label>
                  <select
                    value={filterForm.month}
                    onChange={(e) =>
                      setFilterForm({ ...filterForm, month: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* TANGGAL */}
              {filterForm.period === 'date' && (
                <div>
                  <label className="block mb-2 text-xs text-red-200/60">Tanggal</label>
                  <input
                    type="date"
                    value={filterForm.date}
                    onChange={(e) =>
                      setFilterForm({ ...filterForm, date: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                  />
                </div>
              )}

              {/* DIVISI */}
              <div>
                <label className="block mb-2 text-xs text-red-200/60">Per Divisi</label>
                <input
                  type="text"
                  value={filterForm.division}
                  onChange={(e) =>
                    setFilterForm({ ...filterForm, division: e.target.value })
                  }
                  placeholder="Semua divisi"
                  className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block mb-2 text-xs text-red-200/60">Status</label>
                <select
                  value={filterForm.status}
                  onChange={(e) =>
                    setFilterForm({ ...filterForm, status: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-[#101827] border border-red-950 outline-none"
                >
                  <option value="">Semua</option>
                  <option value="HADIR">Hadir</option>
                  <option value="ABSEN">Absen</option>
                  <option value="IZIN">Izin</option>
                  <option value="CUTI">Cuti</option>
                  <option value="SAKIT">Sakit</option>
                </select>
              </div>

            </div>

            <button
              onClick={fetchHistory}
              className="mt-4 flex items-center gap-2 bg-red-700 hover:bg-red-800 transition-all px-5 py-3 rounded-2xl font-semibold"
            >
              <Filter size={18} />
              Terapkan Filter
            </button>

          </div>

          {renderTable(history, historyLoading)}

        </div>

      )}


      {/* ============ MODAL KELOLA STATUS ============ */}
      {modalRow && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">

          <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-8 w-full max-w-md relative">

            <button
              onClick={closeManageModal}
              className="absolute top-5 right-5 text-red-300/60 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-black mb-1">Kelola Status</h2>

            <p className="text-red-100/50 text-sm mb-6">
              {modalRow.user?.fullName} — status saat ini: ABSEN
            </p>

            <div className="space-y-4">

              <div>
                <label className="block mb-2 text-sm text-red-200/70">
                  Ubah Status Menjadi
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#101827] border border-red-950 outline-none"
                >
                  <option value="IZIN">Izin</option>
                  <option value="CUTI">Cuti</option>
                  <option value="SAKIT">Sakit</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-red-200/70">
                  Catatan (opsional)
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan..."
                  className="w-full p-3 rounded-2xl bg-[#101827] border border-red-950 outline-none resize-none"
                />
              </div>

            </div>

            <div className="flex gap-3 mt-8">

              <button
                onClick={closeManageModal}
                className="flex-1 py-3 rounded-2xl bg-[#101827] border border-red-950 hover:bg-red-950/30 transition-all"
              >
                Batal
              </button>

              <button
                onClick={handleManageSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-red-700 hover:bg-red-800 transition-all font-bold disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default AdminAttendancePage; 