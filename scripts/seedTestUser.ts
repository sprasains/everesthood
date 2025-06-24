import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function seedTestUser() {
  const email = "testuser@everhood.ai";
  const password = "TestPass123!";
  const name = "Test User";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Test user already exists. Skipping creation.");
    return;
  }

  const testUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      subscriptionStatus: "free",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day trial
    },
  });

  console.log(`Test user created: ${testUser.email} with ID: ${testUser.id}`);
  console.log(`Login with email: ${email} and password: ${password}`);
}

seedTestUser()
  .catch((e) => {
    console.error("Error seeding test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
