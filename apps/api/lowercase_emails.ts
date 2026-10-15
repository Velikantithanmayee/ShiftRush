import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting email normalization...');

  // 1. Workers
  const workers = await prisma.worker.findMany();
  for (const w of workers) {
    const lowerEmail = w.email.toLowerCase().trim();
    if (w.email !== lowerEmail) {
      console.log(`Updating Worker ${w.id}: ${w.email} -> ${lowerEmail}`);
      await prisma.worker.update({
        where: { id: w.id },
        data: { email: lowerEmail }
      });
    }
  }

  // 2. Businesses
  const businesses = await prisma.business.findMany();
  for (const b of businesses) {
    const lowerEmail = b.email.toLowerCase().trim();
    if (b.email !== lowerEmail) {
      console.log(`Updating Business ${b.id}: ${b.email} -> ${lowerEmail}`);
      await prisma.business.update({
        where: { id: b.id },
        data: { email: lowerEmail }
      });
    }
  }

  // 3. Admins
  const admins = await prisma.admin.findMany();
  for (const a of admins) {
    const lowerEmail = a.email.toLowerCase().trim();
    if (a.email !== lowerEmail) {
      console.log(`Updating Admin ${a.id}: ${a.email} -> ${lowerEmail}`);
      await prisma.admin.update({
        where: { id: a.id },
        data: { email: lowerEmail }
      });
    }
  }

  // 4. Waitlist
  const waitlist = await prisma.waitlist.findMany();
  for (const wl of waitlist) {
    const lowerEmail = wl.email.toLowerCase().trim();
    if (wl.email !== lowerEmail) {
      console.log(`Updating Waitlist ${wl.id}: ${wl.email} -> ${lowerEmail}`);
      await prisma.waitlist.update({
        where: { id: wl.id },
        data: { email: lowerEmail }
      });
    }
  }

  console.log('Email normalization completed!');
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
