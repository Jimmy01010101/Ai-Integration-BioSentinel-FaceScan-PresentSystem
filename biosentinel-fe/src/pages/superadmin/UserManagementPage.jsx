import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import * as faceapi from 'face-api.js';

import toast from 'react-hot-toast';

import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  Eye,
  EyeOff,
  Camera,
  X
} from 'lucide-react';

import {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  createUser
} from '../../services/superAdminService';

const UserManagementPage = () => {

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [modelsLoaded, setModelsLoaded] =
    useState(false);

  const [form, setForm] = useState({
    fullName: '',
    identityNumber: '',
    division: ''
  });

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await getAllUsers();

      const payload =
        response?.data ||
        response?.users ||
        response ||
        [];

      setUsers(payload);

    } catch (error) {

      console.error(error);

      toast.error('Failed load users');

    } finally {

      setLoading(false);
    }
  };

  const loadFaceModels = async () => {

    try {

      setModelsLoaded(false);

      await Promise.all([

        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),

        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),

        faceapi.nets.faceRecognitionNet.loadFromUri('/models')

      ]);

      setModelsLoaded(true);

      console.log('AI MODELS LOADED');

    } catch (error) {

      console.error(error);

      toast.error('Failed load AI models');
    }
  };

  useEffect(() => {

    fetchUsers();

    loadFaceModels();

  }, []);

  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const keyword = search.toLowerCase();

      return (
        user.fullName
          ?.toLowerCase()
          .includes(keyword) ||

        user.identityNumber
          ?.toLowerCase()
          .includes(keyword) ||

        user.division
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  }, [users, search]);

  const handleToggleStatus = async (id) => {

    try {

      await toggleUserStatus(id);

      toast.success('Status updated');

      fetchUsers();

    } catch (error) {

      console.error(error);

      toast.error('Failed toggle status');
    }
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      'Delete this user?'
    );

    if (!confirmDelete) return;

    try {

      await deleteUser(id);

      toast.success('User deleted');

      fetchUsers();

    } catch (error) {

      console.error(error);

      toast.error('Failed delete user');
    }
  };

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true
        });

      streamRef.current = stream;

      if (videoRef.current) {

        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);

    } catch (error) {

      console.error(error);

      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    setCameraReady(false);
  };

  const openModal = async () => {

    setShowModal(true);

    setCapturedImage(null);

    try {

      if (!modelsLoaded) {

        toast.loading('Loading AI models...', {
          id: 'ai-model'
        });

        await loadFaceModels();

        toast.success('AI models ready', {
          id: 'ai-model'
        });
      }

      await startCamera();

    } catch (error) {

      console.error(error);

      toast.error('Failed initialize AI');
    }
  };

  const closeModal = () => {

    stopCamera();

    setShowModal(false);

    setCapturedImage(null);

    setForm({
      fullName: '',
      identityNumber: '',
      division: ''
    });
  };

  const captureFace = async () => {

    try {

      if (!modelsLoaded) {

        toast.error('AI model not ready');

        return;
      }

      const video = videoRef.current;

      if (!video) {

        toast.error('Camera not ready');

        return;
      }

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {

        toast.error(
          'Camera still initializing'
        );

        return;
      }

      const detection =
        await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (!detection) {

        toast.error('Face not detected');

        return;
      }

      const canvas =
        document.createElement('canvas');

      canvas.width = video.videoWidth;

      canvas.height = video.videoHeight;

      const ctx =
        canvas.getContext('2d');

      ctx.drawImage(
        video,
        0,
        0
      );

      const image =
        canvas.toDataURL('image/jpeg');

      setCapturedImage({

        image,

        descriptor: Array.from(
          detection.descriptor
        )

      });

      toast.success(
        'Face captured successfully'
      );

    } catch (error) {

      console.error(error);

      toast.error('Capture failed');
    }
  };

  const handleCreateUser = async () => {

    try {

      if (
        !form.fullName ||
        !form.identityNumber ||
        !form.division
      ) {

        toast.error('Complete all fields');

        return;
      }

      if (!capturedImage) {

        toast.error('Capture face first');

        return;
      }

      setSubmitting(true);

      const payload = {
        fullName: form.fullName,
        identityNumber:
          form.identityNumber,
        division: form.division,
        faceDescriptor:
          capturedImage.descriptor,
        faceImage:
          capturedImage.image
      };

      await createUser(payload);

      toast.success(
        'User created successfully'
      );

      closeModal();

      fetchUsers();

    } catch (error) {

      console.error(error);

      toast.error('Failed create user');

    } finally {

      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-red-500">
            User Management
          </h1>

          <p className="text-gray-400 mt-2">
            Enterprise biometric employee governance
          </p>

        </div>

        <div className="flex items-center gap-4">

          <div className="bg-[#071129] border border-red-900 rounded-2xl px-8 py-4 flex items-center gap-4">

            <Users className="text-red-500" />

            <div>

              <h2 className="text-3xl font-bold">
                {users.length}
              </h2>

              <p className="text-gray-400 text-sm">
                Registered Users
              </p>

            </div>

          </div>

          <button
            onClick={openModal}
            className="bg-red-600 hover:bg-red-700 transition-all px-6 py-4 rounded-2xl font-semibold flex items-center gap-3"
          >

            <Plus size={20} />

            Add User

          </button>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-[#071129] border border-red-900 rounded-3xl p-6 mb-8">

        <div className="flex items-center bg-[#140303] border border-red-900 rounded-2xl px-5">

          <Search className="text-red-500" />

          <input
            type="text"
            placeholder="Search employee..."
            className="w-full bg-transparent outline-none px-4 py-5 text-white"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-[#071129] border border-red-900 rounded-3xl overflow-hidden">

        <div className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-red-900 bg-[#140303] font-semibold text-white">

          <div>Employee</div>
          <div>Identity</div>
          <div>Division</div>
          <div>Biometric</div>
          <div>Status</div>
          <div>Actions</div>

        </div>

        {loading ? (

          <div className="p-10 text-center text-gray-400">
            Loading users...
          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="p-10 text-center text-gray-400">
            No users found
          </div>

        ) : (

          filteredUsers.map((user) => (

            <div
              key={user.id}
              className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-red-950 items-center"
            >

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-red-800">

                  <img
                    src={`http://localhost:5050/${user.faceImage}`}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />

                </div>

                <div>

                  <h2 className="font-bold">
                    {user.fullName}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    Employee
                  </p>

                </div>

              </div>

              <div className="font-mono text-gray-300">
                {user.identityNumber}
              </div>

              <div>
                {user.division}
              </div>

              <div className="flex items-center gap-2 text-emerald-400">

                <ShieldCheck size={18} />

                Registered

              </div>

              <div>

                {user.isActive ? (

                  <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-700 text-emerald-400 px-4 py-2 rounded-xl text-sm">
                    Active
                  </div>

                ) : (

                  <div className="inline-flex items-center gap-2 bg-red-950 border border-red-700 text-red-400 px-4 py-2 rounded-xl text-sm">
                    Disabled
                  </div>

                )}

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    handleToggleStatus(user.id)
                  }
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >

                  {user.isActive ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

                <button
                  onClick={() => fetchUsers()}
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >

                  <RefreshCcw size={18} />

                </button>

                <button
                  onClick={() =>
                    handleDelete(user.id)
                  }
                  className="w-11 h-11 rounded-xl bg-[#140303] border border-red-900 flex items-center justify-center hover:bg-red-950 transition-all"
                >

                  <Trash2 size={18} />

                </button>

              </div>

            </div>
          ))

        )}

      </div>

      {/* FOOTER */}

      <div className="mt-10 w-44 h-24 bg-[#071129] border border-red-900 rounded-3xl p-5">

        <div className="flex items-center gap-3 text-red-500 mb-3">

          <ShieldCheck />

          <span className="font-bold">
            AI Security
          </span>

        </div>

        <div className="text-emerald-400 text-sm">
          System Online
        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">

          <div className="w-full max-w-5xl bg-[#071129] border border-red-900 rounded-3xl p-8 relative">

            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-red-950 flex items-center justify-center"
            >

              <X />

            </button>

            <h2 className="text-3xl font-black text-red-500 mb-8">
              Add Biometric User
            </h2>

            <div className="grid grid-cols-2 gap-8">

              {/* FORM */}

              <div className="space-y-5">

                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName:
                        e.target.value
                    })
                  }
                  className="w-full bg-[#140303] border border-red-900 rounded-2xl px-5 py-4 outline-none"
                />

                <input
                  type="text"
                  placeholder="Identity Number"
                  value={form.identityNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      identityNumber:
                        e.target.value
                    })
                  }
                  className="w-full bg-[#140303] border border-red-900 rounded-2xl px-5 py-4 outline-none"
                />

                <input
                  type="text"
                  placeholder="Division"
                  value={form.division}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      division:
                        e.target.value
                    })
                  }
                  className="w-full bg-[#140303] border border-red-900 rounded-2xl px-5 py-4 outline-none"
                />

                <button
                  onClick={handleCreateUser}
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 transition-all py-4 rounded-2xl font-bold"
                >

                  {submitting
                    ? 'Creating User...'
                    : 'Create User'}

                </button>

              </div>

              {/* CAMERA */}

              <div>

                <div className="bg-black rounded-3xl overflow-hidden border border-red-900 h-[400px] relative">

                  {capturedImage ? (

                    <img
                      src={capturedImage.image}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />

                  )}

                  {!capturedImage && cameraReady && (

                    <button
                      onClick={captureFace}
                      className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 transition-all w-16 h-16 rounded-full flex items-center justify-center"
                    >

                      <Camera />

                    </button>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default UserManagementPage; 