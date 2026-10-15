import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SF_LAT = 37.7749;
const SF_LNG = -122.4194;

async function main() {
  console.log('Clearing database...');
  await prisma.shiftClaimLog.deleteMany({});
  await prisma.shiftForward.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.noShowFlag.deleteMany({});
  await prisma.fraudFlag.deleteMany({});
  await prisma.favoriteWorker.deleteMany({});
  await prisma.shiftTemplate.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.admin.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Seeding Businesses...');
  const businesses = [
    { name: 'Blue Bottle Coffee', email: 'bluebottle@shiftrush.test', lat: SF_LAT + 0.002, lng: SF_LNG - 0.001, referralCode: 'BLUEB100' },
    { name: 'Soma Warehouse Logistics', email: 'somawarehouse@shiftrush.test', lat: SF_LAT - 0.008, lng: SF_LNG + 0.005, referralCode: 'SOMA500' },
    { name: 'Market Street Retail', email: 'marketretail@shiftrush.test', lat: SF_LAT + 0.005, lng: SF_LNG - 0.003, referralCode: 'MARKET15' }
  ];

  const dbBizs: any[] = [];
  for (const b of businesses) {
    const biz = await prisma.business.create({
      data: {
        name: b.name,
        email: b.email,
        passwordHash,
        latitude: b.lat,
        longitude: b.lng,
        referralCode: b.referralCode
      }
    });
    dbBizs.push(biz);
  }

  // Seed some Templates for the first business
  await prisma.shiftTemplate.create({
    data: {
      businessId: dbBizs[0].id,
      name: 'Standard Morning Barista Coverage',
      role: 'Espresso Barista',
      requiredSkills: JSON.stringify(['barista', 'food_handler']),
      payRate: 23.5,
      urgencyLevel: 'normal'
    }
  });
  await prisma.shiftTemplate.create({
    data: {
      businessId: dbBizs[0].id,
      name: 'Urgent Weekend Barista Rush',
      role: 'Lead Barista',
      requiredSkills: JSON.stringify(['barista']),
      payRate: 28.0,
      urgencyLevel: 'high'
    }
  });

  console.log('Seeding Workers...');
  const skillsList = [
    ['barista', 'food_handler'],
    ['warehouse', 'forklift'],
    ['retail'],
    ['barista'],
    ['food_handler']
  ];

  const dbWorkers: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const name = `Worker ${i}`;
    const email = `worker${i}@shiftrush.test`;
    const lat = SF_LAT + (Math.random() - 0.5) * 0.02;
    const lng = SF_LNG + (Math.random() - 0.5) * 0.02;
    const skills = skillsList[i % skillsList.length];

    const calendar = [
      { day: 'Monday', slots: ['Morning', 'Afternoon'] },
      { day: 'Wednesday', slots: ['Morning'] },
      { day: 'Friday', slots: ['Night'] }
    ];

    const achievementsList = i % 3 === 0 
      ? ['EARLY_BIRD', 'SHIFT_CHAMPION'] 
      : ['EARLY_BIRD'];

    const worker = await prisma.worker.create({
      data: {
        name,
        email,
        passwordHash,
        skills: JSON.stringify(skills),
        hourlyRateMin: 18 + (i % 5),
        hourlyRateMax: 25 + (i % 7),
        isAvailable: true,
        reliabilityScore: 85 + (i % 16),
        latitude: lat,
        longitude: lng,
        verifiedBadges: JSON.stringify(['food_handler']),
        availabilitySlots: JSON.stringify(calendar),
        achievements: JSON.stringify(achievementsList),
        referralCode: `WORKER_${i}_REF`,
        referredById: i === 2 ? 'WORKER_1_REF' : ''
      }
    });
    dbWorkers.push(worker);
  }

  // Create some favorite worker mappings
  await prisma.favoriteWorker.create({
    data: {
      businessId: dbBizs[0].id,
      workerId: dbWorkers[0].id
    }
  });
  await prisma.favoriteWorker.create({
    data: {
      businessId: dbBizs[0].id,
      workerId: dbWorkers[3].id
    }
  });

  // Seed Fraud Flags
  await prisma.fraudFlag.create({
    data: {
      targetId: dbWorkers[1].id,
      targetType: 'worker',
      reason: 'Frequent cancellation spikes (3 cancelled claims in 48 hours)',
      severity: 'high',
      resolved: false
    }
  });

  await prisma.fraudFlag.create({
    data: {
      targetId: dbWorkers[2].id,
      targetType: 'worker',
      reason: 'Suspicious device telemetry shifting coordinates across locations',
      severity: 'medium',
      resolved: false
    }
  });

  console.log('Seeding Admin...');
  const systemAdmin = await prisma.admin.create({
    data: {
      name: 'System Admin',
      email: 'admin@shiftrush.com',
      passwordHash
    }
  });

  console.log('Seeding Waitlists, Roadmaps, Feedbacks, and Changelogs...');
  await prisma.waitlist.createMany({
    data: [
      { email: 'innovator@future.io', role: 'business' },
      { email: 'flexworker@gig.co', role: 'worker' },
      { email: 'fastrecruit@speedy.net', role: 'business' }
    ]
  });

  const feedback1 = await prisma.feedback.create({
    data: {
      title: 'Add Instant Bank Cashouts via Debit Cards',
      content: 'Workers want to receive their payouts in 1-2 minutes instead of standard ACH transfers.',
      category: 'payouts',
      votes: 12
    }
  });

  const feedback2 = await prisma.feedback.create({
    data: {
      title: 'Integrate Live Route Directions with Google Maps',
      content: 'Allow workers to tap on a shift address and immediately open Google Maps navigation.',
      category: 'ux',
      votes: 8
    }
  });

  await prisma.vote.createMany({
    data: [
      { feedbackId: feedback1.id, userId: dbWorkers[0].id },
      { feedbackId: feedback1.id, userId: dbWorkers[1].id },
      { feedbackId: feedback2.id, userId: dbWorkers[2].id }
    ]
  });

  await prisma.roadmapItem.createMany({
    data: [
      { title: 'AI-Powered Smart Match Matching Engine', description: 'Automatically pair best suited workers based on reliability, location, and speed.', status: 'in_progress' },
      { title: 'Stripe Connect Express Payouts Integration', description: 'Enable instantaneous direct payout flows and dashboard transaction audits.', status: 'released' },
      { title: 'Shift Swap Protocol for Worker Teams', description: 'Give workers the ability to forward and delegate shifts to colleagues within their networks.', status: 'backlog' }
    ]
  });

  await prisma.changelog.createMany({
    data: [
      { version: 'v1.4.0', title: 'Next-Gen Startup Infrastructure', description: 'Shipped dynamic availability calendar grids, interactive Linear roadmap logs, command palettes (Ctrl+K), and localized geo-fenced coordinates.' },
      { version: 'v1.3.0', title: 'Reliability Scoring & Fraud Shield', description: 'Launched automatic mathematical scoring algorithms, attendance checks, and real-time operational risk dashboard grids.' }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

