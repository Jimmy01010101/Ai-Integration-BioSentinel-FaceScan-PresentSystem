const faceapi =
  require('face-api.js');

const canvas =
  require('canvas');

const path =
  require('path');

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

  await faceapi.nets.ssdMobilenetv1
    .loadFromDisk(modelPath);

  await faceapi.nets.faceLandmark68Net
    .loadFromDisk(modelPath);

  await faceapi.nets.faceRecognitionNet
    .loadFromDisk(modelPath);

  modelsLoaded = true;

  console.log(
    'AI face models loaded'
  );

};

const extractFaceDescriptor =
  async (imagePath) => {

    await loadModels();

    const img =
      await canvas.loadImage(imagePath);

    const detection =
      await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

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

  const distance =
    faceapi.euclideanDistance(
      descriptor1,
      descriptor2
    );

  return {
    distance,
    isMatch: distance < 0.6
  };

};

module.exports = {
  loadModels,
  extractFaceDescriptor,
  compareFaceDescriptors
}; 