import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  Eye,
  EyeOff
} from 'lucide-react';

import {
  getAllUsers,
  toggleUserStatus,
  deleteUser
} from '../../services/superAdminService';

const UserManagementPage = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await getAllUsers();

      const payload =
        response?.data ||
        response?.users ||
        response ||
        [];

      setUsers(payload);

    } catch (error) {

      console.error(error);

      alert('Failed load users');

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchUsers();

  }, []);

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

  const handleToggleStatus = async (id) => {

    try {

      await toggleUserStatus(id);

      fetchUsers();

    } catch (error) {

      console.error(error);

      alert('Failed toggle status');
    }
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      'Delete this user?'
    );

    if (!confirmDelete) return;

    try {

      await deleteUser(id);

      fetchUsers();

    } catch (error) {

      console.error(error);

      alert('Failed delete user');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-5xl font-black text-red-500">
            User Management
          </h1>

          <p className="text-gray-400 mt-2">
            Enterprise biometric employee governance
          </p>
        </div>

        <div className="flex items-center gap-4">

          <div className="bg-[#071129] border border-red-900 rounded-2xl px-8 py-4 flex items-center gap-4">
            <Users className="text-red-500" />

            <div>
              <h2 className="text-3xl font-bold">
                {users.length}
              </h2>

              <p className="text-gray-400 text-sm">
                Registered Users
              </p>
            </div>
          </div>

          <button className="bg-red-600 hover:bg-red-700 transition-all px-6 py-4 rounded-2xl font-semibold flex items-center gap-3">
            <Plus size={20} />
            Add User
          </button>

        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-[#071129] border border-red-900 rounded-3xl p-6 mb-8">

        <div className="flex items-center bg-[#140303] border border-red-900 rounded-2xl px-5">

          <Search className="text-red-500" />

          <input
            type="text"
            placeholder="Search employee..."
            className="w-full bg-transparent outline-none px-4 py-5 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>
      </div>

      {/* TABLE */}

      <div className="bg-[#071129] border border-red-900 rounded-3xl overflow-hidden">

        <div className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-red-900 bg-[#140303] font-semibold text-white">

          <div>Employee</div>
          <div>Identity</div>
          <div>Division</div>
          <div>Biometric</div>
          <div>Status</div>
          <div>Actions</div>

        </div>

        {loading ? (

          <div className="p-10 text-center text-gray-400">
            Loading users...
          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="p-10 text-center text-gray-400">
            No users found
          </div>

        ) : (

          filteredUsers.map((user) => (

            <div
              key={user.id}
              className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-red-950 items-center"
            >

              {/* USER */}

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-red-800">

                  <img
                    src={`http://localhost:5050/${user.faceImage}`}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />

                </div>

                <div>
                  <h2 className="font-bold">
                    {user.fullName}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    Employee
                  </p>
                </div>
              </div>

              {/* IDENTITY */}

              <div className="font-mono text-gray-300">
                {user.identityNumber}
              </div>

              {/* DIVISION */}

              <div>
                {user.division}
              </div>

              {/* BIOMETRIC */}

              <div className="flex items-center gap-2 text-emerald-400">

                <ShieldCheck size={18} />

                Registered

              </div>

              {/* STATUS */}

              <div>

                {user.isActive ? (

                  <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-700 text-emerald-400 px-4 py-2 rounded-xl text-sm">
                    Active
                  </div>

                ) : (

                  <div className="inline-flex items-center gap-2 bg-red-950 border border-red-700 text-red-400 px-4 py-2 rounded-xl text-sm">
                    Disabled
                  </div>

                )}

              </div>

              {/* ACTIONS */}

              <div className="flex items-center gap-3">

                <button
                  onClick={() => handleToggleStatus(user.id)}
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >

                  {user.isActive ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

                <button
                  onClick={() => fetchUsers()}
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >
                  <RefreshCcw size={18} />
                </button>

                <button
                  onClick={() => handleDelete(user.id)}
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>
          ))

        )}

      </div>

      {/* FOOTER */}

      <div className="mt-10 w-44 h-24 bg-[#071129] border border-red-900 rounded-3xl p-5">

        <div className="flex items-center gap-3 text-red-500 mb-3">

          <ShieldCheck />

          <span className="font-bold">
            AI Security
          </span>

        </div>

        <div className="text-emerald-400 text-sm">
          System Online
        </div>

      </div>

    </div>
  );
};

export default UserManagementPage; 