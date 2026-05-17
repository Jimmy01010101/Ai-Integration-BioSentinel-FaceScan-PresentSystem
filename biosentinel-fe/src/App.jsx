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
import UserManagementPage from './pages/superadmin/UserManagementPage';
import AdminManagementPage from './pages/superadmin/AdminManagementPage';
import AttendanceSessionManagement from './pages/superadmin/AttendanceSessionManagement';
import RealtimeAttendancePage from './pages/superadmin/RealtimeAttendancePage';
import AuditLogsPage from './pages/superadmin/AuditLogsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';

import UserAttendancePage from './pages/user/UserAttendancePage';
import UserHistoryPage from './pages/user/UserHistoryPage';

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


        {/* USER ATTENDANCE (PUBLIK) */}
        <Route
          path="/attendance"
          element={<UserAttendancePage />}
        />

        {/* USER RIWAYAT PRESENSI (PUBLIK) */}
        <Route
          path="/attendance/history"
          element={<UserHistoryPage />}
        />


        {/* =========================
            SUPER ADMIN
        ========================= */}

        {/* DASHBOARD */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
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
            <ProtectedRoute role="SUPER_ADMIN">
              <DashboardLayout role="SUPER_ADMIN">
                <UserManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN MANAGEMENT */}
        <Route
          path="/super-admin/admins"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <DashboardLayout role="SUPER_ADMIN">
                <AdminManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ATTENDANCE SESSION */}
        <Route
          path="/super-admin/sessions"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <DashboardLayout role="SUPER_ADMIN">
                <AttendanceSessionManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* REALTIME ATTENDANCE */}
        <Route
          path="/super-admin/realtime-attendance"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <DashboardLayout role="SUPER_ADMIN">
                <RealtimeAttendancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* AUDIT LOGS */}
        <Route
          path="/super-admin/audit-logs"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <DashboardLayout role="SUPER_ADMIN">
                <AuditLogsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN
        ========================= */}

        {/* DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* LIHAT PENGGUNA */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminUserPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ATTENDANCE */}
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminAttendancePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN">
                <AdminSecurityPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* 404 */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />

      </Routes>

    </>

  );

}

export default App; 