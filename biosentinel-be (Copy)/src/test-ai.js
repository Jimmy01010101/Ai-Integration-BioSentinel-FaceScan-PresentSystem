const path =
  require('path');

const {
  extractFaceDescriptor
} = require('./ai/faceMatcher');

(async () => {

  const descriptor =
    await extractFaceDescriptor(
      path.join(
        __dirname,
        '../uploads/users/1778660842343.jpeg'
      )
    );

  console.log(descriptor);

})();