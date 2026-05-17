import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  Toaster
} from 'react-hot-toast';


// PAGES
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import UserAttendancePage from './pages/user/UserAttendancePage';

import UserManagementPage from './pages/superadmin/UserManagementPage';

// SESSION
import AttendanceSessionManagement from './pages/superadmin/AttendanceSessionManagement';

// ATTENDANCE
import RealtimeAttendancePage from "./pages/superadmin/RealtimeAttendancePage"; 

// LAYOUTS
import DashboardLayout from './layouts/DashboardLayout';


// ROUTES
import ProtectedRoute from './routes/ProtectedRoute';


function App() {

  return (

    <>

      {/* TOASTER */}
      <Toaster
        position="top-right"
      />


      <Routes>

        {/* LANDING */}
        <Route
          path="/"
          element={<LandingPage />}
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />


        {/* USER ATTENDANCE */}
        <Route
          path="/attendance"
          element={
            <UserAttendancePage />
          }
        />


        {/* =========================
            SUPER ADMIN
        ========================= */}

        {/* DASHBOARD */}
        <Route

          path="/super-admin"

          element={

            <ProtectedRoute>

              <DashboardLayout role="SUPER_ADMIN">

                <SuperAdminDashboard />

              </DashboardLayout>

            </ProtectedRoute>

          }

        />


        {/* USER MANAGEMENT */}
        <Route

          path="/super-admin/users"

          element={

            <ProtectedRoute>

              <DashboardLayout role="SUPER_ADMIN">

                <UserManagementPage />

              </DashboardLayout>

            </ProtectedRoute>

          }

        />

        <Route

          path="/super-admin/sessions"

          element={

            <ProtectedRoute>

              <DashboardLayout role="SUPER_ADMIN">

                <AttendanceSessionManagement />

              </DashboardLayout>

            </ProtectedRoute>

          }

        />

        <Route
          path="/super-admin/realtime-attendance"
          element={<RealtimeAttendancePage />}
        />

        {/* =========================
            ADMIN
        ========================= */}

        <Route

          path="/admin"

          element={

            <ProtectedRoute>

              <DashboardLayout role="ADMIN">

                <AdminDashboard />

              </DashboardLayout>

            </ProtectedRoute>

          }

        />


        {/* 404 */}
        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

      </Routes>

    </>

  );

}

export default App; 