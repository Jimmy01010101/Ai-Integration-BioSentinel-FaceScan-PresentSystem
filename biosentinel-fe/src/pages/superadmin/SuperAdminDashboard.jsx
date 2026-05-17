import socket from '../../services/socket';

import {
  Users,
  Shield,
  UserCog,
  ScanFace,
  Activity,
  AlertTriangle,
  Clock3,
  Database,
  Eye
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  getDashboardStats,
  getTodayAttendance,
  getActiveSession,
  getRealtimeFeed
} from '../../services/superAdminService'; 


function SuperAdminDashboard() {

  // STATES
  const [stats, setStats] =
    useState(null);

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  const [activeSession, setActiveSession] =
    useState(null);

  const [realtimeFeed, setRealtimeFeed] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // LOAD DASHBOARD
const loadDashboard =
  async () => {

    try {

      setLoading(true);


      // STATS
      try {

        const statsData =
          await getDashboardStats();

        setStats(
          statsData.data
        );

      } catch (error) {

        console.error(
          'Stats Error:',
          error
        );

      }


      // TODAY
      try {

        const todayData =
          await getTodayAttendance();

        setTodayAttendance(
          todayData.data
        );

      } catch (error) {

        console.error(
          'Today Error:',
          error
        );

      }

      // SESSION
      try {

        const sessionData =
          await getActiveSession();

        setActiveSession(
          sessionData.data
        );

      } catch (error) {

        // NO ACTIVE SESSION
        if (
          error.response?.status === 404
        ) {

          setActiveSession(null);

        }

        // REAL ERROR
        else {

          console.error(
            'Session Error:',
            error
          );

        }

      }


      // REALTIME
      try {

        const realtimeData =
          await getRealtimeFeed();

        setRealtimeFeed(
          realtimeData.data || []
        );

      } catch (error) {

        console.error(
          'Realtime Error:',
          error
        );

      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // INIT
    useEffect(() => {

      loadDashboard();

      // SOCKET JOIN
      socket.emit(
        'dashboard:join'
      );

      // HANDLERS
      const attendanceHandler =
        () => {

          toast.success(
            'New attendance detected'
          );

          loadDashboard();

        };

      const sessionHandler =
        () => {

          toast(
            'Session updated'
          );

          loadDashboard();

        };

      const spoofHandler =
        () => {

          toast.error(
            'Spoof alert detected'
          );

          loadDashboard();

        };

      // SOCKET EVENTS
      socket.on(
        'attendance:new',
        attendanceHandler
      );

      socket.on(
        'session:update',
        sessionHandler
      );

      socket.on(
        'spoof:alert',
        spoofHandler
      );

      // FALLBACK POLLING
      const interval =
        setInterval(() => {

          loadDashboard();

        }, 15000);

      // CLEANUP
      return () => {

        clearInterval(interval);

        socket.off(
          'attendance:new',
          attendanceHandler
        );

        socket.off(
          'session:update',
          sessionHandler
        );

        socket.off(
          'spoof:alert',
          spoofHandler
        );

      };

    }, []);


  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-white">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-6" />

          <p className="text-red-200">
            Loading Enterprise Dashboard...
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
          Super Admin Dashboard
        </h1>

        <p className="text-red-100/60 text-lg">
          Enterprise Governance & Monitoring System
        </p>

      </div>


      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* USERS */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Total Users
              </p>

              <h2 className="text-4xl font-black">
                {stats?.users?.total || 0}
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


        {/* ADMINS */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Total Admin
              </p>

              <h2 className="text-4xl font-black">
                {stats?.admins?.total || 0}
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <UserCog
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>


        {/* TODAY */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Attendance Today
              </p>

              <h2 className="text-4xl font-black">
                {stats?.attendance?.today || 0}
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <ScanFace
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>


        {/* SECURITY */}
        <div className="bg-black/40 border border-red-950 rounded-3xl p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-red-100/60 text-sm mb-2">
                Security Alerts
              </p>

              <h2 className="text-4xl font-black">
                {realtimeFeed.filter(
                  (item) => item.spoofDetected
                ).length || 0}
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center">

              <Shield
                className="text-red-500"
                size={30}
              />

            </div>

          </div>

        </div>

      </div>


      {/* GRID */}
      <div className="grid xl:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="xl:col-span-2 space-y-8">

          {/* REALTIME */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-2xl font-bold mb-2">
                  Realtime Monitoring
                </h2>

                <p className="text-red-100/50">
                  Live system governance overview
                </p>

              </div>

              <div className="flex items-center gap-2 text-green-400">

                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

                Online

              </div>

            </div>


            <div className="grid md:grid-cols-2 gap-6">

              {/* ACTIVE SESSION */}
              <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-red-100/60 text-sm mb-2">
                      Active Session
                    </p>

                    <h2 className="text-xl font-black">
                      {

                        activeSession?.title ||

                        'No Active Session'

                      }
                    </h2>

                  </div>

                  <Clock3
                    className="text-red-500"
                    size={34}
                  />

                </div>

              </div>


              {/* REALTIME PRESENCE */}
              <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-red-100/60 text-sm mb-2">
                      Realtime Presence
                    </p>

                    <h2 className="text-4xl font-black">
                      {
                        Array.isArray(todayAttendance)
                          ? todayAttendance.filter(
                              (item) => item.status === 'HADIR'
                            ).length
                          : 0
                      }
                    </h2>

                  </div>

                  <Eye
                    className="text-red-500"
                    size={34}
                  />

                </div>

              </div>


              {/* AI */}
              <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-red-100/60 text-sm mb-2">
                      AI Detection
                    </p>

                    <h2 className="text-2xl font-black text-green-400">
                      Online
                    </h2>

                  </div>

                  <Activity
                    className="text-red-500"
                    size={34}
                  />

                </div>

              </div>


              {/* DB */}
              <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-red-100/60 text-sm mb-2">
                      Database Health
                    </p>

                    <h2 className="text-2xl font-black text-green-400">
                      Connected
                    </h2>

                  </div>

                  <Database
                    className="text-red-500"
                    size={34}
                  />

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT */}
        <div className="space-y-8">

          {/* SECURITY */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-3 mb-8">

              <AlertTriangle
                className="text-red-500"
                size={28}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  Security Alerts
                </h2>

                <p className="text-red-100/50">
                  Enterprise security monitoring
                </p>

              </div>

            </div>


            <div className="space-y-5">

              <div className="bg-[#160909] border border-red-950 rounded-2xl p-5">

                <p className="font-semibold mb-2">
                  Spoof Detection
                </p>

                <p className="text-sm text-red-100/50">
                  AI spoof detection system active.
                </p>

              </div>

            </div>

          </div>


          {/* FEED */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <h2 className="text-2xl font-bold mb-8">
              Realtime Feed
            </h2>


            <div className="space-y-5">

              {

                realtimeFeed.length > 0

                  ? realtimeFeed
                      .slice(0, 10)
                      .map(

                      (item, index) => (

                        <div

                          key={index}

                          className="border-b border-red-950 pb-4"

                        >

                          <p className="font-medium mb-1">
                            {

                              item.message ||

                              'Realtime Activity'

                            }
                          </p>

                          <p className="text-sm text-red-100/50">

                            {

                              item.createdAt ||

                              'Now'

                            }

                          </p>

                        </div>

                      )

                    )

                  : (

                    <p className="text-red-100/40">
                      No realtime activity
                    </p>

                  )

              }

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default SuperAdminDashboard; 