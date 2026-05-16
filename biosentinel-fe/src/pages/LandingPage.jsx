import {
  ShieldCheck,
  ScanFace,
  Activity,
  Users,
  LockKeyhole,
  ArrowRight
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';


function LandingPage() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-[#180909] to-[#2b0d0d] text-white overflow-hidden">

      {/* HEADER */}
      <header className="w-full border-b border-red-950/50 backdrop-blur-md bg-black/30">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-black tracking-wide text-red-500">
              BioSentinel - AI 1.0
            </h1>

            <p className="text-xs text-red-200/60 mt-1">
              Enterprise AI Face Attendance System
            </p>

          </div>


          <div className="flex items-center gap-4">

            <Link
              to="/login"
              className="px-5 py-2 rounded-xl border border-red-800 hover:bg-red-950 transition-all"
            >
              Login Administrator 
            </Link>

            <Link
              to="/attendance"
              className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 transition-all font-semibold"
            >
              Presensi
            </Link>

          </div>

        </div>

      </header>


      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/50 border border-red-800 mb-6 text-sm text-red-300">
            <ShieldCheck size={18} />
            Enterprise Biometric Attendance Platform
          </div>


          <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">

            Sistem Presensi

            <span className="block text-red-500">
              Face Recognition AI
            </span>

          </h1>


          <p className="text-lg text-red-100/70 leading-relaxed mb-10 max-w-2xl">

            BioSentinel - AI 1.0 menghadirkan sistem presensi modern berbasis
            Artificial Intelligence dengan Face Recognition, Smile Verification,
            Liveness Detection, Realtime Monitoring, dan Enterprise Security.

          </p>


          <div className="flex flex-wrap gap-4">

            <Link
              to="/attendance"
              className="px-7 py-4 rounded-2xl bg-red-700 hover:bg-red-800 transition-all font-bold flex items-center gap-2"
            >

              Mulai Presensi

              <ArrowRight size={20} />

            </Link>


            <Link
              to="/login"
              className="px-7 py-4 rounded-2xl border border-red-800 hover:bg-red-950 transition-all font-bold"
            >
              Login Dashboard
            </Link>

          </div>

        </div>


        {/* RIGHT */}
        <div className="relative">

          <div className="absolute inset-0 bg-red-700/20 blur-[120px] rounded-full" />

          <div className="relative bg-black/50 backdrop-blur-xl border border-red-950 rounded-3xl p-8 shadow-2xl shadow-red-950/20">

            <div className="grid grid-cols-2 gap-6">

              {/* CARD 1 */}
              <div className="bg-[#1b0b0b] border border-red-950 rounded-2xl p-6">

                <ScanFace
                  className="text-red-500 mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  AI Face Recognition
                </h3>

                <p className="text-sm text-red-100/60">
                  Identifikasi wajah realtime berbasis AI.
                </p>

              </div>


              {/* CARD 2 */}
              <div className="bg-[#1b0b0b] border border-red-950 rounded-2xl p-6">

                <Activity
                  className="text-red-500 mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Liveness Detection
                </h3>

                <p className="text-sm text-red-100/60">
                  Anti spoof dan validasi keaslian wajah.
                </p>

              </div>


              {/* CARD 3 */}
              <div className="bg-[#1b0b0b] border border-red-950 rounded-2xl p-6">

                <Users
                  className="text-red-500 mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Realtime Monitoring
                </h3>

                <p className="text-sm text-red-100/60">
                  Dashboard realtime untuk admin dan super admin.
                </p>

              </div>


              {/* CARD 4 */}
              <div className="bg-[#1b0b0b] border border-red-950 rounded-2xl p-6">

                <LockKeyhole
                  className="text-red-500 mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Enterprise Security
                </h3>

                <p className="text-sm text-red-100/60">
                  Audit trail dan biometric governance system.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}

export default LandingPage; 