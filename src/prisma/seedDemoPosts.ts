import { prisma } from "../src/lib/prisma";

const demoPosts = [
  {
    title: "Glow Up IRL: My Drip Hits Different!",
    content:
      "Fam, this glow up is fire. No cap, my drip is bussin' and the vibe check is valid. TFW you slay the day!",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
  {
    title: "Bet! This Snack's Drip is GOAT",
    content:
      "Sheesh, fam! This snack is sending me. Slaps harder than a bop, and the mood is lit. WYWH!",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  },
  {
    title: "FOMO? Take Several Seats, It's Extra Here",
    content:
      "Vibing with the squad, sipping tea. If you know, you know (IYKYK). Periodt.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    title: "No Cap, This Bop is Bussin'!",
    content:
      "This playlist is a whole mood. Dead from laughing, CSL. Dank vibes only, fam.",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  },
  {
    title: "Main Character Energy: Flex or Nah?",
    content:
      "Locked in, looksmaxxing, and mogging the haters. It's giving main character. JK, but not really.",
    image: "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  },
  {
    title: "Woke Up, Chose Vibe Check",
    content:
      "Pressed? Take several seats. This is a safe space for the woke and the valid. Lore incoming.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  },
  {
    title: "Ship or Simp? The Situationship Saga",
    content:
      "Lowkey shipping, highkey simping. This situationship is mid but the tea is hot. I Oop!",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  },
  {
    title: "Snack Alert: This Clapback is Fire!",
    content:
      "Clapback game strong, salty haters ghosted. It's giving snack, not a pick-me. Periodt.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  },
  {
    title: "TFW Your Guap is Valid",
    content:
      "Guap up, flex on the mid. Bussin' deals only, no Ls here. Ratio the haters!",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  },
  {
    title: "Slay the Day, Stay Woke",
    content:
      "Glow up, slay, and stay woke. It's giving GOAT energy. Vibe check: passed!",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
];

async function main() {
  // Find a user to assign as author
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found. Please create a user first.");

  for (const post of demoPosts) {
    await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        authorId: user.id,
        metadata: { image: post.image },
      },
    });
  }
  console.log("Seeded Gen-Z demo posts.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
