import {
  useState
} from 'react';

import {
  Link,
  useLocation,
  useNavigate
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
  CalendarClock,
  History,
  Menu,
  X,
  LogOut
} from 'lucide-react';


function DashboardLayout({ children, role }) {

  const location = useLocation();

  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);


  // =========================
  // SUPER ADMIN MENU
  // =========================
  const superAdminMenus = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { title: 'User Management', icon: Users, path: '/super-admin/users' },
    { title: 'Admin Management', icon: UserCog, path: '/super-admin/admins' },
    { title: 'Attendance Session', icon: CalendarClock, path: '/super-admin/sessions' },
    { title: 'Riwayat Session', icon: History, path: '/super-admin/session-history' },
    { title: 'Realtime Attendance', icon: Activity, path: '/super-admin/realtime-attendance' },
    { title: 'Audit Logs', icon: ClipboardList, path: '/super-admin/audit-logs' }
  ];

  // =========================
  // ADMIN MENU
  // =========================
  const adminMenus = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { title: 'Lihat Pengguna', icon: Users, path: '/admin/users' },
    { title: 'Presensi', icon: Activity, path: '/admin/attendance' },
    { title: 'Riwayat Session', icon: History, path: '/admin/session-history' },
    { title: 'Security', icon: ShieldCheck, path: '/admin/security' }
  ];

  const menuItems =
    role === 'SUPER_ADMIN' ? superAdminMenus : adminMenus;

  const roleLabel =
    role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN';


  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };


  // ISI SIDEBAR (dipakai desktop & drawer mobile)
  const SidebarContent = () => (

    <>

      {/* LOGO */}
      <div className="px-6 pt-7 pb-6 border-b border-bs-line">

        <div className="flex items-center gap-3">

          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-bs-red-deep border border-bs-red-dim flex items-center justify-center">
              <ScanFace className="text-bs-red-bright" size={24} />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">
              BioSentinel
              <span className="text-bs-red"> AI</span>
            </h1>
            <p className="bs-mono text-[10px] text-bs-muted mt-1">
              V1.0 · GOVERNANCE
            </p>
          </div>

        </div>

        {/* ROLE BADGE */}
        <div className="mt-5 flex items-center gap-2 bs-chip bg-bs-red-deep text-bs-red-bright border border-bs-red-dim w-fit">
          <ShieldCheck size={12} />
          {roleLabel}
        </div>

      </div>


      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">

        <p className="bs-mono text-[10px] text-bs-faint px-3 mb-2 tracking-widest">
          NAVIGASI
        </p>

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (

            <Link
              key={index}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-bs-red-deep to-transparent text-white border border-bs-red-dim'
                  : 'text-bs-muted hover:text-bs-text hover:bg-bs-panel-2 border border-transparent'
              }`}
            >

              {/* indikator aktif */}
              <span
                className={`w-1 h-5 rounded-full transition-all ${
                  active ? 'bg-bs-red-bright' : 'bg-transparent group-hover:bg-bs-line'
                }`}
              />

              <Icon
                size={18}
                className={active ? 'text-bs-red-bright' : ''}
              />

              <span className="text-sm font-semibold">
                {item.title}
              </span>

            </Link>

          );

        })}

      </nav>


      {/* FOOTER */}
      <div className="px-4 pb-5 pt-3 border-t border-bs-line space-y-3">

        <div className="bs-panel p-4">
          <div className="flex items-center gap-2.5">
            <div className="bs-live-dot" />
            <div>
              <p className="text-xs font-bold text-bs-text">
                System Online
              </p>
              <p className="bs-mono text-[10px] text-bs-muted">
                AI ENGINE ACTIVE
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bs-btn bs-btn-ghost w-full py-2.5 text-sm text-bs-muted hover:text-bs-red-bright"
        >
          <LogOut size={16} />
          Keluar
        </button>

      </div>

    </>

  );


  return (

    <div className="min-h-screen flex">

      {/* =========================
          SIDEBAR DESKTOP
      ========================= */}
      <aside className="w-[270px] shrink-0 bg-bs-abyss border-r border-bs-line hidden lg:flex flex-col">
        <SidebarContent />
      </aside>


      {/* =========================
          DRAWER MOBILE
      ========================= */}
      {drawerOpen && (

        <div className="fixed inset-0 z-50 lg:hidden">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-[270px] bg-bs-abyss border-r border-bs-line flex flex-col bs-fade-in">

            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-6 right-4 text-bs-muted hover:text-bs-text z-10"
            >
              <X size={22} />
            </button>

            <SidebarContent />

          </aside>

        </div>

      )}


      {/* =========================
          AREA KONTEN
      ========================= */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR MOBILE */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-bs-abyss/95 backdrop-blur border-b border-bs-line">

          <button
            onClick={() => setDrawerOpen(true)}
            className="bs-btn bs-btn-ghost w-10 h-10 p-0"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <ScanFace className="text-bs-red-bright" size={20} />
            <span className="font-black text-sm">
              BioSentinel <span className="text-bs-red">AI</span>
            </span>
          </div>

          <div className="bs-chip bg-bs-red-deep text-bs-red-bright border border-bs-red-dim text-[9px]">
            {roleLabel}
          </div>

        </header>


        {/* MAIN */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">

          <div className="bs-fade-in max-w-[1400px] mx-auto min-w-0">
            {children}
          </div>

        </main>

      </div>

    </div>

  );

}

export default DashboardLayout;
