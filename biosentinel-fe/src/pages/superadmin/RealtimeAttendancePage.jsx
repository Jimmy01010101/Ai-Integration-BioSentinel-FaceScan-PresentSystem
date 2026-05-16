import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ShieldAlert,
  Smile,
  ScanFace,
} from "lucide-react";

import {
  getRealtimeAttendance,
} from "../../services/superAdminService";

const RealtimeAttendancePage =
  () => {

    const [attendance,
      setAttendance] =
      useState([]);

    const [loading,
      setLoading] =
      useState(true);

    const fetchAttendance =
      async () => {

        try {

          const response =
            await getRealtimeAttendance();

          setAttendance(
            response.data || []
          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);
        }
      };

    useEffect(() => {

      fetchAttendance();

      const interval =
        setInterval(
          fetchAttendance,
          5000
        );

      return () =>
        clearInterval(interval);

    }, []);

    return (

      <div className="min-h-screen bg-[#020617] text-white p-8">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-black text-red-500">

            Realtime Attendance Feed

          </h1>

          <p className="text-gray-400 mt-2">

            Enterprise AI attendance governance

          </p>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

            <p className="text-gray-400">

              Total Attendance

            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-5xl font-black">

                {attendance.length}

              </h2>

              <Activity className="text-red-500" />

            </div>

          </div>

          <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

            <p className="text-gray-400">

              AI Verified

            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-5xl font-black">

                {
                  attendance.filter(
                    item =>
                      item.livenessVerified
                  ).length
                }

              </h2>

              <ScanFace className="text-cyan-400" />

            </div>

          </div>

          <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

            <p className="text-gray-400">

              Smile Verified

            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-5xl font-black">

                {
                  attendance.filter(
                    item =>
                      item.smileVerified
                  ).length
                }

              </h2>

              <Smile className="text-yellow-400" />

            </div>

          </div>

          <div className="bg-[#071226] border border-red-900 rounded-3xl p-6">

            <p className="text-gray-400">

              Spoof Alert

            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-5xl font-black">

                {
                  attendance.filter(
                    item =>
                      item.spoofDetected
                  ).length
                }

              </h2>

              <ShieldAlert className="text-red-500" />

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-[#071226] border border-red-900 rounded-3xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-[#220404]">

              <tr className="text-left">

                <th className="p-5">
                  User
                </th>

                <th>
                  Session
                </th>

                <th>
                  Confidence
                </th>

                <th>
                  Smile
                </th>

                <th>
                  Liveness
                </th>

                <th>
                  Spoof
                </th>

                <th>
                  Status
                </th>

                <th>
                  Time
                </th>

              </tr>

            </thead>

            <tbody>

              {attendance.map(
                item => (

                <tr
                  key={item.id}
                  className="border-t border-red-900"
                >

                  <td className="p-5 font-bold">

                    {
                      item.user
                        ?.fullName || "Unknown User"
                    }

                  </td>

                  <td>

                    {
                      item.attendanceSession
                        ?.title || "No Session" 
                    }

                  </td>

                  <td className="text-cyan-400 font-bold">

                    {
                      item.confidenceScore
                    }

                  </td>

                  <td>

                    {item.smileVerified
                      ? "✅"
                      : "❌"}

                  </td>

                  <td>

                    {item.livenessVerified
                      ? "✅"
                      : "❌"}

                  </td>

                  <td>

                    {item.spoofDetected
                      ? "🚨"
                      : "SAFE"}

                  </td>

                  <td>

                    <span className={`px-4 py-2 rounded-full text-sm ${
                      item.status === "HADIR"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>

                      {item.status}

                    </span>

                  </td>

                  <td>

                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!loading &&
            attendance.length === 0 && (

            <div className="p-10 text-center text-gray-500">

              No realtime attendance yet

            </div>

          )}

        </div>

      </div>
    );
};

export default RealtimeAttendancePage; 