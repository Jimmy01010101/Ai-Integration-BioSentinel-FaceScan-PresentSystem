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


        {/* SUPER ADMIN */}
        <Route

          path="/super-admin"

          element={

            <ProtectedRoute>

              <DashboardLayout>

                <SuperAdminDashboard />

              </DashboardLayout>

            </ProtectedRoute>

          }

        />


        {/* ADMIN */}
        <Route

          path="/admin"

          element={

            <ProtectedRoute>

              <DashboardLayout>

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