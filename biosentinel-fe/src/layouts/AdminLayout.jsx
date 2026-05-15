import {
  Outlet
} from 'react-router-dom';

function AdminLayout() {

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex">

        {/* SIDEBAR */}
        <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">

          <h1 className="text-2xl font-bold mb-10">
            Admin Panel
          </h1>

          <nav className="space-y-4">

            <button className="block w-full text-left hover:text-blue-400">
              Dashboard
            </button>

            <button className="block w-full text-left hover:text-blue-400">
              Monitoring
            </button>

            <button className="block w-full text-left hover:text-blue-400">
              Attendance
            </button>

          </nav>

        </aside>


        {/* CONTENT */}
        <main className="flex-1 p-10">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

export default AdminLayout;