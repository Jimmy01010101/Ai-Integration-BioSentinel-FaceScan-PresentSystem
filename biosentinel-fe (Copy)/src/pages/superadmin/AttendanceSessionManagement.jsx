import { useEffect, useState } from "react";

import {
  Clock,
  Plus,
  ShieldCheck,
  Activity,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  createAttendanceSession,
  getActiveSessionData,
} from "../../services/superAdminService";

const AttendanceSessionManagement = () => {

  const [activeSession, setActiveSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [formData, setFormData] =
    useState({
      title: "",
      startTime: "",
      endTime: "",
    });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {

    try {

      setLoading(true);

      const response =
        await getActiveSessionData();

      if (response.success) {

        setActiveSession(
          response.data
        );
      }

    } catch (error) {

      // VALID:
      // no active session
      if (
        error.response?.status === 404
      ) {

        setActiveSession(null);

        return;
      }

      console.error(
        "FETCH SESSION ERROR:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleCreateSession =
    async () => {

      try {

        await createAttendanceSession({
          title: formData.title,
          startTime:
            formData.startTime,
          endTime:
            formData.endTime,
        });

        toast.success(
          "Attendance session created"
        );

        setShowModal(false);

        setFormData({
          title: "",
          startTime: "",
          endTime: "",
        });

        await fetchSessions();

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed create session"
        );
      }
    };

  return (

    <div className="min-h-screen bg-[#020617] text-white p-10">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-red-500">

            Attendance Session

          </h1>

          <p className="text-gray-400 mt-2">

            Enterprise attendance governance

          </p>

        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-red-600 hover:bg-red-700 transition-all rounded-2xl px-8 py-4 font-bold flex items-center gap-3"
        >
          <Plus size={20} />

          Create Session

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">

                Total Session

              </p>

              <h2 className="text-4xl font-black mt-2">

                {activeSession ? 1 : 0}

              </h2>

            </div>

            <Clock
              className="text-red-500"
              size={40}
            />

          </div>

        </div>

        <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">

                Active Session

              </p>

              <h2 className="text-4xl font-black mt-2">

                {activeSession ? 1 : 0}

              </h2>

            </div>

            <Activity
              className="text-green-400"
              size={40}
            />

          </div>

        </div>

        <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">

                Protected

              </p>

              <h2 className="text-4xl font-black mt-2">

                AI

              </h2>

            </div>

            <ShieldCheck
              className="text-cyan-400"
              size={40}
            />

          </div>

        </div>

        <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">

                Monitoring

              </p>

              <h2 className="text-4xl font-black mt-2">

                LIVE

              </h2>

            </div>

            <Activity
              className="text-yellow-400"
              size={40}
            />

          </div>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-[#071226] border border-red-900 rounded-3xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#220808]">

            <tr>

              <th className="p-6 text-left">

                Session

              </th>

              <th className="p-6 text-left">

                Start

              </th>

              <th className="p-6 text-left">

                End

              </th>

              <th className="p-6 text-left">

                Late Tolerance

              </th>

              <th className="p-6 text-left">

                Status

              </th>

              <th className="p-6 text-left">

                Action

              </th>

            </tr>

          </thead>

          <tbody>

            {activeSession ? (

              <tr className="border-t border-red-900">

                <td className="p-6">

                  {activeSession.title}

                </td>

                <td className="p-6">

                  {new Date(
                    activeSession.startTime
                  ).toLocaleString()}

                </td>

                <td className="p-6">

                  {new Date(
                    activeSession.endTime
                  ).toLocaleString()}

                </td>

                <td className="p-6">

                  10 Minutes

                </td>

                <td className="p-6">

                  <span className="text-green-400 font-bold">

                    ACTIVE

                  </span>

                </td>

                <td className="p-6">

                  <button className="bg-red-600 px-4 py-2 rounded-xl">

                    End Session

                  </button>

                </td>

              </tr>

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-10 text-gray-400"
                >

                  No Active Attendance Session

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#071226] border border-red-900 rounded-3xl p-10 w-[600px]">

            <h2 className="text-3xl font-black text-red-500 mb-8">

              Create Attendance Session

            </h2>

            <div className="space-y-5">

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Session Title"
                className="w-full bg-[#140404] border border-red-900 rounded-2xl px-6 py-4"
              />

              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-[#140404] border border-red-900 rounded-2xl px-6 py-4"
              />

              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-[#140404] border border-red-900 rounded-2xl px-6 py-4"
              />

              <div className="flex gap-4 pt-4">

                <button
                  onClick={handleCreateSession}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-2xl py-4 font-bold"
                >

                  Create Session

                </button>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 bg-gray-700 hover:bg-gray-800 rounded-2xl py-4 font-bold"
                >

                  Cancel

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AttendanceSessionManagement; 