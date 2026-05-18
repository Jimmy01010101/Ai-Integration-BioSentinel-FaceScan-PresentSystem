import {
  useState
} from 'react';

import {
  Link
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
  ArrowLeft,
  CalendarSearch,
  IdCard,
  Search,
  ClipboardList
} from 'lucide-react';

import api from '../../services/api';


// BADGE STATUS
const StatusBadge = ({ status }) => {

  const map = {
    HADIR: 'bg-green-900/40 text-bs-ok',
    ABSEN: 'bg-red-900/40 text-bs-red-bright',
    IZIN: 'bg-blue-900/40 text-blue-300',
    CUTI: 'bg-purple-900/40 text-purple-300',
    SAKIT: 'bg-yellow-900/40 text-yellow-300'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-bs-abyss text-bs-muted'}`}>
      {status}
    </span>
  );

};


function UserHistoryPage() {

  const [identityNumber, setIdentityNumber] = useState('');

  const [filter, setFilter] = useState('weekly');

  const [year, setYear] = useState(new Date().getFullYear());

  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [date, setDate] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);


  const formatTime = (value) => {

    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID');

  };


  // CARI RIWAYAT
  const handleSearch = async () => {

    if (!identityNumber.trim()) {

      toast.error('Tolong Memasukkan Identitas yang Valid');

      return;

    }

    try {

      setLoading(true);

      const params = {
        identityNumber: identityNumber.trim(),
        filter
      };

      if (filter === 'yearly') {
        params.year = year;
      }

      if (filter === 'monthly') {
        params.year = year;
        params.month = month;
      }

      if (filter === 'date') {

        if (!date) {
          toast.error('Pilih tanggal terlebih dahulu');
          setLoading(false);
          return;
        }

        params.date = date;

      }

      const response =
        await api.get('/attendance/user-history', {
          params
        });

      setResult(response.data);

    } catch (error) {

      console.error(error);

      setResult(null);

      toast.error(
        error.response?.data?.message ||
        'Gagal memuat riwayat presensi'
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-[#180909] to-[#2b0d0d] text-white px-4 sm:px-6 py-6 sm:py-10">

      {/* GLOW */}
      <div className="fixed w-[500px] h-[500px] bg-bs-red/10 blur-[150px] rounded-full top-[-150px] right-[-150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* BACK */}
        <Link
          to="/attendance"
          className="inline-flex items-center gap-2 text-bs-muted hover:text-white transition-all mb-8"
        >
          <ArrowLeft size={18} />
          Kembali ke Presensi
        </Link>


        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-2xl sm:text-4xl font-black text-bs-red mb-2 flex items-center gap-3">
            <ClipboardList size={36} />
            Riwayat Presensi
          </h1>

          <p className="text-bs-muted">
            Masukkan Nomor Karyawan untuk melihat riwayat presensi Anda
          </p>

        </div>


        {/* FORM PENCARIAN */}
        <div className="bg-bs-panel backdrop-blur-xl border border-bs-line rounded-3xl p-8 mb-8">

          {/* NOMOR KARYAWAN */}
          <div className="mb-5">

            <label className="block mb-2 text-sm text-bs-muted">
              Nomor Karyawan
            </label>

            <div className="relative">

              <IdCard
                className="absolute left-4 top-1/2 -translate-y-1/2 text-bs-muted/50"
                size={18}
              />

              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="Masukkan Nomor Karyawan"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-bs-abyss border border-bs-line focus:border-bs-red-dim outline-none transition-all"
              />

            </div>

          </div>


          {/* FILTER */}
          <div className="grid grid-cols-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

            {/* JENIS FILTER */}
            <div>

              <label className="block mb-2 text-xs text-bs-muted">
                Filter
              </label>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 rounded-xl bg-bs-abyss border border-bs-line focus:border-bs-red-dim outline-none"
              >
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
                <option value="date">Per Tanggal</option>
              </select>

            </div>

            {/* TAHUN */}
            {(filter === 'yearly' || filter === 'monthly') && (

              <div>

                <label className="block mb-2 text-xs text-bs-muted">
                  Tahun
                </label>

                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bs-abyss border border-bs-line focus:border-bs-red-dim outline-none"
                />

              </div>

            )}

            {/* BULAN */}
            {filter === 'monthly' && (

              <div>

                <label className="block mb-2 text-xs text-bs-muted">
                  Bulan
                </label>

                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bs-abyss border border-bs-line focus:border-bs-red-dim outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

              </div>

            )}

            {/* TANGGAL */}
            {filter === 'date' && (

              <div>

                <label className="block mb-2 text-xs text-bs-muted">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bs-abyss border border-bs-line focus:border-bs-red-dim outline-none"
                />

              </div>

            )}

          </div>


          {/* TOMBOL CARI */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-bs-red hover:brightness-110 transition-all px-8 py-4 rounded-2xl font-bold disabled:opacity-50"
          >
            <Search size={18} />
            {loading ? 'Memuat...' : 'Lihat Riwayat'}
          </button>

        </div>


        {/* HASIL */}
        {result && (

          <div className="bg-bs-panel backdrop-blur-xl border border-bs-line rounded-3xl p-8">

            {/* INFO USER */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

              <div>
                <h2 className="text-2xl font-black">
                  {result.user?.fullName}
                </h2>
                <p className="text-bs-muted text-sm">
                  {result.user?.identityNumber} · {result.user?.division}
                </p>
              </div>

              <div className="flex items-center gap-2 text-bs-muted/70">
                <CalendarSearch size={18} />
                <span className="capitalize">{result.filter}</span>
              </div>

            </div>


            {/* RINGKASAN */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">

              {[
                { label: 'Total', value: result.summary?.total, color: 'text-white' },
                { label: 'Hadir', value: result.summary?.hadir, color: 'text-bs-ok' },
                { label: 'Absen', value: result.summary?.absen, color: 'text-bs-red-bright' },
                { label: 'Izin', value: result.summary?.izin, color: 'text-blue-300' },
                { label: 'Cuti', value: result.summary?.cuti, color: 'text-purple-300' },
                { label: 'Sakit', value: result.summary?.sakit, color: 'text-yellow-300' }
              ].map((s) => (

                <div
                  key={s.label}
                  className="bg-bs-abyss border border-bs-line rounded-2xl p-4 text-center"
                >
                  <p className="text-bs-muted text-xs mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>
                    {s.value ?? 0}
                  </p>
                </div>

              ))}

            </div>


            {/* TABEL RIWAYAT */}
            <div className="border border-bs-line rounded-2xl overflow-hidden">

              <div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[560px]">

                <thead className="bg-bs-abyss text-bs-muted">
                  <tr>
                    <th className="px-5 py-3">Sesi</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Waktu</th>
                  </tr>
                </thead>

                <tbody>

                  {result.data?.length === 0 ? (

                    <tr>
                      <td colSpan={3} className="px-5 py-6 sm:py-10 text-center text-bs-faint">
                        Tidak ada riwayat presensi pada periode ini
                      </td>
                    </tr>

                  ) : (

                    result.data.map((item) => (

                      <tr
                        key={item.id}
                        className="border-t border-bs-line/50"
                      >

                        <td className="px-5 py-3 font-semibold">
                          {item.attendanceSession?.title || '-'}
                        </td>

                        <td className="px-5 py-3">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-3 text-bs-muted">
                          {formatTime(item.createdAt)}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table></div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default UserHistoryPage;