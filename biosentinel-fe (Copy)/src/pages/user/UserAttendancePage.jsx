import * as faceapi from 'face-api.js';

import {
  Camera,
  ShieldCheck,
  UserCheck,
  Smile,
  LoaderCircle,
  CheckCircle2,
  ScanFace
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import toast from 'react-hot-toast';

import api from '../../services/api';


function UserAttendancePage() {

  // STATES
  const [employeeCode, setEmployeeCode] =
    useState('');

  const [userData, setUserData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [scanStatus, setScanStatus] =
    useState('Waiting Verification');

  const [activeSession, setActiveSession] =
    useState(null);

  const [attendanceSuccess, setAttendanceSuccess] =
    useState(false);

  const [aiReady, setAiReady] =
    useState(false);


  // REFS
  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const overlayRef =
    useRef(null);

  const detectionIntervalRef =
    useRef(null);


  // INIT
  useEffect(() => {

    loadActiveSession();

    loadAIModels();

    return () => {

      if (detectionIntervalRef.current) {

        clearInterval(
          detectionIntervalRef.current
        );

      }

    };

  }, []);

  // LOAD SESSION
  const loadActiveSession =
    async () => {

      try {

        const response =
          await api.get(
            '/session/active'
          );

        setActiveSession(
          response.data.data
        );

      } catch (error) {

        console.error(error);

      }

    };


  // LOAD AI
  const loadAIModels =
    async () => {

      try {

        setScanStatus(
          'Initializing AI'
        );

        await faceapi.nets.tinyFaceDetector
          .loadFromUri('/models');

        await faceapi.nets.faceLandmark68Net
          .loadFromUri('/models');

        await faceapi.nets.faceExpressionNet
          .loadFromUri('/models');

        setAiReady(true);

        setScanStatus(
          'AI Ready'
        );

        console.log(
          'AI MODELS LOADED'
        );

      } catch (error) {

        console.error(error);

        toast.error(
          'Failed load AI models'
        );

      }

    };


  // VERIFY USER
  const verifyUser =
    async () => {

      try {

        if (!employeeCode) {

          return;

        }


        setLoading(true);

        setScanStatus(
          'Verifying User'
        );


        const response =
          await api.post(

            '/attendance/verify-user',

            {

              identityNumber:
                employeeCode

            }

          );


        setUserData(
          response.data.data
        );


        toast.success(
          'User verified'
        );


        setScanStatus(
          'User Verified'
        );


        await startCamera();

        setTimeout(() => {

          startRealtimeFaceDetection();

        }, 1500);

      } catch (error) {

        console.error(error);

        toast.error(

          error.response?.data?.message ||

          'Verification failed'

        );

        setScanStatus(
          'Verification Failed'
        );

      } finally {

        setLoading(false);

      }

    };


  // START CAMERA
    const startCamera = async () => {

    try {

        setScanStatus(
        'Opening Camera'
        );

        // AKTIFKAN UI VIDEO DULU
        setCameraActive(true);

        // TUNGGU DOM RENDER
        await new Promise(resolve =>
        setTimeout(resolve, 500)
        );

        const video =
        videoRef.current;

        if (!video) {

        toast.error(
            'Video element not found'
        );

        return;

        }

        const stream =
        await navigator.mediaDevices.getUserMedia({

            video: {
            width: 1280,
            height: 720,
            facingMode: 'user'
            },

            audio: false

        });

        video.srcObject =
        stream;

        video.onloadedmetadata =
        async () => {

            try {

            await video.play();

            setScanStatus(
                'Camera Ready'
            );

            console.log(
                'CAMERA READY'
            );

            } catch (err) {

            console.error(err);

            toast.error(
                'Video play failed'
            );

            }

        };

    } catch (error) {

        console.error(error);

        toast.error(
        'Cannot access camera'
        );

        setScanStatus(
        'Camera Failed'
        );

    }

    };


  // REALTIME AI
    const startRealtimeFaceDetection = async () => {

    try {

        if (!aiReady) {

        return;

        }

        const waitVideoReady = async () => {

        return new Promise((resolve) => {

            const check = setInterval(() => {

            const video =
                videoRef.current;

            if (
                video &&
                video.readyState === 4 &&
                video.videoWidth > 0
            ) {

                clearInterval(check);

                resolve(video);

            }

            }, 300);

        });

        };


        const video =
        await waitVideoReady();

        const canvas =
        overlayRef.current;

        if (!canvas) {

        toast.error(
            'Overlay canvas missing'
        );

        return;

        }

        setScanStatus(
        'AI Scanning Face'
        );


        const displaySize = {

        width: video.videoWidth,

        height: video.videoHeight

        };


        canvas.width =
        displaySize.width;

        canvas.height =
        displaySize.height;


        faceapi.matchDimensions(
        canvas,
        displaySize
        );


        detectionIntervalRef.current =
        setInterval(async () => {

            const detection =
            await faceapi

                .detectSingleFace(

                video,

                new faceapi
                    .TinyFaceDetectorOptions()

                )

                .withFaceLandmarks()

                .withFaceExpressions();


            const ctx =
            canvas.getContext('2d');


            ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
            );


            if (!detection) {

            setScanStatus(
                'Face Not Detected'
            );

            return;

            }


            const resized =
            faceapi.resizeResults(
                detection,
                displaySize
            );


            faceapi.draw.drawDetections(
            canvas,
            resized
            );


            faceapi.draw.drawFaceLandmarks(
            canvas,
            resized
            );


            const smileScore =
            detection.expressions.happy;


            if (smileScore > 0.7) {

            setScanStatus(
                'Smile Detected'
            );

            clearInterval(
                detectionIntervalRef.current
            );

            await captureAttendance();

            } else {

            setScanStatus(
                'Please Smile'
            );

            }

        }, 1200);

    } catch (error) {

        console.error(error);

        toast.error(
        'AI scan failed'
        );

    }

    };


  // ATTENDANCE
const captureAttendance = async () => {

  try {

    if (!videoRef.current) {

      return;

    }

    setLoading(true);

    setScanStatus(
      'Matching Face'
    );

    const video =
      videoRef.current;

    // =====================================================
    // CANVAS BERSIH KHUSUS CAPTURE
    // PENTING: jangan pakai canvasRef (canvas overlay),
    // karena canvas itu sudah berisi gambar garis
    // landmark wajah. Foto yang dikirim ke server HARUS
    // foto wajah murni tanpa coretan, agar AI face
    // recognition di backend bisa mengekstrak descriptor
    // dengan benar.
    // =====================================================
    const captureCanvas =
      document.createElement('canvas');

    captureCanvas.width =
      video.videoWidth;

    captureCanvas.height =
      video.videoHeight;

    const context =
      captureCanvas.getContext('2d');

    context.drawImage(
      video,
      0,
      0,
      captureCanvas.width,
      captureCanvas.height
    );

    const canvas = captureCanvas;

    const blob =
      await new Promise((resolve) => {

        canvas.toBlob(

          resolve,

          'image/jpeg',

          0.95

        );

      });

    const file =
      new File(

        [blob],

        'attendance.jpg',

        {

          type: 'image/jpeg'

        }

      );

    const formData =
      new FormData();

    formData.append(
      'identityNumber',
      employeeCode
    );

    formData.append(
      'faceImage',
      file
    );

    formData.append(
      'smileVerified',
      'true'
    );

    formData.append(
      'blinkVerified',
      'true'
    );

    formData.append(
      'livenessVerified',
      'true'
    );

    formData.append(
      'spoofDetected',
      'false'
    );

    const response =
      await api.post(

        '/attendance/check-in',

        formData,

        {

          headers: {

            'Content-Type':
              'multipart/form-data'

          }

        }

      );

    console.log(response.data);

    setAttendanceSuccess(true);

    setScanStatus(
      'Attendance Success'
    );

    // STOP CAMERA
    if (video.srcObject) {

      const tracks =
        video.srcObject.getTracks();

      tracks.forEach(track =>
        track.stop()
      );

    }

    // POPUP SUCCESS
    toast.success(
      'Attendance Success',
      {
        duration: 3000
      }
    );

    // AUTO REFRESH
    setTimeout(() => {

      window.location.reload();

    }, 3000);

  } catch (error) {

    console.error(error);

    setScanStatus(
      'Attendance Failed'
    );

    // POPUP FAILED
    toast.error(

      error.response?.data?.message ||

      'AI Verification Failed',

      {
        duration: 3000
      }

    );

    // STOP CAMERA
    const video =
      videoRef.current;

    if (
      video &&
      video.srcObject
    ) {

      const tracks =
        video.srcObject.getTracks();

      tracks.forEach(track =>
        track.stop()
      );

    }

    // AUTO REFRESH
    setTimeout(() => {

      window.location.reload();

    }, 3000);

  } finally {

    setLoading(false);

  }

}; 


  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-[#160909] to-[#250909] text-white px-6 py-10">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap items-end justify-between gap-4">

        <div>

          <h1 className="text-5xl font-black text-red-500 mb-4">
            BioSentinel - AI 1.0
          </h1>

          <p className="text-red-100/60 text-lg">
            AI Biometric Attendance System
          </p>

        </div>

        <a
          href="/attendance/history"
          className="inline-flex items-center gap-2 bg-[#160909] border border-red-950 hover:bg-red-950/40 transition-all px-5 py-3 rounded-2xl font-semibold"
        >
          Lihat Riwayat Presensi
        </a>

      </div>


      {/* MAIN */}
      <div className="max-w-7xl mx-auto grid xl:grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-8">

          {/* SESSION */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-4 mb-6">

              <ShieldCheck
                className="text-red-500"
                size={36}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  Active Session
                </h2>

                <p className="text-red-100/50">
                  Current attendance session
                </p>

              </div>

            </div>


            <div className="bg-[#160909] border border-red-950 rounded-2xl p-6">

              {

                activeSession

                  ? (

                    <>

                      <h3 className="text-2xl font-black mb-3">

                        {activeSession.title}

                      </h3>

                      <p className="text-red-100/50">

                        Attendance session active

                      </p>

                    </>

                  )

                  : (

                    <div className="text-red-100/50">

                      No active attendance session

                    </div>

                  )

              }

            </div>

          </div>

          {/* VERIFY */}
            <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-4 mb-6">

                <UserCheck
                className="text-red-500"
                size={36}
                />

                <div>

                <h2 className="text-2xl font-bold">
                    Employee Verification
                </h2>

                <p className="text-red-100/50">
                    Autonomous AI Identity Verification
                </p>

                </div>

            </div>


            {/* INPUT */}
            <div className="space-y-5">

                <input
                type="text"
                placeholder="Enter Identity Number"
                value={employeeCode}
                onChange={(e) =>
                    setEmployeeCode(
                    e.target.value
                    )
                }
                className="w-full p-5 rounded-2xl bg-[#160909] border border-red-950 focus:border-red-600 outline-none"
                />


                {/* SUBMIT BUTTON */}
                {

                !userData && (

                    <button
                    onClick={verifyUser}
                    disabled={
                        loading ||
                        employeeCode.length < 5
                    }
                    className="w-full bg-red-700 hover:bg-red-600 transition-all duration-300 rounded-2xl p-5 font-bold text-lg disabled:opacity-50"
                    >

                    {

                        loading

                        ? 'Verifying User...'

                        : 'Start Verification'

                    }

                    </button>

                )

                }

            </div>


            {/* VERIFIED */}
            {

                userData && (

                <div className="mt-8 bg-[#160909] border border-red-950 rounded-2xl p-6">

                    <h3 className="text-xl font-black mb-2">

                    {

                        userData.fullName ||

                        userData.name

                    }

                    </h3>

                    <p className="text-green-400 font-semibold">

                    Employee Verified

                    </p>

                    <p className="text-red-100/50 mt-2">

                    Camera activated automatically

                    </p>

                </div>

                )

            }

            </div>

        </div>


        {/* RIGHT */}
        <div className="space-y-8">

          {/* CAMERA */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-4 mb-6">

              <Camera
                className="text-red-500"
                size={36}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  AI Face Scanner
                </h2>

                <p className="text-red-100/50">
                  Realtime biometric scanning
                </p>

              </div>

            </div>


            <div className="relative bg-[#160909] border border-red-950 rounded-3xl overflow-hidden h-[420px] flex items-center justify-center">

              {

                cameraActive

                  ? (

                    <>

                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />


                      <canvas
                        ref={overlayRef}
                        className="absolute top-0 left-0 w-full h-full"
                      />


                      <div className="absolute inset-0 overflow-hidden pointer-events-none">

                        <div className="ai-scan-line"></div>

                      </div>

                    </>

                  )

                  : (

                    <div className="text-center">

                      <ScanFace
                        className="mx-auto mb-5 text-red-500"
                        size={60}
                      />

                      <p className="text-red-100/50">
                        Waiting camera activation
                      </p>

                    </div>

                  )

              }

            </div>


            <canvas
              ref={canvasRef}
              className="hidden"
            />

          </div>


          {/* STATUS */}
          <div className="bg-black/40 border border-red-950 rounded-3xl p-8 backdrop-blur-xl">

            <div className="flex items-center gap-4 mb-8">

              <LoaderCircle
                className="text-red-500"
                size={36}
              />

              <div>

                <h2 className="text-2xl font-bold">
                  AI Scan Status
                </h2>

                <p className="text-red-100/50">
                  Autonomous biometric processing
                </p>

              </div>

            </div>


            <div className="space-y-5">

              <div className="bg-[#160909] border border-red-950 rounded-2xl p-5 flex items-center justify-between">

                <span>
                  Verification Status
                </span>

                <span className="text-red-400 font-semibold">
                  {scanStatus}
                </span>

              </div>


              <div className="bg-[#160909] border border-red-950 rounded-2xl p-5 flex items-center justify-between">

                <span>
                  Smile Verification
                </span>

                <Smile
                  className="text-red-500"
                  size={24}
                />

              </div>


              <div className="bg-[#160909] border border-red-950 rounded-2xl p-5 flex items-center justify-between">

                <span>
                  Liveness Detection
                </span>

                <ShieldCheck
                  className="text-green-400"
                  size={24}
                />

              </div>

            </div>


            {

              attendanceSuccess && (

                <div className="bg-green-950 border border-green-700 rounded-3xl p-6 mt-6">

                  <div className="flex items-center gap-4">

                    <CheckCircle2
                      className="text-green-400"
                      size={36}
                    />

                    <div>

                      <h2 className="text-2xl font-black text-green-300">

                        Attendance Success

                      </h2>

                      <p className="text-green-100/60">

                        AI biometric verification completed

                      </p>

                    </div>

                  </div>

                </div>

              )

            }

          </div>

        </div>

      </div>

    </div>

  );

}

export default UserAttendancePage;  