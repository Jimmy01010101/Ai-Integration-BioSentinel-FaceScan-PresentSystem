import {
  Navigate
} from 'react-router-dom';


// PROTECTED ROUTE
// - Wajib login (token)
// - Opsional: cek role (SUPER_ADMIN / ADMIN)
function ProtectedRoute({
  children,
  role
}) {

  const token =
    localStorage.getItem('token');

  // BELUM LOGIN
  if (!token) {
    return <Navigate to="/login" />;
  }

  // CEK ROLE (jika route mensyaratkan role tertentu)
  if (role) {

    let storedUser = null;

    try {

      storedUser =
        JSON.parse(
          localStorage.getItem('user')
        );

    } catch (error) {

      storedUser = null;

    }

    const userRole = storedUser?.role;

    // SUPER_ADMIN boleh mengakses halaman ADMIN,
    // tetapi ADMIN tidak boleh mengakses halaman SUPER_ADMIN.
    const allowed =
      userRole === role ||
      (role === 'ADMIN' && userRole === 'SUPER_ADMIN');

    if (!allowed) {

      if (userRole === 'SUPER_ADMIN') {
        return <Navigate to="/super-admin" />;
      }

      if (userRole === 'ADMIN') {
        return <Navigate to="/admin" />;
      }

      return <Navigate to="/login" />;

    }

  }

  return children;

}

export default ProtectedRoute;