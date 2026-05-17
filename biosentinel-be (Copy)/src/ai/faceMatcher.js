const faceapi =
  require('face-api.js');

const canvas =
  require('canvas');

const sharp =
  require('sharp');

const path =
  require('path');

const fs =
  require('fs');

const {
  Canvas,
  Image,
  ImageData
} = canvas;

// =====================================================
// PATCH ENVIRONMENT
// =====================================================

faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
});

// =====================================================
// GLOBAL MODEL STATE
// =====================================================

let modelsLoaded = false;

// =====================================================
// AI CONFIG
// =====================================================
// FACE_MATCH_THRESHOLD:
//   Ambang jarak euclidean. Wajah dianggap COCOK jika
//   distance <= threshold. Standar face-api.js = 0.6.
//   0.44 terlalu ketat untuk webcam + cahaya ruangan,
//   sehingga wajah asli pun sering ditolak.
//   0.54 = keseimbangan aman: akurat tapi toleran
//   terhadap variasi pencahayaan/sudut.
//
// MIN_CONFIDENCE:
//   Confidence minimum agar diterima. Lapis kedua
//   pengaman selain threshold jarak.
// =====================================================

const FACE_MATCH_THRESHOLD = 0.54;

const MIN_CONFIDENCE = 0.55;

// Skor deteksi wajah minimum saat ekstraksi descriptor
const MIN_DETECTION_SCORE = 0.55;

// =====================================================
// LOAD MODELS
// =====================================================

const loadModels = async () => {

  try {

    if (modelsLoaded) {
      return;
    }

    const modelPath =
      path.join(
        __dirname,
        '../../models'
      );

    await faceapi.nets.tinyFaceDetector
      .loadFromDisk(modelPath);

    await faceapi.nets.faceLandmark68Net
      .loadFromDisk(modelPath);

    await faceapi.nets.faceRecognitionNet
      .loadFromDisk(modelPath);

    modelsLoaded = true;

    console.log(
      'Enterprise AI models loaded'
    );

  } catch (error) {

    console.error(
      'LOAD MODEL ERROR:',
      error
    );

    throw error;

  }

};

// =====================================================
// IMAGE OPTIMIZATION
// =====================================================
// Resize + normalisasi cahaya. ".normalize()" sangat
// membantu pada kondisi ruangan gelap karena meratakan
// kontras sebelum wajah dianalisis.
// =====================================================

const optimizeImage = async (
  imagePath
) => {

  try {

    const optimizedPath =
      imagePath.replace(
        /\.(jpg|jpeg|png)$/i,
        '_optimized.jpg'
      );

    await sharp(imagePath)

      .resize({
        width: 400
      })

      .jpeg({
        quality: 90
      })

      .normalize()

      .sharpen()

      .toFile(optimizedPath);

    return optimizedPath;

  } catch (error) {

    console.error(
      'IMAGE OPTIMIZE ERROR:',
      error
    );

    throw error;

  }

};

// =====================================================
// EXTRACT FACE DESCRIPTOR
// =====================================================

const extractFaceDescriptor =
  async (imagePath) => {

    try {

      await loadModels();

      const optimizedImagePath =
        await optimizeImage(
          imagePath
        );

      const img =
        await canvas.loadImage(
          optimizedImagePath
        );

      const detection =
        await faceapi
          .detectSingleFace(

            img,

            new faceapi.TinyFaceDetectorOptions({

              inputSize: 416,

              scoreThreshold: 0.5

            })

          )

          .withFaceLandmarks()

          .withFaceDescriptor();

      // CLEANUP TEMP FILE
      if (
        fs.existsSync(
          optimizedImagePath
        )
      ) {

        fs.unlinkSync(
          optimizedImagePath
        );

      }

      // TIDAK ADA WAJAH TERDETEKSI
      if (!detection) {

        console.log(
          '[FACE] Wajah tidak terdeteksi pada gambar'
        );

        return null;

      }

      // KUALITAS WAJAH TERLALU RENDAH
      if (
        detection.detection.score <
        MIN_DETECTION_SCORE
      ) {

        console.log(
          '[FACE] Kualitas wajah rendah, skor:',
          detection.detection.score.toFixed(3)
        );

        return null;

      }

      return Array.from(
        detection.descriptor
      );

    } catch (error) {

      console.error(
        'EXTRACT FACE ERROR:',
        error
      );

      return null;

    }

  };

// =====================================================
// NORMALISASI STORED DESCRIPTOR
// =====================================================
// Mengubah berbagai bentuk penyimpanan descriptor
// menjadi daftar descriptor [ [128 angka], ... ].
// Mendukung: string JSON, single descriptor, multi
// descriptor, dan object { descriptor: [...] }.
// =====================================================

const normalizeStoredDescriptor = (
  storedDescriptor
) => {

  let parsed = storedDescriptor;

  // STRING JSON -> OBJECT
  if (typeof parsed === 'string') {

    try {

      parsed = JSON.parse(parsed);

    } catch (error) {

      console.log(
        '[FACE] Stored descriptor bukan JSON valid'
      );

      return [];

    }

  }

  // KOSONG / NULL
  if (
    !parsed ||
    (Array.isArray(parsed) &&
      parsed.length === 0)
  ) {

    return [];

  }

  // BENTUK { descriptor: [...] }
  if (
    !Array.isArray(parsed) &&
    parsed.descriptor
  ) {

    parsed = parsed.descriptor;

  }

  // BUKAN ARRAY -> TIDAK VALID
  if (!Array.isArray(parsed)) {

    return [];

  }

  // MULTI DESCRIPTOR: [ [..], [..] ]
  if (Array.isArray(parsed[0])) {

    return parsed.filter(
      (d) =>
        Array.isArray(d) &&
        d.length > 0
    );

  }

  // SINGLE DESCRIPTOR: [ ..128 angka.. ]
  return [parsed];

};

// =====================================================
// COMPARE FACE DESCRIPTORS
// =====================================================

const compareFaceDescriptors = (
  realtimeDescriptor,
  storedDescriptor
) => {

  try {

    // VALIDASI REALTIME DESCRIPTOR
    if (
      !realtimeDescriptor ||
      !Array.isArray(realtimeDescriptor) ||
      realtimeDescriptor.length === 0
    ) {

      console.log(
        '[FACE] Realtime descriptor kosong/tidak valid'
      );

      return {
        isMatch: false,
        confidence: 0,
        distance: 1,
        reason: 'REALTIME_DESCRIPTOR_INVALID'
      };

    }

    // NORMALISASI STORED DESCRIPTOR
    const descriptorList =
      normalizeStoredDescriptor(
        storedDescriptor
      );

    // STORED DESCRIPTOR KOSONG
    // -> user belum punya data wajah / data rusak
    if (descriptorList.length === 0) {

      console.log(
        '[FACE] Stored descriptor user KOSONG. ' +
        'User belum di-enroll wajah dengan benar.'
      );

      return {
        isMatch: false,
        confidence: 0,
        distance: 1,
        reason: 'STORED_DESCRIPTOR_EMPTY'
      };

    }

    const realtime =
      new Float32Array(
        realtimeDescriptor
      );

    let bestDistance = 999;

    let comparedCount = 0;

    // CARI KECOCOKAN TERBAIK
    for (
      const descriptor of descriptorList
    ) {

      const stored =
        new Float32Array(descriptor);

      // DIMENSI HARUS SAMA (128)
      if (
        realtime.length !==
        stored.length
      ) {

        console.log(
          '[FACE] Dimensi descriptor beda:',
          realtime.length,
          'vs',
          stored.length
        );

        continue;

      }

      const distance =
        faceapi.euclideanDistance(
          realtime,
          stored
        );

      comparedCount += 1;

      if (distance < bestDistance) {

        bestDistance = distance;

      }

    }

    // TIDAK ADA DESCRIPTOR YANG BISA DIBANDINGKAN
    if (comparedCount === 0) {

      console.log(
        '[FACE] Tidak ada descriptor valid untuk dibandingkan'
      );

      return {
        isMatch: false,
        confidence: 0,
        distance: 1,
        reason: 'DESCRIPTOR_DIMENSION_MISMATCH'
      };

    }

    // =====================================================
    // CONFIDENCE (disesuaikan dengan threshold 0.54)
    // =====================================================

    let confidence = 0;

    if (bestDistance <= 0.30) {

      confidence = 0.99;

    } else if (bestDistance <= 0.36) {

      confidence = 0.96;

    } else if (bestDistance <= 0.42) {

      confidence = 0.91;

    } else if (bestDistance <= 0.48) {

      confidence = 0.83;

    } else if (bestDistance <= 0.54) {

      confidence = 0.70;

    } else if (bestDistance <= 0.60) {

      confidence = 0.45;

    } else {

      confidence = 0.10;

    }

    confidence =
      Number(confidence.toFixed(2));

    // =====================================================
    // KEPUTUSAN AKHIR
    // Lolos jika jarak <= threshold DAN confidence cukup.
    // =====================================================

    const isMatch =
      bestDistance <= FACE_MATCH_THRESHOLD &&
      confidence >= MIN_CONFIDENCE;

    console.log({
      tag: '[FACE MATCH]',
      distance:
        Number(bestDistance.toFixed(4)),
      confidence,
      threshold: FACE_MATCH_THRESHOLD,
      comparedDescriptors: comparedCount,
      isMatch
    });

    return {

      isMatch,

      confidence,

      distance:
        Number(bestDistance.toFixed(4)),

      threshold: FACE_MATCH_THRESHOLD,

      reason: isMatch
        ? 'MATCH'
        : 'DISTANCE_ABOVE_THRESHOLD'

    };

  } catch (error) {

    console.error(
      'COMPARE FACE ERROR:',
      error
    );

    return {
      isMatch: false,
      confidence: 0,
      distance: 1,
      reason: 'COMPARE_ERROR'
    };

  }

};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  loadModels,

  extractFaceDescriptor,

  compareFaceDescriptors

};