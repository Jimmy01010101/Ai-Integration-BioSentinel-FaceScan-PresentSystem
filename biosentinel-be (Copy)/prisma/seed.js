const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  const hashedPassword =
    await bcrypt.hash('superadmin123', 10);

  const existingSuperAdmin =
    await prisma.superAdmin.findFirst({
      where: {
        username: 'superadmin'
      }
    });

  if (!existingSuperAdmin) {

    await prisma.superAdmin.create({
      data: {
        username: 'superadmin',
        password: hashedPassword,
        fullName: 'Super Admin'
      }
    });

    console.log('✅ Super Admin created');

  } else {

    console.log('⚠️ Super Admin already exists');

  }

}

main()
  .catch((e) => {

    console.error(e);

    process.exit(1);

  })
  .finally(async () => {

    await prisma.$disconnect();

  }); 