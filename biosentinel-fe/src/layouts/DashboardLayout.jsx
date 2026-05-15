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
  ScanFace
} from 'lucide-react';


function DashboardLayout({
  children
}) {

  const location =
    useLocation();


  // MENU
  const menuItems = [

    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin'
    },

    {
      title: 'Users',
      icon: Users,
      path: '/super-admin/users'
    },

    {
      title: 'Admins',
      icon: UserCog,
      path: '/super-admin/admins'
    },

    {
      title: 'Audit Logs',
      icon: ClipboardList,
      path: '/super-admin/audit-logs'
    }

  ];


  return (

    <div className="min-h-screen bg-[#020617] text-white flex">

      {/* SIDEBAR */}
      <aside className="w-[230px] bg-[#081028] border-r border-red-950 p-6 hidden lg:flex flex-col">

        {/* LOGO */}
        <div className="mb-12">

          <h1 className="text-4xl font-black text-white">
            BioSentinel
          </h1>

        </div>


        {/* MENU */}
        <nav className="space-y-2">

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
                      px-4 py-3 rounded-2xl
                      transition-all

                      ${

                        active

                          ? 'bg-red-700 text-white'

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


      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-8">

        {children}

      </main>

    </div>

  );

}

export default DashboardLayout;