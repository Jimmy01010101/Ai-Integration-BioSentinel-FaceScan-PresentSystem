import {
  ShieldCheck,
  ArrowLeft,
  UserCog,
  Shield
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

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [loading, setLoading] =
    useState(false);

  const [role, setRole] =
    useState('ADMIN');

  const [formData, setFormData] =
    useState({

      username: '',
      password: ''

    });


  // CHANGE
  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    };


  // LOGIN
  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        let response;


        // SUPER ADMIN
        if (
          role === 'SUPER_ADMIN'
        ) {

          response =
            await superAdminLogin(
              formData
            );

        }

        // ADMIN
        else {

          response =
            await adminLogin(
              formData
            );

        }


        // TOKEN
        localStorage.setItem(
          'token',
          response.token
        );


        // USER DATA
        localStorage.setItem(

          'user',

          JSON.stringify(
            response.data
          )

        );


        // CONTEXT
        login(
          response.data
        );


        toast.success(
          response.message ||
          'Login berhasil'
        );


        // REDIRECT
        if (
          role === 'SUPER_ADMIN'
        ) {

          navigate(
            '/super-admin'
          );

        } else {

          navigate(
            '/admin'
          );

        }

      } catch (error) {

        toast.error(

          error.response?.data?.message ||

          'Login gagal'

        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-[#180909] to-[#2b0d0d] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-red-700/20 blur-[140px] rounded-full top-[-100px] right-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-red-900/20 blur-[120px] rounded-full bottom-[-100px] left-[-100px]" />


      {/* BACK */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-red-300 hover:text-white transition-all"
      >

        <ArrowLeft size={18} />

        Kembali

      </Link>


      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-2xl border border-red-950 rounded-3xl p-10 shadow-2xl shadow-red-950/30">

        {/* HEADER */}
        <div className="text-center mb-10">

          <div className="w-20 h-20 rounded-3xl bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-6">

            <ShieldCheck
              className="text-red-500"
              size={38}
            />

          </div>

          <h1 className="text-4xl font-black text-red-500 mb-2">
            BioSentinel - AI V1.0
          </h1>

          <p className="text-red-100/60 text-sm leading-relaxed">
            Enterprise Dashboard Authentication
          </p>

        </div>

        {/* ROLE */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          {/* ADMIN */}
          <button

            type="button"

            onClick={() =>
              setRole('ADMIN')
            }

            className={`

              p-4 rounded-2xl border transition-all

              ${

                role === 'ADMIN'

                  ? 'bg-red-700 border-red-600'

                  : 'bg-[#160909] border-red-950'

              }

            `}

          >

            <UserCog
              className="mx-auto mb-2"
              size={28}
            />

            <span className="font-semibold">
              Admin
            </span>

          </button>


          {/* SUPER ADMIN */}
          <button

            type="button"

            onClick={() =>
              setRole(
                'SUPER_ADMIN'
              )
            }

            className={`

              p-4 rounded-2xl border transition-all

              ${

                role === 'SUPER_ADMIN'

                  ? 'bg-red-700 border-red-600'

                  : 'bg-[#160909] border-red-950'

              }

            `}

          >

            <Shield
              className="mx-auto mb-2"
              size={28}
            />

            <span className="font-semibold">
              Super Admin
            </span>

          </button>

        </div>


        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="block mb-2 text-sm text-red-200/70">
              Username
            </label>

            <input
              type="text"
              name="username"
              required
              onChange={handleChange}
              placeholder="Masukkan Username"
              className="w-full p-4 rounded-2xl bg-[#160909] border border-red-950 focus:border-red-600 outline-none transition-all"
            />

          </div>


          <div>

            <label className="block mb-2 text-sm text-red-200/70">
              Password
            </label>

            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              onChange={handleChange}
              placeholder="Masukkan Password"
              className="w-full p-4 rounded-2xl bg-[#160909] border border-red-950 focus:border-red-600 outline-none transition-all"
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-red-700 hover:bg-red-800 transition-all font-bold text-lg shadow-lg shadow-red-950/40"
          >

            {

              loading

                ? 'Loading...'

                : `Login ${

                    role ===
                    'SUPER_ADMIN'

                      ? 'Super Admin'

                      : 'Admin'

                  }`

            }

          </button>

        </form>


        {/* FOOTER */}
        <div className="mt-8 text-center text-sm text-red-100/40 leading-relaxed">

          Secure AI Biometric Governance System

        </div>

      </div>

    </div>

  );

}

export default LoginPage; 