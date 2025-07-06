import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const demoUsers = [
  {
    name: "Ava Drip",
    email: "ava@zenz.com",
    password: "dripfire123",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Noah Bet",
    email: "noah@zenz.com",
    password: "betbetbet",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Mia GlowUp",
    email: "mia@zenz.com",
    password: "glowup!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

async function main() {
  for (const user of demoUsers) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashed,
        image: user.image,
      },
    });
  }
  console.log("Seeded Gen-Z demo users with valid credentials.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
