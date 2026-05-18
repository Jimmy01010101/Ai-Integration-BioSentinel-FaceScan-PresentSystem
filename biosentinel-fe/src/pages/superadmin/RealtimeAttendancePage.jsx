import { io } from 'socket.io-client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Activity,
  ShieldAlert,
  Smile,
  ScanFace,
} from 'lucide-react';

import {
  getRealtimeAttendance,
} from '../../services/superAdminService';

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

      const socket =
        io(
          import.meta.env
            .VITE_SOCKET_URL
        );

      socket.on(
        'connect',

        () => {

          console.log(
            'Realtime socket connected'
          );

        }
      );

      socket.on(
        'new-attendance',

        (newAttendance) => {

          setAttendance(
            (prev) => {

              const exists =
                prev.find(
                  item =>
                    item.id ===
                    newAttendance.id
                );

              if (exists)
                return prev;

              return [
                newAttendance,
                ...prev
              ];

            }
          );

        }
      );

      socket.on(
        'disconnect',

        () => {

          console.log(
            'Realtime socket disconnected'
          );

        }
      );

      return () => {

        socket.off(
          'new-attendance'
        );

        socket.disconnect();

      };

    }, []);

    return (

      <div className="text-white">

        <div className="mb-10">

          <h1 className="text-2xl sm:text-3xl font-black text-bs-red">

            Realtime Attendance Feed

          </h1>

          <p className="text-gray-400 mt-2">

            Enterprise AI attendance governance

          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">

            <p className="text-gray-400">
              Total Attendance
            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-2xl sm:text-3xl font-black">
                {attendance.length}
              </h2>

              <Activity className="text-bs-red" />

            </div>

          </div>

          <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">

            <p className="text-gray-400">
              AI Verified
            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-2xl sm:text-3xl font-black">

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

          <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">

            <p className="text-gray-400">
              Smile Verified
            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-2xl sm:text-3xl font-black">

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

          <div className="bg-bs-panel border border-bs-line rounded-3xl p-6">

            <p className="text-gray-400">
              Spoof Alert
            </p>

            <div className="flex justify-between items-center mt-3">

              <h2 className="text-2xl sm:text-3xl font-black">

                {
                  attendance.filter(
                    item =>
                      item.spoofDetected
                  ).length
                }

              </h2>

              <ShieldAlert className="text-bs-red" />

            </div>

          </div>

        </div>

        <div className="bg-bs-panel border border-bs-line rounded-3xl overflow-hidden">

          <div className="overflow-x-auto"><table className="w-full min-w-[760px]">

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
                (item) => (

                <tr
                  key={item.id}
                  className="border-t border-bs-line"
                >

                  <td className="p-5 font-bold">

                    {
                      item.user?.fullName ||
                      'Unknown User'
                    }

                  </td>

                  <td>

                    {
                      item.attendanceSession?.title ||
                      'No Session'
                    }

                  </td>

                  <td className="text-cyan-400 font-bold">

                    {item.confidenceScore}

                  </td>

                  <td>

                    {item.smileVerified
                      ? '✅'
                      : '❌'}

                  </td>

                  <td>

                    {item.livenessVerified
                      ? '✅'
                      : '❌'}

                  </td>

                  <td>

                    {item.spoofDetected
                      ? '🚨'
                      : 'SAFE'}

                  </td>

                  <td>

                    <span className={`px-4 py-2 rounded-full text-sm ${
                      item.status === 'HADIR'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-bs-red-bright'
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

          </table></div>

          {!loading &&
            attendance.length === 0 && (

            <div className="p-5 sm:p-8 text-center text-gray-500">

              No realtime attendance yet

            </div>

          )}

        </div>

      </div>

    );

};

export default RealtimeAttendancePage; 