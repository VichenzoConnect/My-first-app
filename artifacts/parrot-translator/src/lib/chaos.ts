export const generateChaosResponse = (input: string): string => {
  const text = input.toLowerCase();
  
  if (text.includes('lost') || text.includes('trade')) return "BRO GOT SENT TO THE SHADOW REALM 📉🦜";
  if (text.includes('broke') || text.includes('money')) return "Wallet currently on life support. 💀🦜";
  if (text.includes('angry') || text.includes('mad')) return "Parrot recommends touching grass immediately. 🌿🦜";
  if (text.includes('failed') || text.includes('fail')) return "Already in Bermuda Triangle 😭🦜";
  if (text.includes('mess') || text.includes('mistake')) return "BRO IS ALREADY IN BERMUDA TRIANGLE. RECOVERY MISSION FAILED 💀🦜";
  if (text.includes('confused') || text.includes('what')) return "Mental GPS disconnected. Destination: Bermuda Triangle. 🧭🦜";
  if (text.includes('love') || text.includes('like')) return "Aww! Parrot senses good vibes! ❤️🦜";
  if (text.includes('hello') || text.includes('hi ')) return "SQUAWK! Who awakens the ancient one?! 🦜💥";
  
  const randomResponses = [
    "SQUAWK! That's what she said! 🦜",
    "Instructions unclear, parrot ate a cracker. 🍘",
    "Error 404: Translation lost in the sauce. 🦜",
    "Did you really just type that? SQUAWK! 🤨",
    "Parrot is judging your grammar. 🧐🦜"
  ];
  
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
};
