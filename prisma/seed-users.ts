import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
  console.log('👤 Creating a large and diverse user base...');
  const allUsers: User[] = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Predictable Admin & Demo Users
  const adminUser = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@example.com', role: UserRole.SUPER_ADMIN } });
  const demoUser = await prisma.user.create({ data: { name: 'Demo User', email: 'demo@everesthood.com' } });
  allUsers.push(adminUser, demoUser);

  // Predictable Test Users
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
      },
    });
    allUsers.push(user);
  }

  // Ambassadors
  const ambassador1 = await prisma.user.create({ data: { name: 'Ambassador Alice', email: 'alice@example.com' } });
  const ambassador2 = await prisma.user.create({ data: { name: 'Ambassador Bob', email: 'bob@example.com' } });
  allUsers.push(ambassador1, ambassador2);

  // Randomly generated users
  const randomUserCount = 100;
  for (let i = 0; i < randomUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email({ provider: 'fake-domain.com' }),
        xp: faker.number.int({ min: 0, max: 10000 }),
      },
    });
    allUsers.push(user);
  }
  
  console.log(`✅ Created a total of ${allUsers.length} users.`);
  return allUsers;
} 