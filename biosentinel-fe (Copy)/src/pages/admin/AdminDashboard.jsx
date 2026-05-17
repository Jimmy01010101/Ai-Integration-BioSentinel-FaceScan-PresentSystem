import {
  Activity,
  AlertTriangle,
  Clock3,
  Eye,
  ScanFace,
  ShieldAlert,
  Users,
  UserCheck
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import api from '../../services/api';


function AdminDashboard() {

  // STATES
  const [loading, setLoading] =
    useState(true);

  const [presenceBoard, setPresenceBoard] =
    useState([]);

  const [stats, setStats] =
    useState(null);

  const [sessions, setSessions] =
    useState([]);

  const [spoofLogs, setSpoofLogs] =
    useState([]);


  // LOAD DASHBOARD
  const loadDashboard =
    async () => {

      try {

        setLoading(true);


        // STATS
        try {

          const statsRes =
            await api.get(

              '/admin/dashboard/stats'

            );

          setStats(
            statsRes.data.data
          );

        } catch (error) {

          console.error(
            'Stats Error',
            error
          );

        }


        // PRESENCE BOARD
        try {

          const boardRes =
            await api.get(

              '/admin/attendance/presence-board'

            );

          setPresenceBoard(
            boardRes.data.data || []
          );

        } catch (error) {

          console.error(
            'Presence Board Error',
            error
          );

        }


        // ACTIVE SESSION
        try {

          const sessionRes =
            await api.get(

              '/admin/session/active'

            );

          setSessions(
            sessionRes.data.data || []
          );

        } catch (error) {

          if (
            error.response?.status !== 404
          ) {

            console.error(
              'Session Error',
              error
            );

          }

        }


        // SPOOF LOGS
        try {

          const spoofRes =
            await api.get(

              '/admin/security/spoof-logs'

            );

          setSpoofLogs(
            spoofRes.data.data || []
          );

        } catch (error) {

          console.error(
            'Spoof Logs Error',
            error
          );

        }

      } catch (error) {

        console.error(error);

        toast.error(
          'Failed load admin dashboard'
        );

      } finally {

        setLoading(false);

      }

    };


  // INIT
  useEffect(() => {

    loadDashboard();

    const interval =
      setInterval(() => {

        loadDashboard();

      }, 10000);

    return () =>
      clearInterval(interval);

  }, []);


  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-white">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-6" />

          <p className="text-red-200">
            Loading Admin Dashboard...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="min-h-screen text-white">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-black text-red-500 mb-3">
          Admin Dashboard
        </h1>

        <p className="text-red-100/60 text-lg">
          Attendance Monitoring & Operational Center
        </p>

      </div>


      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* TODAY */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Present Today
              </p>

              <h2 className="text-4xl font-black">

                {

                  stats?.presentToday ||

                  0

                }

              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <UserCheck
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>


        {/* ABSENT */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Absent Today
              </p>

              <h2 className="text-4xl font-black">

                {

                  stats?.absentToday ||

                  0

                }

              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <Users
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>


        {/* ACTIVE SESSION */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Active Session
              </p>

              <h2 className="text-xl font-black">

                {

                  sessions?.title ||

                  'No Session'

                }

              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <Clock3
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>


        {/* SPOOF */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Spoof Alerts
              </p>

              <h2 className="text-4xl font-black">

                {

                  spoofLogs.length ||

                  0

                }

              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <ShieldAlert
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>

      </div>


      {/* MAIN GRID */}
      <div className="grid xl:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-8">

          {/* PRESENCE BOARD */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-2xl font-bold mb-2">
                  Presence Board
                </h2>

                <p className="text-red-100/50">
                  Realtime attendance monitoring
                </p>

              </div>

              <div className="flex items-center gap-2 text-green-400">

                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

                Live

              </div>

            </div>


            <div className="space-y-4">

              {

                presenceBoard.length > 0

                  ? presenceBoard.map(

                      (item, index) => (

                        <div

                          key={index}

                          className="bg-[#160909] border border-red-950 rounded-2xl p-5 flex items-center justify-between"

                        >

                          <div>

                            <h3 className="font-bold text-lg">
                              {

                                item.name ||

                                'Unknown User'

                              }
                            </h3>

                            <p className="text-red-100/50 text-sm">

                              {

                                item.status ||

                                'No Status'

                              }

                            </p>

                          </div>


                          <div className="flex items-center gap-3">

                            <Eye
                              className="text-red-500"
                              size={24}
                            />

                          </div>

                        </div>

                      )

                    )

                  : (

                    <div className="bg-[#160909] border border-red-950 rounded-2xl p-6 text-center text-red-100/50">

                      No presence activity

                    </div>

                  )

              }

            </div>

          </div>


          {/* SESSION MONITOR */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-3 mb-8">

              <Activity
                className="text-red-500"
                size={28}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  Session Monitoring
                </h2>

                <p className="text-red-100/50">
                  Attendance session control
                </p>

              </div>

            </div>


            <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-red-100/60 mb-2">
                    Current Session
                  </p>

                  <h2 className="text-2xl font-black">

                    {

                      sessions?.title ||

                      'No Active Session'

                    }

                  </h2>

                </div>

                <ScanFace
                  className="text-red-500"
                  size={36}
                />

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT */}
        <div className="space-y-8">

          {/* SPOOF ALERT */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-3 mb-8">

              <AlertTriangle
                className="text-red-500"
                size={28}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  Spoof Detection
                </h2>

                <p className="text-red-100/50">
                  AI security monitoring
                </p>

              </div>

            </div>


            <div className="space-y-4">

              {

                spoofLogs.length > 0

                  ? spoofLogs.map(

                      (item, index) => (

                        <div

                          key={index}

                          className="bg-[#160909] border border-red-950 rounded-2xl p-5"

                        >

                          <p className="font-semibold mb-2">

                            {

                              item.userName ||

                              'Unknown User'

                            }

                          </p>

                          <p className="text-sm text-red-100/50">

                            {

                              item.message ||

                              'Spoof attempt detected'

                            }

                          </p>

                        </div>

                      )

                    )

                  : (

                    <div className="bg-[#160909] border border-red-950 rounded-2xl p-5 text-red-100/50">

                      No spoof alerts

                    </div>

                  )

              }

            </div>

          </div>


          {/* REALTIME STATUS */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <h2 className="text-2xl font-bold mb-8">
              System Status
            </h2>


            <div className="space-y-5">

              <div className="flex items-center justify-between">

                <span className="text-red-100/60">
                  AI Detection
                </span>

                <span className="text-green-400">
                  Stable
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-red-100/60">
                  Realtime Monitoring
                </span>

                <span className="text-green-400">
                  Active
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-red-100/60">
                  Attendance Engine
                </span>

                <span className="text-green-400">
                  Online
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminDashboard; 