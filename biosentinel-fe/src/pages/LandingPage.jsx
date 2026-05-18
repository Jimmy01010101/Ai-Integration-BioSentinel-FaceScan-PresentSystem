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
      <header className="w-full border-b border-bs-line/50 backdrop-blur-md bg-black/30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-bs-red">
              BioSentinel - AI V1.0
            </h1>

            <p className="text-xs text-bs-muted mt-1">
              System Presensi Berbasis AI BioSentinel - AI V10
              <br /> By Shanti Bhuana Team FullStack
            </p>

          </div>


          <div className="flex items-center gap-2 sm:gap-4">

            <Link
              to="/login"
              className="px-3 sm:px-5 py-2 text-sm rounded-xl border border-bs-line hover:bg-bs-red-deep transition-all whitespace-nowrap"
            >
              Login Administrator 
            </Link>

            <Link
              to="/attendance"
              className="px-3 sm:px-5 py-2 text-sm rounded-xl bg-bs-red hover:brightness-110 transition-all font-semibold whitespace-nowrap"
            >
              Presensi
            </Link>

          </div>

        </div>

      </header>


      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-20 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 items-center">

        {/* LEFT */}
        <div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bs-red-deep/50 border border-bs-line mb-6 text-sm text-bs-muted">
            <ShieldCheck size={18} />
            Face Scan System Presensi - Lomba CAS 12.0
          </div>


          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight mb-8">

            Sistem Presensi

            <span className="block text-bs-red">
              Bio Sentinel - AI V1.0
            </span>

          </h1>


          <p className="text-lg text-bs-muted leading-relaxed mb-10 max-w-2xl">

            BioSentinel - AI Versi 1.0 menghadirkan sistem presensi modern berbasis
            Artificial Intelligence dengan Face Recognition, Smile Verification,
            Liveness Detection, Realtime Monitoring, dan Enterprise Security.

          </p>


          <div className="flex flex-wrap gap-4">

            <Link
              to="/attendance"
              className="px-7 py-4 rounded-2xl bg-bs-red hover:brightness-110 transition-all font-bold flex items-center gap-2"
            >

              Mulai Presensi

              <ArrowRight size={20} />

            </Link>


            <Link
              to="/login"
              className="px-7 py-4 rounded-2xl border border-bs-line hover:bg-bs-red-deep transition-all font-bold"
            >
              Login Dashboard
            </Link>

          </div>

        </div>


        {/* RIGHT */}
        <div className="relative">

          <div className="absolute inset-0 bg-bs-red/20 blur-[120px] rounded-full" />

          <div className="relative bg-black/50 backdrop-blur-xl border border-bs-line rounded-3xl p-8 shadow-2xl shadow-red-950/20">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* CARD 1 */}
              <div className="bg-[#1b0b0b] border border-bs-line rounded-2xl p-6">

                <ScanFace
                  className="text-bs-red mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  AI Face Recognition
                </h3>

                <p className="text-sm text-bs-muted">
                  Identifikasi wajah realtime berbasis AI.
                </p>

              </div>


              {/* CARD 2 */}
              <div className="bg-[#1b0b0b] border border-bs-line rounded-2xl p-6">

                <Activity
                  className="text-bs-red mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Liveness Detection
                </h3>

                <p className="text-sm text-bs-muted">
                  Anti spoof dan validasi keaslian wajah.
                </p>

              </div>


              {/* CARD 3 */}
              <div className="bg-[#1b0b0b] border border-bs-line rounded-2xl p-6">

                <Users
                  className="text-bs-red mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Realtime Monitoring
                </h3>

                <p className="text-sm text-bs-muted">
                  Dashboard realtime untuk admin dan super admin.
                </p>

              </div>


              {/* CARD 4 */}
              <div className="bg-[#1b0b0b] border border-bs-line rounded-2xl p-6">

                <LockKeyhole
                  className="text-bs-red mb-4"
                  size={38}
                />

                <h3 className="font-bold text-lg mb-2">
                  Enterprise Security
                </h3>

                <p className="text-sm text-bs-muted">
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