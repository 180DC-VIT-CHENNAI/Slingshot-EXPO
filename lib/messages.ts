export const HIT_MESSAGES = [
  "180DC just gained another consultant! 🎯",
  "That 0 landed harder than our market analysis! 📊",
  "Client approved. You're hired. 💼",
  "The strategy worked... for once. 😎",
  "Board meeting adjourned. You crushed it. 🏆",
  "Our consultants can't aim this well. Legend. 🔥",
  "Case closed. You're the verdict. ⚖️",
  "That was smoother than our pitch decks. 💎",
  "Presentation delivered. Standing ovation. 👏",
  "The partner is impressed. Very impressed. 🧐",
  "You just optimized our ROI by 200%. 📈",
  "Problem solved. Data verified. Hero confirmed. 🦸",
  "180DC officially adopts you. Welcome aboard. 🚀",
  "That 0 hit harder than deadline pressure. ⏰",
  "Meeting successful. You're the keynote speaker now. 🎤",
  "Framework applied. Results: SPECTACULAR. ✨",
  "Business saved. By a random person with a slingshot. 🎪",
  "Recommendation accepted: You should join 180DC. 🤝",
  "Stakeholders are literally clapping right now. 👐",
  "Innovation delivered. You ARE the innovation. 🧠",
]

export const MISS_MESSAGES = [
  "That 0 has commitment issues. Try again! 😂",
  "Close! Our consultants miss targets too sometimes. 🤷",
  "The 0 went on a vacation. Bring it back! ✈️",
  "Not even our interns miss this badly. Reload! 🔄",
  "That was... creative. Let's call it 'lateral thinking'. 🧩",
  "Our CEO just felt that miss through the matrix. 😬",
  "The 0 is filing a complaint for bad aim. 📝",
  "Even our PowerPoint transitions are smoother than that. 💀",
  "Bold strategy. Let's see if it pays off. Try again! 🎲",
  "That 0 is now in a different postcode. Come on! 🏘️",
  "180DC's stock just dipped because of that miss. 📉",
  "Our analysts predicted a 0% chance of that landing. 📊",
  "The client saw that. They're not happy. 😅",
  "That aim needs... let's say 'more research'. 🔬",
  "Plot twist: The 0 was actually aiming for the sky. 🌤️",
  "Consulting tip: Always aim twice. 🔁",
  "That trajectory had... personality. Not accuracy. Personality. 🎭",
  "Even our worst intern is shaking their head. 🙈",
  "The 0 just filed for independence. It's gone. 🕊️",
  "Data suggests: you need exactly one more try. Trust us. 📋",
]

export function getRandomHitMessage(): string {
  return HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)]
}

export function getRandomMissMessage(): string {
  return MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)]
}
