import {
  useEffect,
  useMemo,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  Users,
  Search,
  Eye,
  X
} from 'lucide-react';

import {
  getPresenceBoard
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


// HALAMAN LIHAT PENGGUNA (ADMIN) — READ ONLY
// Sesuai aturan: Admin hanya boleh melihat user & detail,
// tidak boleh mengubah/menghapus.
const AdminUserPage = () => {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [detail, setDetail] = useState(null);


  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await getPresenceBoard();

      setUsers(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat data pengguna');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchUsers();

  }, []);


  // FILTER
  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const keyword = search.toLowerCase();

      return (
        user.fullName?.toLowerCase().includes(keyword) ||
        user.identityNumber?.toLowerCase().includes(keyword) ||
        user.division?.toLowerCase().includes(keyword)
      );

    });

  }, [users, search]);


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
            <Users className="text-red-500" size={32} />
            Lihat Pengguna
          </h1>

          <p className="text-red-100/50 mt-1 text-sm">
            Daftar pengguna sistem (hanya lihat)
          </p>

        </div>

        <div className="bg-[#101827] border border-red-950 rounded-2xl px-5 py-3 text-center">
          <p className="text-2xl font-black">{users.length}</p>
          <p className="text-red-100/50 text-xs">Total Pengguna</p>
        </div>

      </div>


      {/* SEARCH */}
      <div className="relative mb-6">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300/50"
          size={18}
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengguna..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#101827] border border-red-950 focus:border-red-600 outline-none"
        />

      </div>


      {/* TABLE */}
      <div className="bg-[#0b1322] border border-red-950 rounded-3xl overflow-hidden">

        <table className="w-full text-left text-sm">

          <thead className="bg-[#101827] text-red-100/60">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Nomor Karyawan</th>
              <th className="px-6 py-4">Divisi</th>
              <th className="px-6 py-4">Status Terakhir</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-red-100/40">
                  Memuat data...
                </td>
              </tr>

            ) : filteredUsers.length === 0 ? (

              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-red-100/40">
                  Tidak ada pengguna
                </td>
              </tr>

            ) : (

              filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-t border-red-950/50 hover:bg-[#101827]/50"
                >

                  <td className="px-6 py-4 font-semibold">
                    {user.fullName}
                  </td>

                  <td className="px-6 py-4 text-red-100/70">
                    {user.identityNumber}
                  </td>

                  <td className="px-6 py-4 text-red-100/70">
                    {user.division}
                  </td>

                  <td className="px-6 py-4">
                    {user.latestAttendance?.status ? (
                      <StatusBadge status={user.latestAttendance.status} />
                    ) : (
                      <span className="text-red-100/30">Belum presensi</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDetail(user)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#101827] hover:bg-red-900/40 transition-all text-sm"
                    >
                      <Eye size={15} />
                      Lihat Detail
                    </button>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* MODAL DETAIL */}
      {detail && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">

          <div className="bg-[#0b1322] border border-red-950 rounded-3xl p-8 w-full max-w-md relative">

            <button
              onClick={() => setDetail(null)}
              className="absolute top-5 right-5 text-red-300/60 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-black mb-6">Detail Pengguna</h2>

            <div className="space-y-4">

              <div className="bg-[#101827] border border-red-950 rounded-2xl p-4">
                <p className="text-red-100/50 text-xs mb-1">Nama Lengkap</p>
                <p className="font-bold">{detail.fullName}</p>
              </div>

              <div className="bg-[#101827] border border-red-950 rounded-2xl p-4">
                <p className="text-red-100/50 text-xs mb-1">Nomor Karyawan</p>
                <p className="font-bold">{detail.identityNumber}</p>
              </div>

              <div className="bg-[#101827] border border-red-950 rounded-2xl p-4">
                <p className="text-red-100/50 text-xs mb-1">Divisi</p>
                <p className="font-bold">{detail.division}</p>
              </div>

              <div className="bg-[#101827] border border-red-950 rounded-2xl p-4">
                <p className="text-red-100/50 text-xs mb-1">Presensi Terakhir</p>
                {detail.latestAttendance ? (
                  <div className="flex items-center justify-between">
                    <StatusBadge status={detail.latestAttendance.status} />
                    <span className="text-red-100/60 text-sm">
                      {formatTime(detail.latestAttendance.createdAt)}
                    </span>
                  </div>
                ) : (
                  <p className="text-red-100/40">Belum ada presensi</p>
                )}
              </div>

            </div>

            <button
              onClick={() => setDetail(null)}
              className="w-full mt-8 py-3 rounded-2xl bg-red-700 hover:bg-red-800 transition-all font-bold"
            >
              Tutup
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default AdminUserPage; 