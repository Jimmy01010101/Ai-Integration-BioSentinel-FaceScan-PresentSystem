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

import AttendancePage from './pages/AttendancePage';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';


// LAYOUTS
import SuperAdminLayout from './layouts/SuperAdminLayout';

import AdminLayout from './layouts/AdminLayout';


// ROUTES
import ProtectedRoute from './routes/ProtectedRoute';


// APP
function App() {

  return (

    <>

      {/* TOASTER */}
      <Toaster
        position="top-right"
      />


      <Routes>

        {/* LANDING PAGE */}
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
          element={<AttendancePage />}
        />


        {/* SUPER ADMIN */}
        <Route

          path="/super-admin"

          element={

            <ProtectedRoute>

              <SuperAdminLayout />

            </ProtectedRoute>

          }

        >

          <Route
            index
            element={
              <SuperAdminDashboard />
            }
          />

        </Route>


        {/* ADMIN */}
        <Route

          path="/admin"

          element={

            <ProtectedRoute>

              <AdminLayout />

            </ProtectedRoute>

          }

        >

          <Route
            index
            element={
              <AdminDashboard />
            }
          />

        </Route>


        {/* FALLBACK */}
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