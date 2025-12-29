const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'ops_schema_draft' }
  });
  console.log(JSON.stringify(setting, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
