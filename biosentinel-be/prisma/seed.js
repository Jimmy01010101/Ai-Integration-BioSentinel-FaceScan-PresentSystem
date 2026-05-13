const bcrypt = require('bcrypt');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  const hashedPassword = await bcrypt.hash(
    'superadmin123',
    10
  );

  await prisma.superAdmin.create({
    data: {
      username: 'superadmin',
      password: hashedPassword
    }
  });

  console.log('Super Admin Created');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 