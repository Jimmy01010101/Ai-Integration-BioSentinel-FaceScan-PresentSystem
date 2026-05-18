import {
  useEffect,
  useMemo,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  Search,
  Plus,
  UserCog,
  Trash2,
  Pencil,
  ShieldCheck,
  ShieldOff,
  X
} from 'lucide-react';

import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin
} from '../../services/superAdminService';


const AdminManagementPage = () => {

  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [editId, setEditId] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: ''
  });


  // FETCH ADMINS
  const fetchAdmins = async () => {

    try {

      setLoading(true);

      const response = await getAllAdmins();

      setAdmins(response?.data || []);

    } catch (error) {

      console.error(error);

      toast.error('Gagal memuat data admin');

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchAdmins();

  }, []);


  // FILTER
  const filteredAdmins = useMemo(() => {

    return admins.filter((admin) => {

      const keyword = search.toLowerCase();

      return (
        admin.fullName
          ?.toLowerCase()
          .includes(keyword) ||
        admin.username
          ?.toLowerCase()
          .includes(keyword)
      );

    });

  }, [admins, search]);


  // OPEN CREATE MODAL
  const openCreateModal = () => {

    setEditId(null);

    setForm({
      username: '',
      password: '',
      fullName: ''
    });

    setShowModal(true);

  };


  // OPEN EDIT MODAL
  const openEditModal = (admin) => {

    setEditId(admin.id);

    setForm({
      username: admin.username,
      password: '',
      fullName: admin.fullName
    });

    setShowModal(true);

  };


  // CLOSE MODAL
  const closeModal = () => {

    setShowModal(false);

    setEditId(null);

    setForm({
      username: '',
      password: '',
      fullName: ''
    });

  };


  // SUBMIT (CREATE / UPDATE)
  const handleSubmit = async () => {

    try {

      if (!form.username || !form.fullName) {

        toast.error('Username dan nama lengkap wajib diisi');

        return;

      }

      if (!editId && !form.password) {

        toast.error('Password wajib diisi');

        return;

      }

      setSubmitting(true);

      if (editId) {

        // UPDATE — password opsional
        const payload = {
          username: form.username,
          fullName: form.fullName
        };

        if (form.password) {
          payload.password = form.password;
        }

        await updateAdmin(editId, payload);

        toast.success('Admin berhasil diperbarui');

      } else {

        // CREATE
        await createAdmin({
          username: form.username,
          password: form.password,
          fullName: form.fullName
        });

        toast.success('Admin berhasil dibuat');

      }

      closeModal();

      fetchAdmins();

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Gagal menyimpan admin'
      );

    } finally {

      setSubmitting(false);

    }

  };


  // TOGGLE STATUS (NON-AKTIF / AKTIF)
  const handleToggleStatus = async (id) => {

    try {

      await toggleAdminStatus(id);

      toast.success('Status admin diperbarui');

      fetchAdmins();

    } catch (error) {

      console.error(error);

      toast.error('Gagal mengubah status');

    }

  };


  // DELETE
  const handleDelete = async (id) => {

    if (!window.confirm('Hapus admin ini?')) {
      return;
    }

    try {

      await deleteAdmin(id);

      toast.success('Admin dihapus');

      fetchAdmins();

    } catch (error) {

      console.error(error);

      toast.error('Gagal menghapus admin');

    }

  };


  return (

    <div className="text-white">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-black flex items-center gap-3">

            <UserCog className="text-bs-red" size={32} />

            Admin Management

          </h1>

          <p className="text-bs-muted mt-1 text-sm">

            CRUD akun Admin — kelola, non-aktifkan, atau hapus

          </p>

        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-bs-red hover:brightness-110 transition-all px-5 py-3 rounded-2xl font-semibold"
        >

          <Plus size={20} />

          Tambah Admin

        </button>

      </div>


      {/* SEARCH */}
      <div className="relative mb-6">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-bs-muted/50"
          size={18}
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari admin..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-bs-panel-2 border border-bs-line focus:border-bs-red-dim outline-none"
        />

      </div>


      {/* TABLE */}
      <div className="bg-bs-panel border border-bs-line rounded-3xl overflow-hidden">

        <div className="overflow-x-auto"><table className="w-full text-left min-w-[600px]">

          <thead className="bg-bs-panel-2 text-bs-muted text-sm">

            <tr>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan={4} className="px-6 py-6 sm:py-10 text-center text-bs-faint">
                  Memuat data...
                </td>
              </tr>

            ) : filteredAdmins.length === 0 ? (

              <tr>
                <td colSpan={4} className="px-6 py-6 sm:py-10 text-center text-bs-faint">
                  Belum ada admin
                </td>
              </tr>

            ) : (

              filteredAdmins.map((admin) => (

                <tr
                  key={admin.id}
                  className="border-t border-bs-line/50 hover:bg-bs-panel-2/50"
                >

                  <td className="px-6 py-4 font-semibold">
                    {admin.fullName}
                  </td>

                  <td className="px-6 py-4 text-bs-muted">
                    {admin.username}
                  </td>

                  <td className="px-6 py-4">

                    {admin.isActive ? (
                      <span className="px-3 py-1 rounded-full bg-green-900/40 text-green-400 text-xs font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-red-900/40 text-bs-red-bright text-xs font-semibold">
                        Non-Aktif
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() => openEditModal(admin)}
                        title="Edit"
                        className="p-2 rounded-xl bg-bs-panel-2 hover:bg-bs-red-deep transition-all"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        title={admin.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                        className="p-2 rounded-xl bg-bs-panel-2 hover:bg-bs-red-deep transition-all"
                      >
                        {admin.isActive
                          ? <ShieldOff size={16} />
                          : <ShieldCheck size={16} />}
                      </button>

                      <button
                        onClick={() => handleDelete(admin.id)}
                        title="Hapus"
                        className="p-2 rounded-xl bg-bs-panel-2 hover:bg-bs-red-deep transition-all text-bs-red-bright"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table></div>

      </div>


      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6">

          <div className="bg-bs-panel border border-bs-line rounded-3xl p-8 w-full max-w-md relative">

            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-bs-muted/60 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-black mb-6">
              {editId ? 'Edit Admin' : 'Tambah Admin'}
            </h2>

            <div className="space-y-4">

              <div>

                <label className="block mb-2 text-sm text-bs-muted">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="w-full p-3 rounded-2xl bg-bs-panel-2 border border-bs-line focus:border-bs-red-dim outline-none"
                />

              </div>

              <div>

                <label className="block mb-2 text-sm text-bs-muted">
                  Username
                </label>

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="Masukkan username"
                  className="w-full p-3 rounded-2xl bg-bs-panel-2 border border-bs-line focus:border-bs-red-dim outline-none"
                />

              </div>

              <div>

                <label className="block mb-2 text-sm text-bs-muted">
                  Password
                  {editId && (
                    <span className="text-bs-faint">
                      {' '}(kosongkan jika tidak diubah)
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Masukkan password"
                  className="w-full p-3 rounded-2xl bg-bs-panel-2 border border-bs-line focus:border-bs-red-dim outline-none"
                />

              </div>

            </div>

            <div className="flex gap-3 mt-8">

              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-2xl bg-bs-panel-2 border border-bs-line hover:bg-bs-red-deep/30 transition-all"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-bs-red hover:brightness-110 transition-all font-bold disabled:opacity-50"
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

export default AdminManagementPage; 