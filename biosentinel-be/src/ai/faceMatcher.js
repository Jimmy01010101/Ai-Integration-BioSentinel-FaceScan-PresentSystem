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
// SECURITY CONFIG
// =====================================================

const FACE_MATCH_THRESHOLD = 0.42;

const MIN_CONFIDENCE = 0.75;

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
      'Stable AI models loaded'
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
        width: 320
      })

      .jpeg({
        quality: 80
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

              scoreThreshold: 0.65

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

      // NO FACE
      if (!detection) {

        console.log(
          'Face not detected'
        );

        return null;

      }

      // LOW QUALITY FACE
      if (
        detection.detection.score < 0.8
      ) {

        console.log(
          'Low quality face'
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
// ADVANCED FACE MATCHING
// =====================================================

const compareFaceDescriptors = (
  realtimeDescriptor,
  storedDescriptor
) => {

  try {

    if (
      !realtimeDescriptor ||
      !storedDescriptor
    ) {

      return {
        isMatch: false,
        confidence: 0,
        distance: 1
      };

    }

    const descriptor1 =
      new Float32Array(
        realtimeDescriptor
      );

    const descriptor2 =
      new Float32Array(
        storedDescriptor
      );

    if (
      descriptor1.length !==
      descriptor2.length
    ) {

      console.log(
        'Descriptor mismatch'
      );

      return {
        isMatch: false,
        confidence: 0,
        distance: 1
      };

    }

    // =====================================================
    // EUCLIDEAN DISTANCE
    // =====================================================

    const distance =
      faceapi.euclideanDistance(
        descriptor1,
        descriptor2
      );

    // =====================================================
    // REALISTIC CONFIDENCE
    // =====================================================

    let confidence = 0;

    if (distance <= 0.30) {

      confidence = 0.98;

    } else if (distance <= 0.35) {

      confidence = 0.93;

    } else if (distance <= 0.40) {

      confidence = 0.88;

    } else if (distance <= 0.45) {

      confidence = 0.80;

    } else if (distance <= 0.50) {

      confidence = 0.65;

    } else {

      confidence = 0.30;

    }

    confidence =
      Number(
        confidence.toFixed(2)
      );

    // =====================================================
    // STRICT VALIDATION
    // =====================================================

    const isMatch = (

      distance <= FACE_MATCH_THRESHOLD &&

      confidence >= MIN_CONFIDENCE

    );

    console.log({

      distance,
      confidence,
      isMatch

    });

    return {

      isMatch,

      confidence,

      distance,

      threshold:
        FACE_MATCH_THRESHOLD

    };

  } catch (error) {

    console.error(
      'COMPARE FACE ERROR:',
      error
    );

    return {

      isMatch: false,

      confidence: 0,

      distance: 1

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
