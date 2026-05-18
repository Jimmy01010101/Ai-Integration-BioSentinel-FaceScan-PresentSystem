import {
  ShieldCheck,
  ArrowLeft,
  UserCog,
  Shield,
  ScanFace,
  Lock,
  User,
  Loader2
} from 'lucide-react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import {
  useState
} from 'react';

import toast from 'react-hot-toast';

import {
  superAdminLogin,
  adminLogin
} from '../services/authService';

import {
  useAuth
} from '../contexts/AuthContext';


function LoginPage() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState('ADMIN');

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });


  // CHANGE
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // LOGIN
  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      let response;

      if (role === 'SUPER_ADMIN') {

        response = await superAdminLogin(formData);

      } else {

        response = await adminLogin(formData);

      }

      // TOKEN
      localStorage.setItem('token', response.token);

      // USER DATA
      localStorage.setItem(
        'user',
        JSON.stringify(response.data)
      );

      // CONTEXT
      login(response.data);

      toast.success(response.message || 'Login berhasil');

      // REDIRECT
      if (role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message || 'Login gagal'
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-10">

      <div className="w-full max-w-md bs-fade-in">

        {/* BACK */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-bs-muted hover:text-bs-text transition-all mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>


        {/* CARD */}
        <div className="bs-panel p-7 sm:p-9 relative overflow-hidden">

          {/* garis aksen atas */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-bs-red to-transparent" />

          {/* LOGO */}
          <div className="flex flex-col items-center text-center mb-8">

            <div className="w-16 h-16 rounded-2xl bg-bs-red-deep border border-bs-red-dim flex items-center justify-center mb-4">
              <ScanFace className="text-bs-red-bright" size={32} />
            </div>

            <h1 className="text-2xl font-black">
              BioSentinel <span className="text-bs-red">AI</span>
            </h1>

            <p className="bs-mono text-[11px] text-bs-muted mt-1.5 tracking-wider">
              SECURE ACCESS TERMINAL · V1.0
            </p>

          </div>


          {/* PILIH ROLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">

            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`p-4 rounded-xl border transition-all ${
                role === 'ADMIN'
                  ? 'bg-bs-red-deep border-bs-red-dim'
                  : 'bg-bs-panel-2 border-bs-line hover:border-bs-faint'
              }`}
            >
              <UserCog
                className={`mx-auto mb-2 ${
                  role === 'ADMIN' ? 'text-bs-red-bright' : 'text-bs-muted'
                }`}
                size={24}
              />
              <p className={`text-sm font-bold ${
                role === 'ADMIN' ? 'text-bs-text' : 'text-bs-muted'
              }`}>
                Admin
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole('SUPER_ADMIN')}
              className={`p-4 rounded-xl border transition-all ${
                role === 'SUPER_ADMIN'
                  ? 'bg-bs-red-deep border-bs-red-dim'
                  : 'bg-bs-panel-2 border-bs-line hover:border-bs-faint'
              }`}
            >
              <Shield
                className={`mx-auto mb-2 ${
                  role === 'SUPER_ADMIN' ? 'text-bs-red-bright' : 'text-bs-muted'
                }`}
                size={24}
              />
              <p className={`text-sm font-bold ${
                role === 'SUPER_ADMIN' ? 'text-bs-text' : 'text-bs-muted'
              }`}>
                Super Admin
              </p>
            </button>

          </div>


          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* USERNAME */}
            <div>
              <label className="block mb-2 bs-mono text-[11px] text-bs-muted tracking-wider">
                USERNAME
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bs-faint"
                  size={17}
                />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  className="bs-input pl-11 pr-4 py-3.5 text-sm"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-2 bs-mono text-[11px] text-bs-muted tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bs-faint"
                  size={17}
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="bs-input pl-11 pr-4 py-3.5 text-sm"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="bs-btn bs-btn-primary w-full py-3.5 text-sm mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Masuk Sistem
                </>
              )}
            </button>

          </form>


          {/* FOOTER */}
          <div className="mt-7 pt-5 border-t border-bs-line flex items-center justify-center gap-2">
            <div className="bs-live-dot" />
            <p className="bs-mono text-[10px] text-bs-muted tracking-wider">
              ENCRYPTED CONNECTION · SECURE
            </p>
          </div>

        </div>

      </div>

    </div>

  );

}

export default LoginPage;
