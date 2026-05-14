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

faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
});

let modelsLoaded = false;

const loadModels = async () => {

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
    '✅ Stable AI models loaded'
  );

};

const optimizeImage = async (
  imagePath
) => {

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
      quality: 70
    })

    .toFile(optimizedPath);

  return optimizedPath;

};

const extractFaceDescriptor =
  async (imagePath) => {

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

            inputSize: 320,

            scoreThreshold: 0.5

          })

        )

        .withFaceLandmarks()

        .withFaceDescriptor();

    // DELETE TEMP IMAGE
    if (
      fs.existsSync(
        optimizedImagePath
      )
    ) {

      fs.unlinkSync(
        optimizedImagePath
      );

    }

    if (!detection) {
      return null;
    }

    return Array.from(
      detection.descriptor
    );

  };

const compareFaceDescriptors = (
  descriptor1,
  descriptor2
) => {

  if (
    descriptor1.length !==
    descriptor2.length
  ) {

    throw new Error(
      'Descriptor length mismatch'
    );

  }

  const distance =
    faceapi.euclideanDistance(
      descriptor1,
      descriptor2
    );

  return {

    distance,

    confidenceScore:
      Number(
        (
          1 - distance
        ).toFixed(2)
      ),

    isMatch:
      distance < 0.55

  };

};

module.exports = {
  loadModels,
  extractFaceDescriptor,
  compareFaceDescriptors
}; 