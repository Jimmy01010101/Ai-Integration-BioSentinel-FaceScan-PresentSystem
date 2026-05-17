const prisma =
  require('../config/prisma');

const path =
  require('path');

const {
  extractFaceDescriptor
} = require('../ai/faceMatcher');

const generateDescriptor =
  async () => {

    try {

      const users =
        await prisma.user.findMany();

      for (const user of users) {

        if (!user.faceImage) {

          console.log(
            `Skip user ${user.fullName}`
          );

          continue;

        }

        const imagePath =
          path.join(
            process.cwd(),
            user.faceImage
          );

        const descriptor =
          await extractFaceDescriptor(
            imagePath
          );

        if (!descriptor) {

          console.log(
            `No face detected for ${user.fullName}`
          );

          continue;

        }

        await prisma.user.update({
          where: {
            id: user.id
          },

          data: {
            faceDescriptor:
              JSON.stringify(
                descriptor
              )
          }
        });

        console.log(
          `Descriptor updated: ${user.fullName}`
        );

      }

      console.log(
        'All descriptors generated'
      );

    } catch (error) {

      console.error(error);

    }

};

generateDescriptor();