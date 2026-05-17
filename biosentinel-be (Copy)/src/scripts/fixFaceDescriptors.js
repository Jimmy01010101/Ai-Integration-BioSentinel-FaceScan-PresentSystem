// =====================================================
// DIAGNOSTIK & PERBAIKAN FACE DESCRIPTOR USER
// =====================================================
// Jalankan: node src/scripts/fixFaceDescriptors.js
//
// Script ini memeriksa semua user dan melaporkan:
//  - user dengan descriptor KOSONG / rusak
//  - user dengan descriptor tapi BELUM tentu cocok
//    (karena dulu di-enroll lewat browser)
//
// Untuk user bermasalah: lakukan re-enroll lewat menu
// Super Admin (Re-Enroll Face) menggunakan foto wajah.
// =====================================================

const prisma =
  require('../config/prisma');

const fs =
  require('fs');

const {
  extractFaceDescriptor
} = require('../ai/faceMatcher');


const run = async () => {

  console.log('=== DIAGNOSTIK FACE DESCRIPTOR ===\n');

  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('Tidak ada user.');
    return;
  }

  let ok = 0;
  let broken = 0;
  let fixed = 0;

  for (const user of users) {

    let descriptor = user.faceDescriptor;

    // PARSE
    if (typeof descriptor === 'string') {
      try {
        descriptor = JSON.parse(descriptor);
      } catch (e) {
        descriptor = null;
      }
    }

    const isEmpty =
      !descriptor ||
      (Array.isArray(descriptor) &&
        descriptor.length === 0);

    if (isEmpty) {

      console.log(
        `[KOSONG]  ${user.fullName} (${user.identityNumber}) ` +
        `- faceDescriptor kosong`
      );

      broken += 1;

      // COBA PERBAIKI dari faceImage jika ada
      if (
        user.faceImage &&
        fs.existsSync(user.faceImage)
      ) {

        const newDesc =
          await extractFaceDescriptor(user.faceImage);

        if (newDesc) {

          await prisma.user.update({
            where: { id: user.id },
            data: {
              faceDescriptor: JSON.stringify(newDesc)
            }
          });

          console.log(
            `          -> DIPERBAIKI dari foto ${user.faceImage}`
          );

          fixed += 1;

        } else {

          console.log(
            `          -> GAGAL: wajah tidak terdeteksi di foto. ` +
            `Perlu re-enroll manual.`
          );

        }

      } else {

        console.log(
          `          -> Tidak ada foto. Perlu re-enroll manual.`
        );

      }

      continue;

    }

    // DESCRIPTOR ADA — cek dimensi
    const flat = Array.isArray(descriptor[0])
      ? descriptor[0]
      : descriptor;

    if (flat.length !== 128) {

      console.log(
        `[RUSAK]   ${user.fullName} (${user.identityNumber}) ` +
        `- dimensi descriptor ${flat.length}, seharusnya 128`
      );

      broken += 1;

    } else {

      console.log(
        `[OK]      ${user.fullName} (${user.identityNumber})`
      );

      ok += 1;

    }

  }

  console.log('\n=== RINGKASAN ===');
  console.log(`Total user   : ${users.length}`);
  console.log(`OK           : ${ok}`);
  console.log(`Bermasalah   : ${broken}`);
  console.log(`Diperbaiki   : ${fixed}`);
  console.log(
    '\nCatatan: user "OK" yang dulu di-enroll lewat browser ' +
    'mungkin tetap perlu re-enroll jika check-in gagal, ' +
    'karena descriptor browser != descriptor server.'
  );

};

run()
  .catch((e) => {
    console.error('ERROR:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });