import {
  Link,
  useLocation
} from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  ShieldAlert,
  ScanFace,
  Activity,
  ShieldCheck,
  BarChart3,
  CalendarClock 
} from 'lucide-react';


function DashboardLayout({

  children,
  role

}) {

  const location =
    useLocation();


  // =========================
  // SUPER ADMIN MENU
  // =========================
  const superAdminMenus = [

    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin'
    },

    {
      title: 'User Management',
      icon: Users,
      path: '/super-admin/users'
    },
    {
      title: 'Attendance Session',
      icon: CalendarClock,
      path: '/super-admin/sessions'
    },
    {
      title: 'Admin Management',
      icon: UserCog,
      path: '/super-admin/admins'
    },

    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/super-admin/analytics'
    },

    {
      title: 'Audit Logs',
      icon: ClipboardList,
      path: '/super-admin/audit-logs'
    }

  ];


  // =========================
  // ADMIN MENU
  // =========================
  const adminMenus = [

    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin'
    },

    {
      title: 'Attendance',
      icon: Activity,
      path: '/admin/attendance'
    },

    {
      title: 'Security',
      icon: ShieldCheck,
      path: '/admin/security'
    }

  ];


  // ROLE MENU
  const menuItems =

    role === 'SUPER_ADMIN'

      ? superAdminMenus

      : adminMenus;


  return (

    <div className="min-h-screen bg-[#020617] text-white flex">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="w-[260px] bg-[#081028] border-r border-red-950 p-6 hidden lg:flex flex-col">

        {/* LOGO */}
        <div className="mb-12">

          <h1 className="text-4xl font-black text-white">
            BioSentinel
          </h1>

          <p className="text-red-100/50 mt-2 text-sm">

            AI Governance System

          </p>

        </div>


        {/* MENU */}
        <nav className="space-y-3">

          {

            menuItems.map(
              (item, index) => {

                const Icon =
                  item.icon;

                const active =
                  location.pathname === item.path;

                return (

                  <Link

                    key={index}

                    to={item.path}

                    className={`

                      flex items-center gap-3
                      px-4 py-4 rounded-2xl
                      transition-all duration-300

                      ${

                        active

                          ? 'bg-red-700 text-white shadow-lg shadow-red-900/30'

                          : 'hover:bg-[#101b38] text-red-100/70'

                      }

                    `}

                  >

                    <Icon size={20} />

                    <span className="font-medium">
                      {item.title}
                    </span>

                  </Link>

                );

              }
            )

          }

        </nav>


        {/* FOOTER */}
        <div className="mt-auto">

          <div className="bg-[#101827] border border-red-950 rounded-3xl p-5">

            <div className="flex items-center gap-3 mb-4">

              <ShieldAlert
                className="text-red-500"
                size={28}
              />

              <div>

                <h3 className="font-bold">
                  AI Security
                </h3>

                <p className="text-xs text-red-100/50">
                  Enterprise Protection
                </p>

              </div>

            </div>


            <div className="flex items-center gap-2 text-green-400 text-sm">

              <ScanFace size={16} />

              System Online

            </div>

          </div>

        </div>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="flex-1 overflow-y-auto p-8">

        {children}

      </main>

    </div>

  );

}

export default DashboardLayout; 