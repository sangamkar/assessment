export interface VocabularyWord {
  word: string;
  meaning: string;
  clues: [string, string, string];
  context: string;
  example: string;
}
export const VOCABULARY: Record<1 | 2 | 3, VocabularyWord[]> = {
  1: [
    {
      word: "train",
      meaning: "A vehicle that travels along rails.",
      clues: [
        "I carry people or goods.",
        "I travel along rails.",
        "My carriages are joined together.",
      ],
      context: "We waited at the station for the ___ to arrive.",
      example: "The train stopped at the station.",
    },
    {
      word: "bridge",
      meaning: "A structure that lets people cross a gap.",
      clues: [
        "People can travel over me.",
        "I help you cross water or a road.",
        "I stretch across a gap.",
      ],
      context: "We crossed the river on a ___.",
      example: "The bridge connects the two riverbanks.",
    },
    {
      word: "helmet",
      meaning: "A hard covering worn to protect your head.",
      clues: [
        "You wear me for protection.",
        "I belong on your head.",
        "You might wear me while riding a bike.",
      ],
      context: "Before riding his bike, he put on his ___.",
      example: "A helmet helps protect your head.",
    },
    {
      word: "compass",
      meaning: "An instrument with a needle that points north.",
      clues: [
        "I help people find their way.",
        "My needle points north.",
        "I show directions such as north and south.",
      ],
      context: "The explorer used a ___ to find north.",
      example: "A compass helps show which direction you are facing.",
    },
    {
      word: "nest",
      meaning: "A place a bird makes to hold its eggs or young.",
      clues: [
        "An animal makes me.",
        "I can hold eggs.",
        "A bird might build me from twigs.",
      ],
      context: "The bird carried a twig to its ___.",
      example: "The robin built a nest in the tree.",
    },
    {
      word: "anchor",
      meaning: "A heavy object that helps hold a boat in place.",
      clues: [
        "You might find me on a boat.",
        "I am lowered into the water.",
        "My weight helps keep a boat in place.",
      ],
      context: "The boat lowered its ___ so it would stay in place.",
      example: "The sailor raised the anchor before leaving.",
    },
    {
      word: "telescope",
      meaning: "An instrument that makes faraway things look closer.",
      clues: [
        "You look through me.",
        "I make distant things look closer.",
        "You can use me to study the Moon.",
      ],
      context: "We looked through a ___ to see the Moon more closely.",
      example: "The telescope made the Moon look larger.",
    },
    {
      word: "parcel",
      meaning: "An object wrapped or packed to be sent somewhere.",
      clues: [
        "Someone might deliver me.",
        "I can be wrapped or put in a box.",
        "I am a package sent to someone.",
      ],
      context: "The delivery worker brought a ___ to the door.",
      example: "The parcel contained a new book.",
    },
  ],
  2: [
    {
      word: "fragile",
      meaning: "Easy to break or damage.",
      clues: [
        "This describes something that needs care.",
        "It can break easily.",
        "A thin glass ornament can be this.",
      ],
      context: "The glass ornament was ___, so we carried it carefully.",
      example: "The fragile cup broke when it fell.",
    },
    {
      word: "sturdy",
      meaning: "Strong and not easily damaged.",
      clues: [
        "This describes something strong.",
        "It does not break or wobble easily.",
        "A well-built chair can be this.",
      ],
      context: "The ___ chair did not wobble when I sat down.",
      example: "The sturdy box held all the books.",
    },
    {
      word: "enormous",
      meaning: "Very large.",
      clues: [
        "This describes size.",
        "It means much bigger than ordinary.",
        "A whale can be this size.",
      ],
      context: "The ___ whale was much larger than our boat.",
      example: "An enormous balloon floated above the crowd.",
    },
    {
      word: "tiny",
      meaning: "Very small.",
      clues: [
        "This describes size.",
        "It means very small.",
        "A grain of sand is this size.",
      ],
      context: "The ___ seed fitted on the tip of my finger.",
      example: "A tiny ant walked across the leaf.",
    },
    {
      word: "swift",
      meaning: "Moving quickly.",
      clues: [
        "This describes movement.",
        "It means quick or fast.",
        "A runner who moves rapidly can be this.",
      ],
      context: "The ___ runner reached the finish before everyone else.",
      example: "The swift bird flew past us.",
    },
    {
      word: "cautious",
      meaning: "Careful about possible danger or mistakes.",
      clues: [
        "This describes how someone acts.",
        "They take care before doing something risky.",
        "They might check the ground before stepping.",
      ],
      context: "The ___ explorer checked the loose stones before stepping.",
      example: "We were cautious on the slippery path.",
    },
    {
      word: "rescue",
      meaning: "To save someone from danger.",
      clues: [
        "This is an action that helps someone.",
        "The person needs help because they are in danger.",
        "A lifeguard might do this for a swimmer.",
      ],
      context: "The lifeguard hurried to ___ the swimmer in trouble.",
      example: "The team worked to rescue the trapped climber.",
    },
    {
      word: "inspect",
      meaning: "To look at something carefully to check it.",
      clues: [
        "This is something you do with close attention.",
        "You look carefully for problems.",
        "A mechanic might do this to an engine.",
      ],
      context: "The mechanic will ___ the engine to look for damage.",
      example: "Please inspect the box for any holes.",
    },
  ],
  3: [
    {
      word: "reluctant",
      meaning: "Not eager or willing to do something.",
      clues: [
        "This describes how someone feels about an action.",
        "They are unwilling or hesitant.",
        "They might say: I would rather not.",
      ],
      context:
        "She was ___ to enter the dark tunnel and wanted to stay outside.",
      example: "He was reluctant to leave the playground.",
    },
    {
      word: "curious",
      meaning: "Eager to learn or find out about something.",
      clues: [
        "This describes someone who wants to learn.",
        "They often wonder how things work.",
        "They ask questions to find out more.",
      ],
      context: "The ___ child asked how the airplane stayed in the air.",
      example: "I am curious about what is inside the seed.",
    },
    {
      word: "scarce",
      meaning: "Not plentiful; hard to find in sufficient amounts.",
      clues: [
        "This describes how much of something is available.",
        "There is not much of it.",
        "Water can be this during a long drought.",
      ],
      context: "Rain had not fallen for months, and water was ___.",
      example: "Food became scarce after the crops failed.",
    },
    {
      word: "abundant",
      meaning: "Available in large amounts.",
      clues: [
        "This describes how much of something is available.",
        "There is plenty of it.",
        "It is the opposite of scarce.",
      ],
      context: "The orchard had an ___ supply of apples, enough for everyone.",
      example: "Flowers were abundant in the garden.",
    },
    {
      word: "generous",
      meaning: "Willing to give or share more than expected.",
      clues: [
        "This describes how someone treats others.",
        "They are happy to give or share.",
        "They might offer their supplies to someone who has none.",
      ],
      context: "The ___ artist happily shared her extra crayons with everyone.",
      example: "Our generous neighbor offered us fresh fruit.",
    },
    {
      word: "predict",
      meaning: "To say what you think will happen before it happens.",
      clues: [
        "This is a kind of thinking.",
        "You say what may happen next.",
        "You use what you know before seeing the result.",
      ],
      context: "Before testing the ramp, ___ which car will travel farther.",
      example: "I predict the ice will melt in the warm room.",
    },
    {
      word: "compare",
      meaning: "To look for similarities and differences.",
      clues: [
        "This is something you do with two or more things.",
        "You look at what is alike and what is different.",
        "You might check the sizes of two planes.",
      ],
      context: "___ the two maps to find what is alike and what has changed.",
      example: "Compare the leaves by their shapes and sizes.",
    },
    {
      word: "discover",
      meaning: "To find or learn something you did not know before.",
      clues: [
        "This happens when you find something new to you.",
        "You learn what was previously unknown.",
        "An explorer might do this with a hidden cave.",
      ],
      context: "The explorer hoped to ___ a cave that nobody had found before.",
      example: "We may discover a new way to solve the puzzle.",
    },
  ],
};
export interface ConnectionSet {
  groups: [
    { label: string; words: [string, string, string, string] },
    { label: string; words: [string, string, string, string] },
  ];
  explanation: string;
}
export const CONNECTIONS: Record<1 | 2 | 3, ConnectionSet[]> = {
  1: [
    {
      groups: [
        { label: "Vehicles", words: ["bus", "train", "bicycle", "airplane"] },
        {
          label: "Places to visit",
          words: ["library", "museum", "park", "zoo"],
        },
      ],
      explanation: "Vehicles carry us; these places are destinations.",
    },
    {
      groups: [
        { label: "Clothing", words: ["shirt", "coat", "socks", "hat"] },
        { label: "Tools", words: ["hammer", "saw", "wrench", "screwdriver"] },
      ],
      explanation: "Clothing is worn; tools help us do jobs.",
    },
    {
      groups: [
        { label: "Body parts", words: ["elbow", "knee", "ankle", "wrist"] },
        {
          label: "Parts of a tree",
          words: ["root", "trunk", "branch", "leaf"],
        },
      ],
      explanation: "Both groups name parts: one of a body, one of a tree.",
    },
    {
      groups: [
        { label: "Weather", words: ["rain", "snow", "wind", "fog"] },
        {
          label: "Musical instruments",
          words: ["drum", "flute", "violin", "piano"],
        },
      ],
      explanation:
        "Weather describes conditions outdoors; instruments make music.",
    },
  ],
  2: [
    {
      groups: [
        { label: "Ways to move", words: ["crawl", "sprint", "hop", "stroll"] },
        {
          label: "Ways to speak",
          words: ["whisper", "shout", "murmur", "announce"],
        },
      ],
      explanation:
        "Crawling and strolling move your body. Whispering and announcing use your voice.",
    },
    {
      groups: [
        { label: "Materials", words: ["wood", "metal", "glass", "fabric"] },
        { label: "Textures", words: ["rough", "smooth", "bumpy", "silky"] },
      ],
      explanation:
        "Materials tell what something is made of. Textures tell how its surface feels.",
    },
    {
      groups: [
        {
          label: "Words about size",
          words: ["tiny", "huge", "enormous", "small"],
        },
        {
          label: "Words about speed",
          words: ["swift", "slow", "rapid", "speedy"],
        },
      ],
      explanation:
        "Size tells how big something is; speed tells how quickly it moves.",
    },
    {
      groups: [
        {
          label: "Parts of a story",
          words: ["character", "setting", "problem", "ending"],
        },
        {
          label: "Parts of a book",
          words: ["cover", "spine", "page", "index"],
        },
      ],
      explanation:
        "A story has characters and events. A physical book has a cover and pages.",
    },
  ],
  3: [
    {
      groups: [
        {
          label: "Similar to happy",
          words: ["joyful", "cheerful", "delighted", "glad"],
        },
        {
          label: "Similar to sad",
          words: ["unhappy", "sorrowful", "gloomy", "miserable"],
        },
      ],
      explanation:
        "Words can have related meanings but different strengths: delighted is stronger than glad.",
    },
    {
      groups: [
        {
          label: "Similar to look",
          words: ["peek", "glance", "stare", "observe"],
        },
        {
          label: "Similar to walk",
          words: ["wander", "stride", "march", "amble"],
        },
      ],
      explanation:
        "A glance is brief; a stare lasts longer. An amble is leisurely; a march is purposeful.",
    },
    {
      groups: [
        {
          label: "Means not",
          words: ["unable", "unfair", "unsafe", "unusual"],
        },
        {
          label: "Means again",
          words: ["reread", "rebuild", "replay", "reheat"],
        },
      ],
      explanation: "In these words, un- means not and re- means again.",
    },
    {
      groups: [
        {
          label: "Words about time",
          words: ["before", "after", "during", "until"],
        },
        {
          label: "Words about position",
          words: ["above", "below", "beside", "between"],
        },
      ],
      explanation:
        "Time words locate events in time; position words locate things in space.",
    },
  ],
};
