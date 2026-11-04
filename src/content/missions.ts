export type GrowthDomain =
  | "thinking"
  | "communication"
  | "independence"
  | "movement"
  | "connection";
export const GROWTH_DOMAINS: Record<
  GrowthDomain,
  { title: string; icon: string }
> = {
  thinking: { title: "Make & discover", icon: "✦" },
  communication: { title: "Tell & explain", icon: "☏" },
  independence: { title: "Do it myself", icon: "✓" },
  movement: { title: "Move & explore", icon: "↗" },
  connection: { title: "Together", icon: "♡" },
};

export interface Activity {
  id: string;
  title: string;
  domain: GrowthDomain;
  capability: string;
  minutes: string;
  prompt: string;
  materials: string[];
  steps: [string, string, string];
  example: string;
  clue: string;
  anotherWay: string;
  reflection: string;
  parentRole: string;
  independent: string;
  safety: string;
  observe: string;
  practiceSkill?: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  interests: string[];
  activities: Activity[];
}

export const MISSIONS: Mission[] = [
  {
    id: "airport",
    title: "Run an airport",
    subtitle: "Build a runway. Help a passenger. Ready for takeoff?",
    icon: "✈",
    color: "#136f78",
    interests: ["Airplanes", "Building"],
    activities: [
      {
        id: "airport-runway",
        title: "Build & test a runway",
        domain: "thinking",
        capability: "Test and improve a design",
        minutes: "15–20",
        prompt: "Can you build a runway that fits two different toy planes?",
        materials: ["Blocks or paper", "Two toy planes, or paper plane shapes"],
        steps: [
          "Predict which plane needs more room. Build your runway.",
          "Try both planes. What fits? What gets in the way?",
          "Change one thing and test again.",
        ],
        example:
          "I could put blocks along the sides, try my widest plane, then move the blocks if its wings touch. That is one idea. Yours can be different.",
        clue: "Compare the wings. Which plane is wider?",
        anotherWay:
          "No blocks? Draw a runway on paper and use paper plane shapes.",
        reflection: "What did you change, and what happened?",
        parentRole:
          "Provide materials. Ask what he predicts, then let him test before offering a solution.",
        independent: "Choose a design, test it, and decide what to change.",
        safety:
          "Build on the floor, away from stairs. Use age-appropriate blocks; do not climb on the build.",
        observe:
          "Did he test his own idea and make a change based on what happened?",
        practiceSkill: "m.measure",
      },
      {
        id: "airport-announcement",
        title: "Make a boarding announcement",
        domain: "communication",
        capability: "Explain a plan in order",
        minutes: "5–10",
        prompt: "Your passengers need to know where to go. Can you tell them?",
        materials: [
          "A toy passenger or willing listener",
          "Paper for an optional gate sign",
        ],
        steps: [
          "Choose a destination and make up a gate number.",
          "Tell your listener where to go and what happens next.",
          "Ask your passenger what they heard. Add anything they missed.",
        ],
        example:
          "Passengers going to the Moon, come to Gate 3. First show your ticket. Then find your seat.",
        clue: "Try: where are we going, where do we meet, what happens next?",
        anotherWay:
          "Make three picture signs and point to them while you speak.",
        reflection: "What helped your passenger understand?",
        parentRole:
          "Be the passenger. Ask one genuine clarifying question without correcting every sentence.",
        independent: "Choose the words and explain the sequence.",
        safety:
          "Pretend announcements stay at home. Do not share real travel details online.",
        observe:
          "Could the listener follow the plan? Did he clarify when asked?",
        practiceSkill: "r1.sentence",
      },
      {
        id: "airport-bag",
        title: "Pack a passenger bag",
        domain: "independence",
        capability: "Pack from a checklist",
        minutes: "5–10",
        prompt:
          "A passenger is going on a pretend day trip. What should go in their bag?",
        materials: ["A small bag", "Safe everyday items", "Paper and a pencil"],
        steps: [
          "Choose three useful items and draw a checklist.",
          "Pack from your list. Check the bag yourself.",
          "Explain your choices and put everything away afterward.",
        ],
        example:
          "For a pretend park trip I might draw water, a hat, and a book. I would check each picture as I pack.",
        clue: "Think about drinking, weather, and something to do.",
        anotherWay:
          "Use three objects as your checklist, then make the picture list together.",
        reflection: "What did you remember without a reminder?",
        parentRole:
          "Agree on the pretend trip and safe items. Wait for his self-check before reminding.",
        independent: "Choose, pack, check, and put away the items.",
        safety:
          "Use a light bag; no medicine, sharp objects, or real personal documents.",
        observe: "How much help did packing and checking require?",
      },
      {
        id: "airport-movement",
        title: "Be the ground crew",
        domain: "movement",
        capability: "Follow and adapt a movement sequence",
        minutes: "5–10",
        prompt:
          "Can you guide an imaginary plane with a movement sequence of your own?",
        materials: ["Clear floor space", "Three paper markers"],
        steps: [
          "Make three ground markers and choose a movement at each.",
          "Walk your route: reach, step sideways, then balance if comfortable.",
          "Change the order. Can a grown-up follow your new route?",
        ],
        example:
          "At my first marker I reach up. At the second I take two side steps. At the third I stand still like a plane.",
        clue: "Start slowly with just two movements. Add a third when ready.",
        anotherWay:
          "Use seated arm movements, or skip any movement that does not feel comfortable.",
        reflection: "Which movement would you like to try again?",
        parentRole:
          "Clear the space, supervise, and follow his route. Let him choose a comfortable challenge.",
        independent:
          "Choose movements, remember the order, and adjust the route.",
        safety:
          "Adult supervision. Stay on the floor, away from stairs and furniture edges; no climbing or jumping from heights.",
        observe: "Could he follow his sequence and adapt it comfortably?",
      },
    ],
  },
  {
    id: "neighborhood",
    title: "Make a neighborhood",
    subtitle: "Design a place where people can help each other.",
    icon: "⌂",
    color: "#ad5836",
    interests: ["Maps", "Community"],
    activities: [
      {
        id: "neighborhood-map",
        title: "Design a tiny town",
        domain: "thinking",
        capability: "Represent a place with a map",
        minutes: "15–20",
        prompt: "What would your own tiny neighborhood need?",
        materials: [
          "Paper and crayons",
          "Blocks or toy buildings if available",
        ],
        steps: [
          "Choose three places people might need. Draw or build them.",
          "Add a path between them. Test it with a toy person.",
          "Change something to make the town easier to use.",
        ],
        example:
          "I might put a park near the homes and draw a path to a pretend shop. I would try walking a toy person along it.",
        clue: "Where could people rest, get food, or ask for help?",
        anotherWay:
          "Use three boxes as buildings and strips of paper as paths.",
        reflection: "Who would your change help?",
        parentRole: "Ask about the people who live there. Let his design lead.",
        independent: "Choose places, connect them, and test the map.",
        safety:
          "Use a pretend town. Avoid recording your home address or identifying information.",
        observe: "Did he use the map to explain how to get somewhere?",
        practiceSkill: "ss.mapread",
      },
      {
        id: "neighborhood-directions",
        title: "Help a visitor find the park",
        domain: "communication",
        capability: "Give and clarify directions",
        minutes: "5–10",
        prompt: "A visitor is lost in your tiny town. Can you guide them?",
        materials: ["Your pretend map or three household objects"],
        steps: [
          "Choose a start and a destination.",
          "Give one direction at a time while your listener moves a toy.",
          "If they get lost, try explaining in a different way.",
        ],
        example:
          "Start at the shop. Walk past the library. Stop at the park with the big tree.",
        clue: "Name a landmark that your visitor can see.",
        anotherWay: "Show the route with your finger, then describe it.",
        reflection: "How did you help when the visitor was unsure?",
        parentRole:
          "Follow the directions literally and ask for clarification kindly.",
        independent: "Explain and adapt the directions.",
        safety:
          "Use a pretend map indoors; this is not independent street-navigation practice.",
        observe: "Did he notice confusion and clarify the route?",
        practiceSkill: "ss.mapread",
      },
      {
        id: "neighborhood-together",
        title: "Invent a game together",
        domain: "connection",
        capability: "Negotiate a shared plan",
        minutes: "10–15",
        prompt:
          "Can you and another person invent a game you both want to play?",
        materials: [
          "A willing family member or friend",
          "Blocks, paper, or a soft ball",
        ],
        steps: [
          "Each person suggests one idea. Listen to both.",
          "Agree on two simple rules and try the game.",
          "Ask what each person would change. Try a shared change.",
        ],
        example:
          "I want a building game and you want a guessing game. We could build something secretly and take turns guessing.",
        clue: "Ask: what would make this fun for you too?",
        anotherWay:
          "Take turns choosing one rule each. Start with a family member if preferred.",
        reflection: "What idea did the other person add?",
        parentRole:
          "Arrange a willing partner. Model a fair compromise when needed without requiring him to be outgoing.",
        independent: "Suggest, listen, and try a shared decision.",
        safety:
          "A trusted adult supervises play with children. Participation is voluntary; stop if someone feels uncomfortable.",
        observe: "Did he listen, express a preference, and try a shared plan?",
      },
      {
        id: "neighborhood-bag",
        title: "Get ready for tomorrow",
        domain: "independence",
        capability: "Pack from a checklist",
        minutes: "5–10",
        prompt:
          "Can you prepare your bag for tomorrow using your own picture list?",
        materials: ["A bag", "School-approved items", "Paper and pencil"],
        steps: [
          "Agree with a grown-up on three things you need.",
          "Draw a checklist and pack the items yourself.",
          "Check your list and put the bag in its usual place.",
        ],
        example:
          "I draw my folder, book, and empty water bottle. After packing, I check all three pictures.",
        clue: "Look at your list instead of asking what comes next.",
        anotherWay: "Start with two items laid out nearby and build up later.",
        reflection: "Which part could you do on your own?",
        parentRole:
          "Verify required school items and do a final safety check after his own check.",
        independent: "Use the list, pack the items, and put the bag away.",
        safety: "Adult final check. Do not include medication or heavy items.",
        observe: "Did he transfer checklist packing to an everyday routine?",
      },
    ],
  },
  {
    id: "cafe",
    title: "Open a pretend café",
    subtitle: "Invent a menu. Welcome a guest. Work together.",
    icon: "☕",
    color: "#7360a3",
    interests: ["Pretend play", "Creating"],
    activities: [
      {
        id: "cafe-menu",
        title: "Invent your café menu",
        domain: "thinking",
        capability: "Create and revise for an audience",
        minutes: "10–15",
        prompt:
          "What could your imaginary café serve? Make a menu a guest can use.",
        materials: ["Paper and crayons", "Toy food or blocks if available"],
        steps: [
          "Invent three vegetarian dishes. Draw or write their names.",
          "Give the menu to a pretend guest. Ask them to order.",
          "Change one thing to make the menu clearer or more interesting.",
        ],
        example:
          "I could draw a rainbow dosa and a mango bowl. If my guest cannot tell them apart, I could add names or colors.",
        clue: "What would help your guest know what each picture means?",
        anotherWay: "Use objects as a menu and describe each dish aloud.",
        reflection: "What did your guest help you notice?",
        parentRole:
          "Be a curious guest; accept imaginative dishes and invented spelling.",
        independent: "Invent, create, and revise the menu.",
        safety:
          "Pretend food only. No cooking tools or food preparation required.",
        observe: "Did he use feedback to change his creation?",
        practiceSkill: "w.sentences",
      },
      {
        id: "cafe-order",
        title: "Welcome a guest",
        domain: "communication",
        capability: "Listen and check understanding",
        minutes: "5–10",
        prompt: "Can you help a guest order from your pretend menu?",
        materials: ["Your menu", "A willing guest"],
        steps: [
          "Greet the guest and ask what they would like.",
          "Listen, then repeat the order to check it.",
          "If something is unavailable, suggest another choice politely.",
        ],
        example:
          "Hello! What would you like? Let me check: one mango bowl? We are out of that today. Would you like a dosa?",
        clue: "Listen first. Then say: did I get that right?",
        anotherWay:
          "Practise with a toy guest before a person, or let the guest point.",
        reflection: "How did you check what your guest wanted?",
        parentRole:
          "Model a short exchange if requested, then let him take the lead.",
        independent: "Greet, listen, check, and offer a choice.",
        safety:
          "Role-play at home. Real ordering stays supervised by a parent.",
        observe: "Did he listen and verify instead of guessing the order?",
      },
      {
        id: "cafe-setup",
        title: "Set up & tidy your café",
        domain: "independence",
        capability: "Complete a household routine",
        minutes: "5–10",
        prompt:
          "What does your guest need at their place? Can you set it up and put it away?",
        materials: ["Unbreakable plates or pretend dishes", "Napkins"],
        steps: [
          "Choose what two guests need and make a simple plan.",
          "Set the places. Check whether both guests have what they need.",
          "After pretend play, return everything to its home.",
        ],
        example:
          "I give each guest a plate and a napkin. I check both places, then put the dishes back after the game.",
        clue: "Check one place at a time. What is missing?",
        anotherWay: "Start with one place and a picture example to follow.",
        reflection: "What helped you remember the cleanup?",
        parentRole:
          "Make safe items accessible and show where they belong once.",
        independent: "Plan, set up, check, and tidy.",
        safety:
          "Use unbreakable dishes. No knives, hot drinks, or cleaning chemicals.",
        observe: "Did he complete setup and cleanup with fewer reminders?",
      },
      {
        id: "cafe-delivery",
        title: "Try the careful delivery route",
        domain: "movement",
        capability: "Move with balance and control",
        minutes: "5–10",
        prompt: "Can you carry a pretend order along a route you design?",
        materials: [
          "A light tray or piece of cardboard",
          "One soft toy",
          "Clear floor space",
        ],
        steps: [
          "Choose a short, clear walking route with a grown-up.",
          "Carry the soft toy slowly along it. Stop when you need to.",
          "Change one safe part of the route and try again.",
        ],
        example:
          "I walk from the table to a floor marker, pause, and turn slowly so the toy stays on the tray.",
        clue: "Slow down before a turn. You can use two hands.",
        anotherWay:
          "Carry the toy without a tray, shorten the route, or pass it between seated people.",
        reflection: "What helped you keep the order steady?",
        parentRole:
          "Clear and supervise the route. Support comfortable movement; do not race.",
        independent: "Choose a safe challenge and adjust speed or route.",
        safety:
          "Adult supervision. Walk only on a clear, dry, level floor; no stairs, hot food, liquids, or breakable objects.",
        observe:
          "Did he adjust his movement after noticing what was difficult?",
      },
    ],
  },
];

export const getMission = (id: string) => MISSIONS.find((m) => m.id === id);
export const getActivity = (id: string) =>
  MISSIONS.flatMap((m) => m.activities).find((a) => a.id === id);
export const missionForActivity = (id: string) =>
  MISSIONS.find((m) => m.activities.some((a) => a.id === id));
