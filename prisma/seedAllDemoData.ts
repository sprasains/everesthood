import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

// 20 Gen-Z users with bios and avatars
const demoUsers = [
  { name: "Ava Drip", email: "ava@zenz.com", password: "dripfire123", image: "https://randomuser.me/api/portraits/women/65.jpg", bio: "Glow up queen. No cap." },
  { name: "Noah Bet", email: "noah@zenz.com", password: "betbetbet", image: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Bet. Always vibing." },
  { name: "Mia GlowUp", email: "mia@zenz.com", password: "glowup!", image: "https://randomuser.me/api/portraits/women/44.jpg", bio: "Slaying 24/7. Periodt." },
  { name: "Liam Vibe", email: "liam@zenz.com", password: "vibecheck", image: "https://randomuser.me/api/portraits/men/45.jpg", bio: "Main character energy." },
  { name: "Ella Snack", email: "ella@zenz.com", password: "snacktime", image: "https://randomuser.me/api/portraits/women/68.jpg", bio: "Snack alert. WYWH!" },
  { name: "Mason Flex", email: "mason@zenz.com", password: "flexonem", image: "https://randomuser.me/api/portraits/men/36.jpg", bio: "Flex or nah?" },
  { name: "Sophia Lore", email: "sophia@zenz.com", password: "lorequeen", image: "https://randomuser.me/api/portraits/women/50.jpg", bio: "Dropping lore daily." },
  { name: "Jackson Ship", email: "jackson@zenz.com", password: "shipit", image: "https://randomuser.me/api/portraits/men/60.jpg", bio: "Ship or simp?" },
  { name: "Olivia FOMO", email: "olivia@zenz.com", password: "fomofree", image: "https://randomuser.me/api/portraits/women/70.jpg", bio: "No FOMO here." },
  { name: "Aiden Dank", email: "aiden@zenz.com", password: "dankmemes", image: "https://randomuser.me/api/portraits/men/55.jpg", bio: "Dank vibes only." },
  { name: "Zoe Slay", email: "zoe@zenz.com", password: "slayallday", image: "https://randomuser.me/api/portraits/women/80.jpg", bio: "Slay the day." },
  { name: "Lucas Ratio", email: "lucas@zenz.com", password: "ratioed", image: "https://randomuser.me/api/portraits/men/70.jpg", bio: "Ratio the haters." },
  { name: "Chloe Tea", email: "chloe@zenz.com", password: "spillthetea", image: "https://randomuser.me/api/portraits/women/90.jpg", bio: "Sipping tea." },
  { name: "Ethan Guap", email: "ethan@zenz.com", password: "guapup", image: "https://randomuser.me/api/portraits/men/80.jpg", bio: "Guap up, no Ls." },
  { name: "Lily Main", email: "lily@zenz.com", password: "mainenergy", image: "https://randomuser.me/api/portraits/women/95.jpg", bio: "Main character, always." },
  { name: "Carter Simp", email: "carter@zenz.com", password: "simping", image: "https://randomuser.me/api/portraits/men/90.jpg", bio: "Lowkey simping." },
  { name: "Grace Extra", email: "grace@zenz.com", password: "extraaf", image: "https://randomuser.me/api/portraits/women/99.jpg", bio: "Extra is my vibe." },
  { name: "Logan Lore", email: "logan@zenz.com", password: "lorelord", image: "https://randomuser.me/api/portraits/men/99.jpg", bio: "Dropping lore." },
  { name: "Harper Snack", email: "harper@zenz.com", password: "snackqueen", image: "https://randomuser.me/api/portraits/women/77.jpg", bio: "Snack game strong." },
  { name: "Benjamin Bussin", email: "benjamin@zenz.com", password: "bussinbussin", image: "https://randomuser.me/api/portraits/men/77.jpg", bio: "It's bussin'!" },
];

const demoPosts = [
  "Glow Up IRL: My Drip Hits Different!",
  "Bet! This Snack's Drip is GOAT",
  "FOMO? Take Several Seats, It's Extra Here",
  "No Cap, This Bop is Bussin'!",
  "Main Character Energy: Flex or Nah?",
  "Woke Up, Chose Vibe Check",
  "Ship or Simp? The Situationship Saga",
  "Snack Alert: This Clapback is Fire!",
  "TFW Your Guap is Valid",
  "Slay the Day, Stay Woke",
  "Ratio the Haters, Flex the Wins",
  "Lore Drop: The Secret Tea",
  "Snack Attack: WYWH!",
  "Vibe Check Passed!",
  "Flex Friday: No Ls Allowed",
  "Main Character Moves Only",
  "Extra AF, Always On",
  "Guap Up, Stay Winning",
  "Simping? JK (Not Really)",
  "Snack Queen Energy",
  "Dank Vibes, Danker Memes",
  "Tea Spilled, Drama Killed",
  "Glow Up, Show Up",
  "Bet Bet Bet!",
  "No Cap, All Facts",
  "Slay Mode: Activated",
  "Snack Game: Unmatched",
  "Ship It or Skip It?",
  "Lore Incoming...",
  "FOMO? Not Here!",
  "Flexed and Blessed",
  "Main Energy, Main Wins",
  "Clapback Season",
  "Guap Goals",
  "Ratioed in Real Life",
  "Tea Time, All the Time",
  "Extra, But Make It Fashion",
  "Bussin' Beats Only",
  "Snack Attack 2.0",
  "Glow Up: Level 100",
  "Bet on Me",
  "No Ls, Just Ws",
  "Slay the Haters",
  "Main Character, Main Feed",
  "Flex Flex Flex!",
  "Lore Drop: The Remix",
  "Snack Queen Returns",
  "Guap Up Challenge",
  "Ratio the Algorithm",
  "Tea Party: Invite Only",
  "Extra AF Finale",
];

const demoContent = [
  "Fam, this glow up is fire. No cap, my drip is bussin' and the vibe check is valid. TFW you slay the day!",
  "Sheesh, fam! This snack is sending me. Slaps harder than a bop, and the mood is lit. WYWH!",
  "Vibing with the squad, sipping tea. If you know, you know (IYKYK). Periodt.",
  "This playlist is a whole mood. Dead from laughing, CSL. Dank vibes only, fam.",
  "Locked in, looksmaxxing, and mogging the haters. It's giving main character. JK, but not really.",
  "Pressed? Take several seats. This is a safe space for the woke and the valid. Lore incoming.",
  "Lowkey shipping, highkey simping. This situationship is mid but the tea is hot. I Oop!",
  "Clapback game strong, salty haters ghosted. It's giving snack, not a pick-me. Periodt.",
  "Guap up, flex on the mid. Bussin' deals only, no Ls here. Ratio the haters!",
  "Glow up, slay, and stay woke. It's giving GOAT energy. Vibe check: passed!",
  "Ratioed the haters, flexed the wins. Main energy only.",
  "Lore drop: The secret tea is out. WYWH!",
  "Snack attack! This one's for the squad. No crumbs left.",
  "Vibe check: 100/100. Dank memes, danker friends.",
  "Flex Friday: No Ls allowed, only Ws.",
  "Main character moves only. The rest? Background noise.",
  "Extra AF, always on. It's giving main feed.",
  "Guap up, stay winning. No cap, all facts.",
  "Simping? JK (not really). Lore incoming...",
  "Snack queen energy. WYWH!",
  "Dank vibes, danker memes. Meme lord status unlocked.",
  "Tea spilled, drama killed. Peace out, haters.",
  "Glow up, show up, never slow up.",
  "Bet bet bet! This one's for the squad.",
  "No cap, all facts. The receipts are in.",
  "Slay mode: activated. Main feed, main flex.",
  "Snack game: unmatched. No crumbs left.",
  "Ship it or skip it? The tea is hot.",
  "Lore incoming... Stay tuned.",
  "FOMO? Not here! Main squad only.",
  "Flexed and blessed. Main energy.",
  "Main energy, main wins. The rest? Mid.",
  "Clapback season. Haters ghosted.",
  "Guap goals. No Ls, just Ws.",
  "Ratioed in real life. The algorithm can't keep up.",
  "Tea time, all the time. Sip sip hooray!",
  "Extra, but make it fashion. Werk!",
  "Bussin' beats only. Playlist is fire.",
  "Snack attack 2.0. WYWH!",
  "Glow up: level 100. Main feed unlocked.",
  "Bet on me. The odds are in my favor.",
  "No Ls, just Ws. Main flex.",
  "Slay the haters. Main character energy.",
  "Main character, main feed. The rest? Background.",
  "Flex flex flex! No cap, all facts.",
  "Lore drop: the remix. Stay tuned.",
  "Snack queen returns. WYWH!",
  "Guap up challenge. Main squad only.",
  "Ratio the algorithm. Flex the feed.",
  "Tea party: invite only. Main squad.",
  "Extra AF finale. Main feed, main flex.",
];

const demoImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1444065381814-865dc9da92c0",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
];

async function main() {
  // Seed users
  const userIds: string[] = [];
  for (const user of demoUsers) {
    const hashed = await bcrypt.hash(user.password, 10);
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashed,
        image: user.image,
        bio: user.bio,
      },
    });
    userIds.push(dbUser.id);
  }

  // Main test user follows 7 others (not everyone)
  const mainUserId = userIds[0];
  for (let i = 1; i <= 7; i++) {
    await prisma.friendship.upsert({
      where: { requesterId_receiverId: { requesterId: mainUserId, receiverId: userIds[i] } },
      update: {},
      create: { requesterId: mainUserId, receiverId: userIds[i], status: "ACCEPTED" },
    });
    await prisma.friendship.upsert({
      where: { requesterId_receiverId: { requesterId: userIds[i], receiverId: mainUserId } },
      update: {},
      create: { requesterId: userIds[i], receiverId: mainUserId, status: "ACCEPTED" },
    });
  }

  // Seed posts (50+), distributed among users
  let postIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const authorIdx = i % userIds.length;
    const post = await prisma.post.create({
      data: {
        title: demoPosts[i % demoPosts.length],
        content: demoContent[i % demoContent.length],
        authorId: userIds[authorIdx],
        metadata: { image: demoImages[i % demoImages.length] },
      },
    });
    postIds.push(post.id);
  }

  // Add likes to make some posts popular
  for (let i = 0; i < postIds.length; i++) {
    // First 10 posts get 10 likes each, next 10 get 5, rest get 1-3
    let likeCount = i < 10 ? 10 : i < 20 ? 5 : Math.floor(Math.random() * 3) + 1;
    const shuffled = [...userIds].sort(() => 0.5 - Math.random());
    for (let j = 0; j < likeCount; j++) {
      await prisma.like.upsert({
        where: { userId_postId: { userId: shuffled[j], postId: postIds[i] } },
        update: {},
        create: { userId: shuffled[j], postId: postIds[i] },
      });
    }
    // Update likeCount on post
    await prisma.post.update({ where: { id: postIds[i] }, data: { likeCount } });
  }

  console.log("Seeded 20 users, 50+ posts, realistic follows, and likes for a vibrant Gen-Z feed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
