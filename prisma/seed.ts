import { PrismaClient, UserRole, EngineerStatus, Availability, ServiceMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Service Categories
  const routingCat = await prisma.serviceCategory.upsert({
    where: { slug: 'routing-switching' },
    update: {},
    create: {
      name: 'Routing & Switching',
      slug: 'routing-switching',
    },
  });

  const wirelessCat = await prisma.serviceCategory.upsert({
    where: { slug: 'wireless-access' },
    update: {},
    create: {
      name: 'Wireless & Access Networks',
      slug: 'wireless-access',
    },
  });

  const securityCat = await prisma.serviceCategory.upsert({
    where: { slug: 'network-security' },
    update: {},
    create: {
      name: 'Network Security & Firewalls',
      slug: 'network-security',
    },
  });

  const physicalCat = await prisma.serviceCategory.upsert({
    where: { slug: 'infrastructure-cabling' },
    update: {},
    create: {
      name: 'Infrastructure & Cabling',
      slug: 'infrastructure-cabling',
    },
  });

  // 2. Skills
  const skillsData = [
    { code: 'BGP', name: 'BGP Routing', category: 'Routing' },
    { code: 'OSPF', name: 'OSPF Configuration', category: 'Routing' },
    { code: 'VLAN', name: 'VLAN & Layer 2/3 Switching', category: 'Switching' },
    { code: 'FIREWALL', name: 'Fortinet / Cisco / Sophos Firewall', category: 'Security' },
    { code: 'WIFI', name: 'Enterprise Wi-Fi & AP Deployment', category: 'Wireless' },
    { code: 'OFC', name: 'Fiber Optics & Splicing', category: 'Cabling' },
    { code: 'CCTV', name: 'IP CCTV & NVR Configuration', category: 'Surveillance' },
    { code: 'AUDIT', name: 'Network Architecture Audit', category: 'Consulting' },
  ];

  const createdSkills: Record<string, string> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
    createdSkills[s.code] = skill.id;
  }

  // 3. Services
  const servicesData = [
    {
      title: 'BGP configuration',
      description: 'Border Gateway Protocol peering, multi-homing, and route optimization.',
      categoryId: routingCat.id,
      basePrice: 4500,
      mode: ServiceMode.REMOTE,
      requiredSkillCodes: ['BGP'],
    },
    {
      title: 'OSPF configuration',
      description: 'Internal gateway protocol area planning and redistribution.',
      categoryId: routingCat.id,
      basePrice: 3000,
      mode: ServiceMode.REMOTE,
      requiredSkillCodes: ['OSPF'],
    },
    {
      title: 'VLAN / switching',
      description: 'Layer 2/3 trunking, inter-VLAN routing, and STP setup.',
      categoryId: routingCat.id,
      basePrice: 2500,
      mode: ServiceMode.BOTH,
      requiredSkillCodes: ['VLAN'],
    },
    {
      title: 'Firewall configuration',
      description: 'NAT policies, VPN tunnels, and security rule lockdown.',
      categoryId: securityCat.id,
      basePrice: 4000,
      mode: ServiceMode.BOTH,
      requiredSkillCodes: ['FIREWALL'],
    },
    {
      title: 'Wi-Fi installation',
      description: 'Access point positioning, SSID configuration, and coverage tuning.',
      categoryId: wirelessCat.id,
      basePrice: 2000,
      mode: ServiceMode.ONSITE,
      requiredSkillCodes: ['WIFI'],
    },
    {
      title: 'Fiber / OFC troubleshooting',
      description: 'Optical power loss testing, OTDR fault locating, and fusion splicing.',
      categoryId: physicalCat.id,
      basePrice: 3500,
      mode: ServiceMode.ONSITE,
      requiredSkillCodes: ['OFC'],
    },
    {
      title: 'CCTV installation',
      description: 'IP camera deployment, POE switch setup, and NVR storage configuration.',
      categoryId: physicalCat.id,
      basePrice: 2500,
      mode: ServiceMode.ONSITE,
      requiredSkillCodes: ['CCTV'],
    },
    {
      title: 'Network audit',
      description: 'Complete infrastructure discovery, topology mapping, and vulnerability assessment.',
      categoryId: routingCat.id,
      basePrice: 6000,
      mode: ServiceMode.BOTH,
      requiredSkillCodes: ['AUDIT'],
    },
  ];

  for (const s of servicesData) {
    const { requiredSkillCodes, ...serviceFields } = s;
    const existing = await prisma.service.findFirst({ where: { title: s.title } });
    const service = existing || await prisma.service.create({ data: serviceFields });

    for (const code of requiredSkillCodes) {
      const skillId = createdSkills[code];
      if (skillId) {
        await prisma.serviceSkill.upsert({
          where: { serviceId_skillId: { serviceId: service.id, skillId } },
          update: {},
          create: { serviceId: service.id, skillId, minimumProficiency: 3, required: true },
        });
      }
    }
  }

  // 4. Test Customer User
  const customer = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      name: 'Enterprise Client',
      phone: '+919876543210',
      email: 'client@nexuscreative.in',
      role: UserRole.CUSTOMER,
      customer: {
        create: {
          companyName: 'Nexus Creative Labs',
          defaultAddress: 'Anna Nagar, Chennai, Tamil Nadu',
          latitude: 13.0850,
          longitude: 80.2100,
        },
      },
    },
  });

  // 5. Test Verified Engineer
  const engineerUser = await prisma.user.upsert({
    where: { phone: '+919840012345' },
    update: {},
    create: {
      name: 'Karthik Raman (Senior Network Engineer)',
      phone: '+919840012345',
      email: 'karthik.network@nexuscreative.in',
      role: UserRole.ENGINEER,
      engineer: {
        create: {
          bio: '10+ years Cisco CCNP & Mikrotik certified network specialist.',
          city: 'Chennai',
          serviceRadiusKm: 25,
          latitude: 13.0827,
          longitude: 80.2707,
          status: EngineerStatus.VERIFIED,
          availability: Availability.ONLINE,
          experienceYears: 10,
          rating: 4.9,
          completedJobs: 142,
          baseVisitFee: 500,
          verifiedAt: new Date(),
        },
      },
    },
    include: { engineer: true },
  });

  if (engineerUser.engineer) {
    for (const code of Object.keys(createdSkills)) {
      await prisma.engineerSkill.upsert({
        where: {
          engineerId_skillId: {
            engineerId: engineerUser.engineer.id,
            skillId: createdSkills[code],
          },
        },
        update: {},
        create: {
          engineerId: engineerUser.engineer.id,
          skillId: createdSkills[code],
          proficiency: 5,
          verified: true,
          yearsExperience: 8,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
  console.log(`Customer ID: ${customer.id}`);
  console.log(`Engineer ID: ${engineerUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
