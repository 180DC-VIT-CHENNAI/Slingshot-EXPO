export const HIT_MESSAGES = [
  "Identity restored! The logo is free! 🎯",
  "Bullseye! That rope never stood a chance! 🏹",
  "The cover is off — 180DC revealed! 🔥",
  "Perfect shot! The logo shines again! ✨",
  "Rope snapped, cover dropped, logo revealed! 💥",
  "180DC just got dramatically unveiled! 🎭",
  "That arrow had perfect aim! Logo liberated! 🎯",
  "The reveal was worth the wait! Welcome aboard! 🚀",
  "Cover falls, logo rises! You're hired! 💼",
  "Clients impressed, consultants amazed! 📊",
  "Stakeholders are literally clapping right now! 👏",
  "The strategy worked perfectly! Case closed! ⚖️",
  "Meeting adjourned. You crushed the reveal! 🏆",
  "Board meeting successful! Logo revealed! 🧐",
  "ROI optimized by 200%! Logo uncovered! 📈",
  "Problem solved, identity restored! 🦸",
  "Framework applied. Reveal: SPECTACULAR! ✨",
  "Business saved by a slingshot arrow! 🎪",
  "Recommendation: You should join 180DC! 🤝",
  "Innovation delivered. You ARE the innovation! 🧠",
]

export const MISS_MESSAGES = [
  "Still covered. Aim for the glowing release board and try again.",
  "Close! Our consultants miss targets too sometimes. 🤷",
  "The release is still holding. Adjust your arc and try again! ✈️",
  "Not even our interns miss this badly. Reload! 🔄",
  "That was... creative. Let's call it 'lateral thinking'. 🧩",
  "Our CEO just felt that miss through the matrix. 😬",
  "The release board is filing a complaint about that aim. 📝",
  "Even our PowerPoint transitions are smoother than that. 💀",
  "Bold strategy. Let's see if it pays off. Try again! 🎲",
  "That arrow is now in a different postcode. Come on! 🏘️",
  "180DC's stock just dipped because of that miss. 📉",
  "Our analysts predicted a 0% chance of that landing. 📊",
  "The client saw that. They're not happy. 😅",
  "That aim needs... let's say 'more research'. 🔬",
  "Plot twist: the arrow was actually aiming for the sky. 🌤️",
  "Consulting tip: Always aim twice. 🔁",
  "That trajectory had... personality. Not accuracy. Personality. 🎭",
  "Even our worst intern is shaking their head. 🙈",
  "That arrow just filed for independence. It's gone. 🕊️",
  "Data suggests: you need exactly one more try. Trust us. 📋",
]

export function getRandomHitMessage(): string {
  return HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)]
}

export function getRandomMissMessage(): string {
  return MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]
}
