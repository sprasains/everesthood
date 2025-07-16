export const MOTIVATIONAL_MESSAGES = [
  "You're doing amazing! Keep it up!",
  "Every small step counts!",
  "Digital freedom is within reach!",
  "Stay strong, you're building a better habit!",
  "One day at a time!",
  "Your mind will thank you!",
  "You're on a roll!",
];

export function getRandomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
} 