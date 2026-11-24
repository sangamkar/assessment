import type { Difficulty, Item, Skill } from './types';
import { items, txt } from './helpers';

/**
 * Grade 1–2 passages he reads himself, i-Ready style: a titled passage, then 3–4 questions about it.
 * Grade 1 passages are 4–6 sentences, Grade 2 passages 6–10. Text features (headings, captions,
 * labels, glossary) are printed as their own lines so he can find them.
 *
 * Difficulty: 1 = detail stated in one sentence; 2 = combine two sentences, order events or use a
 * text feature; 3 = inference, character response, main idea, lesson or comparison across the passage.
 * Wrong choices are drawn from the passage (true but not asked, wrong character, wrong step,
 * reasonable but unsupported). Ids are positional: append passages and questions, never reorder.
 * Each skill has one more passage held out for the mock, so a practised passage is never tested.
 */
type Wrong = readonly [text: string, why: string];
type Q = readonly [d: Difficulty, question: string, answer: string, wrong: readonly Wrong[], explain: string];
interface Passage { title: string; lines: readonly (readonly [emoji: string, text: string])[]; qs: readonly Q[] }
interface Spec extends Omit<Skill, 'subject' | 'items' | 'intro'> { intro: string; verb: string; passages: readonly Passage[]; reserve?: Passage }

function build(skill: string, verb: string, passages: readonly Passage[], reserve: boolean): Item[] {
  const drafts = passages.flatMap(p => p.qs.map(([difficulty, question, answer, wrong, explain]) => ({
    difficulty,
    say: `${verb} ${question}`,
    show: question,
    visual: { kind: 'story' as const, title: p.title, lines: p.lines.map(([emoji, text]) => ({ emoji, text })) },
    speakChoices: false,
    choices: [txt(answer), ...wrong.map(([text, why]) => txt(text, why))],
    explain,
  })));
  return items(reserve ? `${skill}.reserved-reading` : skill, drafts).map(i => ({ ...i, skill }));
}

/* ------------------------------------------------------------------------ */
/* GRADE 1 LITERATURE: key details, characters, setting, events, lessons     */
/* ------------------------------------------------------------------------ */
const storyDetails: Spec = {
  id: 'r1.story-details', strand: 'lit', grade: '1', title: 'Grade 1 stories: key details, characters, setting and events', kidTitle: 'Story detective', icon: '🕵️',
  standards: ['RL.1.1', 'RL.1.2', 'RL.1.3', 'RL.1.10'], prereqs: ['r.lit'],
  parentTip: 'After he reads a picture book page, ask one "who", one "where" and one "why" question, and have him point to the words that tell.',
  intro: 'Read the story yourself. Then look back at the words to find who, where, what happened, and why.',
  verb: 'Read the story.',
  passages: [
    { title: 'The Soccer Game', lines: [
      ['⚽', 'Maya and her friend Leo played soccer at the park.'],
      ['🌳', 'Maya kicked the ball hard, and it rolled into the bushes.'],
      ['🐶', 'A small brown dog ran into the bushes and came out with the ball.'],
      ['😄', 'The dog dropped the ball at Maya\'s feet and wagged its tail.'],
      ['👏', 'Leo laughed and said, "We have a new player!"'],
    ], qs: [
      [1, 'Where did Maya and Leo play soccer?', 'at the park', [['in the bushes', 'detail_not_asked'], ['at school', 'detail_not_in_text']], 'The first sentence says they played soccer at the park. Only the ball went into the bushes.'],
      [2, 'What happened right after the ball rolled into the bushes?', 'a dog ran in and got it', [['Leo laughed', 'sequence_confusion'], ['Maya kicked the ball', 'sequence_confusion']], 'Maya kicked, the ball rolled into the bushes, and then a dog ran in and came out with it.'],
      [1, 'Who brought the ball back to Maya?', 'a small brown dog', [['Leo', 'wrong_character'], ['Maya\'s mom', 'detail_not_in_text']], 'The dog came out with the ball and dropped it at Maya\'s feet.'],
      [3, 'Why did Leo say, "We have a new player"?', 'the dog acted like it was part of the game', [['the dog was his pet', 'unsupported_inference'], ['a new kid wanted to join', 'literal_reading']], 'The dog fetched the ball and gave it back, like a teammate. Leo was joking about the dog.'],
    ] },
    { title: 'Getting Ready for Diwali', lines: [
      ['👵', 'Ravi helped Grandma get ready for Diwali.'],
      ['🏺', 'They filled small clay lamps with oil.'],
      ['✋', 'Ravi set the lamps in a row along the window.'],
      ['🌙', 'When it got dark, Grandma lit each lamp.'],
      ['✨', 'The house glowed, and Ravi smiled a big, proud smile.'],
    ], qs: [
      [1, 'What did Ravi and Grandma fill with oil?', 'small clay lamps', [['the window', 'detail_not_asked'], ['a cooking pot', 'detail_not_in_text']], 'The story says they filled small clay lamps with oil.'],
      [2, 'What happened after it got dark?', 'Grandma lit the lamps', [['Ravi set the lamps by the window', 'sequence_confusion'], ['they filled the lamps with oil', 'sequence_confusion']], 'They filled the lamps and set them out first. When it got dark, Grandma lit them.'],
      [3, 'Why did Ravi feel proud?', 'he helped make the house glow', [['Grandma gave him a present', 'unsupported_inference'], ['he lit every lamp by himself', 'wrong_character']], 'Ravi helped fill and set out the lamps, and the house glowed. Grandma did the lighting.'],
    ] },
    { title: 'Where Is Pepper?', lines: [
      ['🐱', 'Zoe\'s kitten, Pepper, was missing.'],
      ['🛏️', 'Zoe looked under her bed and then behind the couch.'],
      ['👂', 'Then she heard a tiny meow from the laundry basket.'],
      ['🧺', 'Pepper was curled up in a warm pile of towels.'],
      ['🤗', 'Zoe hugged her kitten and laughed.'],
    ], qs: [
      [1, 'What is the kitten\'s name?', 'Pepper', [['Zoe', 'wrong_character'], ['Misty', 'detail_not_in_text']], 'The first sentence says Zoe\'s kitten, Pepper. Zoe is the girl.'],
      [2, 'Where did Zoe look first?', 'under her bed', [['in the laundry basket', 'sequence_confusion'], ['behind the couch', 'sequence_confusion']], 'She looked under her bed and then behind the couch. The basket came last.'],
      [2, 'How did Zoe find Pepper?', 'she heard a meow', [['she saw Pepper\'s tail', 'unsupported_inference'], ['her mom told her', 'detail_not_in_text']], 'Zoe heard a tiny meow from the laundry basket.'],
      [3, 'How did Zoe probably feel at the beginning of the story?', 'worried', [['happy', 'feeling_from_wrong_part'], ['sleepy', 'unsupported_inference']], 'Her kitten was missing and she was searching everywhere, so she was worried. She was happy only at the end.'],
    ] },
    { title: 'Snow Day in Atlanta', lines: [
      ['❄️', 'It almost never snows in Atlanta, but one morning the yard was white.'],
      ['📻', 'The radio said school was closed for the day.'],
      ['🧦', 'Jamal and his dad wore old socks on their hands as mittens.'],
      ['⛄', 'They built a tiny snowman with a peanut for a nose.'],
      ['☀️', 'By lunch the sun came out, and the snowman began to melt.'],
    ], qs: [
      [1, 'What did Jamal and his dad use as mittens?', 'old socks', [['peanuts', 'detail_not_asked'], ['Dad\'s gloves', 'unsupported_inference']], 'The story says they wore old socks on their hands as mittens.'],
      [2, 'Why was school closed?', 'it had snowed', [['it was a holiday', 'unsupported_inference'], ['the sun came out', 'sequence_confusion']], 'The yard was white with snow, and then the radio said school was closed.'],
      [2, 'Why did the snowman begin to melt?', 'the sun came out', [['Jamal knocked it over', 'unsupported_inference'], ['it was too small', 'unsupported_inference']], 'The last sentence says the sun came out, and then the snowman began to melt.'],
      [3, 'What can you tell about snow in Atlanta?', 'it does not happen very often', [['it falls every winter day', 'ignores_clue'], ['it never melts', 'ignores_clue']], 'The story says it almost never snows in Atlanta, so a snow day is a surprise.'],
    ] },
    { title: 'Tia Swims', lines: [
      ['🏊', 'Tia stood at the edge of the pool.'],
      ['😟', 'The water looked deep, and her legs felt wobbly.'],
      ['👩', 'Coach Amy held out her hands and said, "I will stay right here."'],
      ['💦', 'Tia took a deep breath and kicked across the pool.'],
      ['🏅', 'When she reached the other side, she cheered, "I did it!"'],
    ], qs: [
      [1, 'Who said, "I will stay right here"?', 'Coach Amy', [['Tia', 'wrong_character'], ['Tia\'s mom', 'detail_not_in_text']], 'Coach Amy held out her hands and said it to help Tia feel safe.'],
      [2, 'How did Tia feel at the beginning?', 'nervous', [['proud', 'feeling_from_wrong_part'], ['bored', 'unsupported_inference']], 'Her legs felt wobbly and the water looked deep, so she was nervous. She felt proud at the end.'],
      [2, 'What did Tia do after Coach Amy held out her hands?', 'swam to the other side', [['stood at the edge', 'sequence_confusion'], ['went home', 'detail_not_in_text']], 'After Coach Amy spoke, Tia took a deep breath and kicked across the pool to the other side. She stood at the edge before that.'],
      [3, 'What is the lesson of the story?', 'being brave can help you do something new', [['pools can be very deep', 'detail_not_lesson'], ['never try something that feels scary', 'opposite_lesson']], 'Tia felt scared but tried anyway, and she did it. That is the lesson; the deep water is just a detail.'],
    ] },
    { title: 'The Giant Pumpkin', lines: [
      ['🎃', 'Sam and his grandpa grew a pumpkin in the garden.'],
      ['💧', 'Every morning, Sam gave it water.'],
      ['📏', 'By fall, the pumpkin was as big as a wagon.'],
      ['😅', 'Sam and Grandpa pushed and pulled, but it would not move.'],
      ['🚜', 'So Grandpa drove the tractor over and lifted the pumpkin onto the truck.'],
    ], qs: [
      [1, 'What did Sam do every morning?', 'gave the pumpkin water', [['drove the tractor', 'wrong_character'], ['pushed the pumpkin', 'sequence_confusion']], 'The second sentence says Sam gave it water every morning.'],
      [2, 'Which words tell you the pumpkin was very large?', 'as big as a wagon', [['every morning', 'detail_not_asked'], ['in the garden', 'detail_not_asked']], 'As big as a wagon tells the size. The other words tell when and where.'],
      [2, 'Why did Grandpa use the tractor?', 'the pumpkin was too heavy to push', [['the truck was broken', 'unsupported_inference'], ['Sam wanted a ride', 'unsupported_inference']], 'Sam and Grandpa pushed and pulled, but it would not move. So they needed the tractor.'],
    ] },
  ],
  reserve: { title: 'The Paper Airplane', lines: [
    ['✈️', 'Ben folded a paper airplane.'],
    ['⬇️', 'He threw it, but it dove straight to the floor.'],
    ['👧', 'Ben\'s sister Kim showed him how to fold the wings flat.'],
    ['➡️', 'This time the plane glided across the whole room.'],
    ['🙌', 'Ben gave Kim a high five.'],
  ], qs: [
    [1, 'Who showed Ben how to fix the wings?', 'his sister Kim', [['his dad', 'detail_not_in_text'], ['nobody; Ben did it alone', 'wrong_character']], 'The story says Ben\'s sister Kim showed him how to fold the wings flat.'],
    [2, 'What happened the first time Ben threw the plane?', 'it dove to the floor', [['it glided across the room', 'sequence_confusion'], ['it flew out the window', 'detail_not_in_text']], 'The first throw dove straight to the floor. It glided only after Kim helped.'],
    [3, 'Why did Ben give Kim a high five?', 'her idea made the plane fly', [['she won a race', 'unsupported_inference'], ['she folded her own plane', 'unsupported_inference']], 'Kim showed him how to fix the wings, and then the plane glided. He was thanking her.'],
  ] },
};

/* ------------------------------------------------------------------------ */
/* GRADE 1 INFORMATIONAL: main topic, key details, connections, word meaning  */
/* ------------------------------------------------------------------------ */
const infoDetails: Spec = {
  id: 'r1.info-details', strand: 'info', grade: '1', title: 'Grade 1 informational text: main topic and key details', kidTitle: 'Fact explorer', icon: '🔭',
  standards: ['RI.1.1', 'RI.1.2', 'RI.1.3', 'RI.1.4', 'RI.1.10'], prereqs: ['r.info'],
  parentTip: 'With a nonfiction book, ask "What is this page MOSTLY about?" and then "Which fact helped you know?"',
  intro: 'Read the page yourself. Ask: what is it mostly about, and what facts does it tell?',
  verb: 'Read the page.',
  passages: [
    { title: 'Sea Turtles', lines: [
      ['🐢', 'Sea turtles swim in warm oceans.'],
      ['🏖️', 'A mother sea turtle crawls onto a beach at night.'],
      ['🥚', 'She digs a hole in the sand and lays her eggs.'],
      ['🌊', 'When the babies hatch, they scurry to the water.'],
      ['🗺️', 'Many sea turtles lay their eggs on beaches in Georgia.'],
    ], qs: [
      [1, 'Where does a mother sea turtle lay her eggs?', 'in a hole in the sand', [['in the ocean', 'prior_knowledge_over_text'], ['in a nest in a tree', 'detail_not_in_text']], 'She digs a hole in the sand and lays her eggs there.'],
      [2, 'What do the babies do after they hatch?', 'hurry to the water', [['dig a hole in the sand', 'wrong_character'], ['crawl onto the beach at night', 'sequence_confusion']], 'The mother digs and crawls onto the beach. The babies scurry to the water after they hatch.'],
      [2, 'In this page, what does scurry mean?', 'move fast with quick steps', [['swim slowly', 'context_clue_missed'], ['go to sleep', 'context_clue_missed']], 'Baby turtles rush from the nest to the sea, so scurry means move fast with quick steps.'],
      [3, 'What is this page mostly about?', 'how sea turtles lay eggs and hatch', [['beaches in Georgia', 'topic_too_narrow'], ['warm oceans', 'topic_too_narrow']], 'Most sentences tell about mother turtles laying eggs and babies hatching. Georgia beaches are one detail.'],
    ] },
    { title: 'Rockets', lines: [
      ['🚀', 'A rocket is a machine that can fly into space.'],
      ['🔥', 'Fire and hot gas push out of the bottom of the rocket.'],
      ['⬆️', 'That push sends the rocket up, up, up.'],
      ['👩‍🚀', 'Some rockets carry astronauts.'],
      ['🛰️', 'Others carry machines that take pictures of Earth.'],
    ], qs: [
      [1, 'What pushes out of the bottom of a rocket?', 'fire and hot gas', [['astronauts', 'detail_not_asked'], ['water', 'detail_not_in_text']], 'The second sentence says fire and hot gas push out of the bottom.'],
      [2, 'What makes the rocket go up?', 'the push of fire and gas', [['the astronauts inside', 'unsupported_inference'], ['the pictures of Earth', 'detail_not_asked']], 'Fire and hot gas push out, and that push sends the rocket up.'],
      [3, 'What is the main topic of this page?', 'rockets and what they do', [['astronauts', 'topic_too_narrow'], ['pictures of Earth', 'topic_too_narrow']], 'Every sentence tells about rockets. Astronauts and pictures are details.'],
    ] },
    { title: 'Elephant Trunks', lines: [
      ['🐘', 'Elephants are the biggest animals that live on land.'],
      ['✋', 'An elephant uses its long trunk like a hand.'],
      ['🍃', 'It can pick up leaves, fruit and even one peanut.'],
      ['💧', 'It also sucks up water with its trunk and sprays it into its mouth.'],
      ['🌏', 'Asian elephants live in India and other countries in Asia.'],
    ], qs: [
      [1, 'Where do Asian elephants live?', 'in India and other parts of Asia', [['only in Africa', 'prior_knowledge_over_text'], ['in the ocean', 'detail_not_in_text']], 'The last sentence says Asian elephants live in India and other countries in Asia.'],
      [2, 'What are two ways an elephant uses its trunk?', 'to pick up food and to drink', [['to pick up food and to run fast', 'half_right_detail'], ['to drink and to sleep', 'half_right_detail']], 'The page tells that the trunk picks up leaves and fruit and sucks up water to drink.'],
      [3, 'Why does the author say a trunk is like a hand?', 'it can grab and hold things', [['it has five fingers', 'literal_reading'], ['it is very big', 'unsupported_inference']], 'A trunk picks up leaves, fruit and a peanut, the way a hand grabs things.'],
    ] },
    { title: 'Thunderstorms', lines: [
      ['⛈️', 'A thunderstorm is a storm with lightning and thunder.'],
      ['⚡', 'Lightning is a giant spark of electricity in the sky.'],
      ['🔊', 'Lightning heats the air so fast that the air makes a loud boom.'],
      ['👂', 'That boom is the sound we call thunder.'],
      ['🏠', 'When you hear thunder, go inside to stay safe.'],
    ], qs: [
      [1, 'What is lightning?', 'a giant spark in the sky', [['a loud boom', 'detail_not_asked'], ['a kind of rain', 'detail_not_in_text']], 'The second sentence says lightning is a giant spark of electricity. The boom is thunder.'],
      [2, 'What causes the boom of thunder?', 'lightning heating the air', [['clouds bumping together', 'prior_misconception'], ['heavy rain falling', 'unsupported_inference']], 'Lightning heats the air so fast that it makes a boom. That boom is thunder.'],
      [1, 'What should you do when you hear thunder?', 'go inside', [['look for the lightning', 'unsupported_inference'], ['stand under a tall tree', 'unsupported_inference']], 'The last sentence says to go inside to stay safe.'],
    ] },
    { title: 'The First Airplane', lines: [
      ['✈️', 'Long ago, no one had ever flown in an airplane.'],
      ['👬', 'Two brothers, Orville and Wilbur Wright, wanted to change that.'],
      ['🔧', 'They fixed bikes in their shop and used what they learned to build a plane.'],
      ['🏖️', 'In 1903, Orville flew their plane on a windy beach in North Carolina.'],
      ['⏱️', 'The first flight lasted only 12 seconds, but it changed the world.'],
    ], qs: [
      [1, 'Where did the first flight happen?', 'on a beach in North Carolina', [['in their bike shop', 'detail_not_asked'], ['in Georgia', 'detail_not_in_text']], 'Orville flew the plane on a windy beach in North Carolina.'],
      [2, 'How did fixing bikes help the brothers?', 'they learned things that helped them build a plane', [['they rode bikes to the beach', 'unsupported_inference'], ['they sold bikes to buy a plane', 'unsupported_inference']], 'The page says they used what they learned fixing bikes to build a plane.'],
      [3, 'Why does the author say the flight changed the world?', 'it was the first time people flew in a plane', [['it lasted a very long time', 'ignores_clue'], ['it happened on a windy beach', 'detail_not_asked']], 'No one had ever flown before. The flight was only 12 seconds, but it was the very first.'],
    ] },
    { title: 'How Seeds Travel', lines: [
      ['🌱', 'Plants cannot walk, but their seeds can travel.'],
      ['🌬️', 'Some seeds, like dandelion seeds, float away on the wind.'],
      ['🐿️', 'Squirrels bury acorns, and some of them grow into new trees.'],
      ['🥥', 'Coconuts can float across the ocean to a new beach.'],
      ['🌳', 'When seeds travel, new plants can grow in new places.'],
    ], qs: [
      [1, 'How do dandelion seeds travel?', 'on the wind', [['across the ocean', 'detail_not_asked'], ['buried by squirrels', 'detail_not_asked']], 'The page says dandelion seeds float away on the wind.'],
      [2, 'How are acorns and coconuts alike?', 'both are seeds that move to new places', [['both float across the ocean', 'overgeneralized_comparison'], ['both get buried by squirrels', 'overgeneralized_comparison']], 'Squirrels move acorns and the ocean moves coconuts. Both are seeds that travel.'],
      [3, 'What is the main idea of this page?', 'seeds travel in different ways so new plants can grow', [['dandelion seeds float on the wind', 'topic_too_narrow'], ['squirrels like to eat acorns', 'detail_not_in_text']], 'The page gives three ways seeds travel and ends by saying why it matters: new plants grow in new places.'],
    ] },
  ],
  reserve: { title: 'Hot Air Balloons', lines: [
    ['🎈', 'A hot air balloon has a giant cloth bag on top.'],
    ['🔥', 'A burner under the bag heats the air inside.'],
    ['⬆️', 'Hot air is lighter than cool air, so the balloon rises.'],
    ['🧺', 'People ride in a basket that hangs below the bag.'],
    ['⬇️', 'To come down, the pilot lets the air inside cool off.'],
  ], qs: [
    [1, 'Where do people ride?', 'in a basket', [['inside the cloth bag', 'detail_misread'], ['on top of the burner', 'detail_misread']], 'The page says people ride in a basket that hangs below the bag.'],
    [2, 'Why does the balloon rise?', 'the hot air inside is lighter', [['the basket is light', 'unsupported_inference'], ['the pilot lets the air cool', 'opposite_cause']], 'Hot air is lighter than cool air, so the balloon rises. Cooling the air brings it down.'],
    [3, 'What would happen if the burner stopped heating the air?', 'the balloon would come down', [['the balloon would go higher', 'opposite_effect'], ['the basket would fall off', 'unsupported_inference']], 'Without the burner, the air cools. The page says cool air makes the balloon come down.'],
  ] },
};

/* ------------------------------------------------------------------------ */
/* GRADE 2 LITERATURE: how characters respond, central message, comparing    */
/* ------------------------------------------------------------------------ */
const characterResponse: Spec = {
  id: 'r2.character-response', strand: 'lit', grade: '2', title: 'Grade 2 stories: how characters respond, central message, comparing versions', kidTitle: 'Character feelings', icon: '🎭',
  standards: ['RL.2.1', 'RL.2.2', 'RL.2.3', 'RL.2.4', 'RL.2.9', 'RL.2.10'], prereqs: ['r1.story-details'],
  parentTip: 'Pause at a problem in a story and ask: "How does the character feel? What will they do about it?" Then read on to check.',
  intro: 'Read the story yourself. Think about how the characters feel, what they do about their problems, and what the story teaches.',
  verb: 'Read the story.',
  passages: [
    { title: 'The Spelling Bee', lines: [
      ['🏫', 'Priya\'s class was having a spelling bee on Friday.'],
      ['📝', 'All week, Priya practiced words with her big brother, Dev.'],
      ['😰', 'On Friday morning, her stomach felt full of butterflies.'],
      ['🎤', 'When it was her turn, the teacher said, "Spell the word bridge."'],
      ['🤔', 'Priya closed her eyes and pictured the word on her practice card.'],
      ['🔤', '"B, R, I, D, G, E," she said slowly.'],
      ['👏', 'The class clapped, and Priya let out a long breath.'],
      ['🏠', 'That night, she told Dev, "Practicing really helped!"'],
    ], qs: [
      [1, 'Who helped Priya practice?', 'her brother Dev', [['her teacher', 'wrong_character'], ['her best friend', 'detail_not_in_text']], 'The story says Priya practiced all week with her big brother, Dev.'],
      [2, 'What did Priya do to remember how to spell bridge?', 'she pictured her practice card', [['she asked Dev for help', 'sequence_confusion'], ['she read it off the board', 'unsupported_inference']], 'She closed her eyes and pictured the word on her practice card. Dev helped earlier in the week.'],
      [3, 'What does "her stomach felt full of butterflies" mean?', 'she was nervous', [['she ate something bad', 'literal_reading'], ['she was excited to see bugs', 'literal_reading']], 'It is a saying. A fluttery stomach before a big moment means you feel nervous.'],
      [3, 'How did Priya\'s feelings change from morning to the end of the spelling bee?', 'she went from nervous to relieved', [['she went from happy to sad', 'feeling_from_wrong_part'], ['she felt bored the whole time', 'unsupported_inference']], 'In the morning she had butterflies. After the class clapped, she let out a long breath because she was relieved.'],
    ] },
    { title: 'The Sandcastle', lines: [
      ['🏖️', 'Marco and his little cousin Lily spent the morning building a sandcastle on Tybee Island.'],
      ['🏰', 'It had four towers and a moat full of seawater.'],
      ['🌊', 'Suddenly, a big wave rushed up the beach.'],
      ['😢', 'When the water slid back, two towers were gone, and Lily started to cry.'],
      ['🤗', 'Marco put his arm around her.'],
      ['💡', '"Let\'s build it again," he said, "but this time farther from the water."'],
      ['🐚', 'They carried their buckets up the beach and started over.'],
      ['☀️', 'By lunch, their new castle was even taller than the first one.'],
    ], qs: [
      [1, 'Where does the story take place?', 'at the beach on Tybee Island', [['at a swimming pool', 'detail_not_in_text'], ['in a sandbox at the park', 'detail_not_in_text']], 'The first sentence says they built the sandcastle on Tybee Island, and a wave rushed up the beach.'],
      [2, 'What happened right after the big wave?', 'two of the towers were gone', [['they built a taller castle', 'sequence_confusion'], ['they filled the moat', 'sequence_confusion']], 'When the water slid back, two towers were gone. The taller castle came at the end.'],
      [3, 'How did Marco respond when Lily cried?', 'he comforted her and made a new plan', [['he laughed at the wave', 'unsupported_inference'], ['he went home for lunch', 'sequence_confusion']], 'Marco put his arm around Lily and said they could build again farther from the water.'],
      [3, 'Why did Marco want to build farther from the water?', 'so the waves could not reach the castle', [['so they could be closer to lunch', 'unsupported_inference'], ['because the sand was wetter there', 'ignores_clue']], 'A wave knocked down the first castle. Building farther away keeps the waves from reaching it.'],
    ] },
    { title: 'Anansi and the Pot of Wisdom', lines: [
      ['🕷️', 'Long ago, Anansi the spider gathered all the wisdom in the world into one clay pot.'],
      ['🙊', 'He wanted to keep every bit of it for himself.'],
      ['🌳', 'Anansi decided to hide the pot at the top of a tall tree.'],
      ['😣', 'He tied the pot to his front, but it bumped his legs, and he could not climb.'],
      ['👦', 'His young son watched and said, "Father, why not tie the pot on your back?"'],
      ['😠', 'Anansi was angry that a child had a better idea than his.'],
      ['💥', 'He let go of the pot, and it fell and broke.'],
      ['🌬️', 'The wind carried bits of wisdom all over the world, so everyone got a little.'],
    ], qs: [
      [1, 'Where did Anansi want to hide the pot?', 'at the top of a tall tree', [['on his back', 'detail_not_asked'], ['under the ground', 'detail_not_in_text']], 'Anansi decided to hide the pot at the top of a tall tree.'],
      [2, 'What idea did Anansi\'s son have?', 'carry the pot on his back', [['hide the pot in a tree', 'wrong_character'], ['break the pot open', 'unsupported_inference']], 'His son asked, why not tie the pot on your back? Hiding it in the tree was Anansi\'s own plan.'],
      [2, 'How did Anansi respond to his son\'s idea?', 'he got angry and dropped the pot', [['he thanked his son and kept climbing', 'unsupported_inference'], ['he gave the pot to his son', 'unsupported_inference']], 'Anansi was angry that a child had a better idea, and he let go of the pot.'],
      [3, 'What is the central message of this folktale?', 'no one can keep all the wisdom to themselves', [['spiders are good climbers', 'detail_not_lesson'], ['always hide the things you own', 'opposite_lesson']], 'Anansi tried to keep all the wisdom, but even a child knew something he did not, and the wisdom spread to everyone.'],
    ] },
    { title: 'The New Kid', lines: [
      ['🚌', 'On the first day of school, a new girl named Hana sat alone on the bus.'],
      ['👀', 'She stared out the window and held her backpack tightly.'],
      ['👦', 'Theo noticed her and remembered his own first day last year.'],
      ['🙋', 'He moved to the seat next to her and said, "Hi, I\'m Theo. Do you like dinosaurs?"'],
      ['🦕', 'Hana\'s eyes lit up, and she pulled a dinosaur book out of her bag.'],
      ['📖', 'They talked about T. rex all the way to school.'],
      ['🍎', 'At lunch, Hana saved Theo a seat.'],
    ], qs: [
      [1, 'Where did Theo first meet Hana?', 'on the school bus', [['in the lunchroom', 'sequence_confusion'], ['at the library', 'detail_not_in_text']], 'Hana sat alone on the bus, and Theo moved to the seat next to her.'],
      [3, 'How did Hana probably feel at the start of the story?', 'lonely and nervous', [['excited and silly', 'feeling_from_wrong_part'], ['angry at Theo', 'unsupported_inference']], 'She sat alone, stared out the window and held her backpack tightly. Those are clues she felt lonely and nervous.'],
      [2, 'Why did Theo decide to sit with Hana?', 'he remembered how his own first day felt', [['he wanted to read her book', 'unsupported_inference'], ['the bus was full', 'unsupported_inference']], 'Theo remembered his own first day last year, so he knew how Hana felt.'],
      [3, 'Which detail shows that Hana and Theo became friends?', 'she saved him a seat at lunch', [['she held her backpack tightly', 'detail_not_asked'], ['she stared out the window', 'detail_not_asked']], 'Saving someone a seat is a friendly thing to do. The other details are from before they met.'],
    ] },
    { title: 'Kites over Ahmedabad', lines: [
      ['☀️', 'Every January, Arjun\'s family goes to the kite festival in Ahmedabad, India.'],
      ['🏠', 'Hundreds of people stand on their rooftops and fly bright kites.'],
      ['🧵', 'This year, Arjun wanted to fly his own kite without any help.'],
      ['🌬️', 'He ran across the roof, but his kite flipped and crashed again and again.'],
      ['👴', 'His grandfather said, "Wait for the wind, then let the string out slowly."'],
      ['🙂', 'Arjun stood still until he felt a breeze on his face.'],
      ['⬆️', 'He let the string slide through his fingers, and the kite climbed into the sky.'],
      ['🎉', 'Grandpa clapped and shouted, "Now you are a kite flyer!"'],
    ], qs: [
      [1, 'Where do people fly kites at this festival?', 'on their rooftops', [['in a big field', 'prior_knowledge_over_text'], ['at the beach', 'detail_not_in_text']], 'The story says hundreds of people stand on their rooftops to fly kites.'],
      [2, 'What problem did Arjun have at first?', 'his kite kept crashing', [['he could not find his kite', 'detail_not_in_text'], ['the festival was over', 'unsupported_inference']], 'When he ran across the roof, his kite flipped and crashed again and again.'],
      [2, 'What did Arjun do differently after his grandfather spoke?', 'waited for a breeze and let the string out slowly', [['ran faster across the roof', 'ignores_clue'], ['let Grandpa fly the kite', 'wrong_character']], 'Grandpa said to wait for the wind and let the string out slowly, and that is what Arjun did.'],
      [3, 'What lesson does Arjun learn?', 'being patient can help you succeed', [['kites come in bright colors', 'detail_not_lesson'], ['running fast is the best way to fly a kite', 'opposite_lesson']], 'Running did not work. When Arjun waited for the wind, the kite flew. Patience helped.'],
    ] },
    { title: 'Two Tellings: Small Friends Help', lines: [
      ['📘', 'Story 1: The Lion and the Mouse'],
      ['🦁', 'A lion caught a tiny mouse under his paw.'],
      ['🐭', '"Please let me go, and one day I will help you," squeaked the mouse.'],
      ['😂', 'The lion laughed, but he let the mouse go.'],
      ['🕸️', 'Later, hunters trapped the lion in a net, and the mouse chewed the ropes until he was free.'],
      ['📗', 'Story 2: The Elephants and the Mice (a story from India)'],
      ['🐘', 'A herd of elephants kept stomping through a village of mice on the way to the lake.'],
      ['👑', 'The mouse king asked them to take another path, and the elephant king agreed.'],
      ['🕸️', 'Later, hunters caught the elephants in strong nets.'],
      ['🐭', 'The mice came at night and chewed through the nets, and the elephants went free.'],
    ], qs: [
      [1, 'In Story 1, who set the lion free?', 'the mouse', [['the hunters', 'wrong_character'], ['the elephant king', 'wrong_character']], 'In Story 1, the mouse chewed the ropes until the lion was free.'],
      [2, 'In Story 2, what did the mouse king ask the elephants to do?', 'take another path', [['chew through the nets', 'sequence_confusion'], ['let the mice ride on their backs', 'detail_not_in_text']], 'The mouse king asked them to take another path so they would stop stomping on the village.'],
      [3, 'How are the two stories alike?', 'small animals help big animals escape from nets', [['a lion laughs at a mouse in both', 'overgeneralized_comparison'], ['both happen in a village of mice', 'overgeneralized_comparison']], 'Only Story 1 has a lion, and only Story 2 has a village. In both, little animals chew through nets to free big ones.'],
      [3, 'What lesson do both stories teach?', 'even someone small can help someone big', [['elephants are stronger than lions', 'detail_not_lesson'], ['never trust a mouse', 'opposite_lesson']], 'In both tellings the big animals did not expect help from tiny mice, but the mice saved them.'],
    ] },
  ],
  reserve: { title: 'The Science Fair Volcano', lines: [
    ['🌋', 'Kayla built a volcano out of clay for the science fair.'],
    ['🧪', 'To make it erupt, she mixed baking soda and vinegar.'],
    ['😮', 'At home, the foam spilled over the top just like real lava.'],
    ['🏫', 'At the fair, Kayla poured in the vinegar, but nothing happened.'],
    ['😟', 'Her face felt hot as the judges waited.'],
    ['🔍', 'She looked closely and saw that the baking soda was still in her bag.'],
    ['😅', 'Kayla laughed, added the baking soda, and the volcano bubbled over.'],
    ['🏅', 'One judge smiled and said, "Good scientists check their steps!"'],
  ], qs: [
    [1, 'What did Kayla use to build her volcano?', 'clay', [['baking soda', 'detail_not_asked'], ['paper', 'detail_not_in_text']], 'The first sentence says she built it out of clay. Baking soda made it erupt.'],
    [2, 'Why did nothing happen at first at the fair?', 'she forgot to add the baking soda', [['the vinegar was too old', 'unsupported_inference'], ['the clay was broken', 'unsupported_inference']], 'Kayla saw that the baking soda was still in her bag.'],
    [3, 'How did Kayla respond to the problem?', 'she stayed calm, found the mistake and fixed it', [['she gave up and went home', 'ignores_clue'], ['she asked a judge to fix it', 'wrong_character']], 'She looked closely, found the baking soda, laughed and added it.'],
    [3, 'What did the judge mean by "Good scientists check their steps"?', 'it is smart to look back for mistakes', [['scientists walk carefully on stairs', 'literal_reading'], ['volcanoes can be dangerous', 'detail_not_lesson']], 'Kayla fixed the problem by checking what she had missed. The judge meant checking your work.'],
  ] },
};

/* ------------------------------------------------------------------------ */
/* GRADE 2 INFORMATIONAL: text features                                      */
/* ------------------------------------------------------------------------ */
const textFeatures: Spec = {
  id: 'r2.text-features', strand: 'info', grade: '2', title: 'Grade 2 text features: headings, captions, labels and glossary', kidTitle: 'Page clues', icon: '🗂️',
  standards: ['RI.2.5', 'RI.2.7', 'RI.2.4', 'RI.2.10'], prereqs: ['r1.text-features', 'r1.info-details'],
  parentTip: 'Before reading a nonfiction page, look at the headings, pictures and captions together and guess what each part will teach.',
  intro: 'Fact pages have helpers: headings name each part, captions tell about pictures, and a glossary explains new words. Use them to find answers fast.',
  verb: 'Read the page.',
  passages: [
    { title: 'Monarch Butterflies', lines: [
      ['🦋', 'Monarchs are orange and black butterflies.'],
      ['📌', 'Heading: A Long Trip'],
      ['🍂', 'Every fall, monarch butterflies migrate south to Mexico.'],
      ['🗺️', 'Some of them fly more than 2,000 miles!'],
      ['🌷', 'In spring, they fly back north.'],
      ['📌', 'Heading: Finding Food'],
      ['🌸', 'Grown monarchs drink nectar from many kinds of flowers.'],
      ['🐛', 'Their caterpillars eat only one plant: milkweed.'],
      ['📷', 'Caption: A monarch caterpillar munches on a milkweed leaf.'],
      ['📖', 'Glossary: migrate means to move to a new place when the seasons change.'],
    ], qs: [
      [1, 'Use the glossary. What does migrate mean?', 'to move to a new place when the seasons change', [['to drink nectar from flowers', 'detail_not_asked'], ['to fly very high', 'context_clue_missed']], 'The glossary line explains it: migrate means to move to a new place when the seasons change.'],
      [2, 'Under which heading can you read about what monarchs eat?', 'Finding Food', [['A Long Trip', 'text_feature_confusion'], ['Monarch Butterflies', 'text_feature_confusion']], 'Eating is about food, and the part under Finding Food tells about nectar and milkweed. Monarch Butterflies is the title.'],
      [2, 'What does the caption tell about the picture?', 'it shows a caterpillar eating milkweed', [['it shows monarchs flying to Mexico', 'text_feature_confusion'], ['it shows a monarch drinking nectar', 'detail_not_asked']], 'The caption says a monarch caterpillar munches on a milkweed leaf.'],
      [3, 'Why would a patch of milkweed be important to monarchs?', 'their caterpillars can eat nothing else', [['monarchs fly to milkweed in Mexico', 'unsupported_inference'], ['milkweed has the most nectar', 'unsupported_inference']], 'The page says caterpillars eat only milkweed, so without it they would have no food.'],
    ] },
    { title: 'Stone Mountain', lines: [
      ['⛰️', 'Stone Mountain is a giant dome of rock near Atlanta, Georgia.'],
      ['📏', 'It rises about 800 feet above the land around it.'],
      ['⛰️', 'It is made of a hard, gray rock called granite.'],
      ['📌', 'Heading: Getting to the Top'],
      ['🥾', 'Many families hike the trail to the top.'],
      ['🚡', 'Others ride a cable car called the Skyride.'],
      ['📌', 'Heading: Plants on the Rock'],
      ['💧', 'Rainwater collects in small dents in the rock.'],
      ['🌼', 'In late summer, tiny yellow daisies grow in cracks in the bare rock.'],
      ['📷', 'Caption: Hikers rest near the top. From here, you can see the tall buildings of Atlanta.'],
    ], qs: [
      [1, 'What is the Skyride?', 'a cable car', [['a hiking trail', 'detail_not_asked'], ['a kind of yellow daisy', 'detail_not_asked']], 'The page says others ride a cable car called the Skyride.'],
      [2, 'Which heading would help you learn about the daisies?', 'Plants on the Rock', [['Getting to the Top', 'text_feature_confusion'], ['Stone Mountain', 'text_feature_confusion']], 'Daisies are plants, so they are in the part under Plants on the Rock. Stone Mountain is the title of the whole page.'],
      [2, 'What does the caption tell you that the rest of the page does not?', 'you can see Atlanta from near the top', [['how tall the mountain is', 'text_feature_confusion'], ['when the daisies grow', 'text_feature_confusion']], 'Only the caption says that from near the top you can see the tall buildings of Atlanta.'],
      [3, 'How are the two ways to get to the top different?', 'one is walking and one is riding', [['both use a cable car', 'overgeneralized_comparison'], ['one is in summer and one is in winter', 'detail_not_in_text']], 'Hiking the trail is walking. The Skyride is a cable car you ride.'],
    ] },
    { title: 'Your Busy Heart', lines: [
      ['❤️', 'Your heart is a muscle about the size of your fist.'],
      ['🔁', 'It pumps blood to every part of your body, all day and all night.'],
      ['✋', 'Put your hand on your chest, and you can feel it beat.'],
      ['🏃', 'When you run, your heart beats faster to send more blood to your muscles.'],
      ['😴', 'When you sleep, it beats more slowly.'],
      ['🏷️', 'Diagram labels: heart, in the middle of your chest. Lungs, on each side of the heart.'],
      ['📖', 'Glossary: muscle means a body part that squeezes and relaxes to make things move.'],
      ['📌', 'Heading: Keep Your Heart Strong'],
      ['⚽', 'Playing outside and eating fruits and vegetables help keep your heart healthy.'],
    ], qs: [
      [1, 'How big is your heart?', 'about the size of your fist', [['as big as your lungs', 'detail_not_in_text'], ['as big as your whole chest', 'detail_misread']], 'The first sentence says your heart is about the size of your fist.'],
      [2, 'Use the labels. Where are your lungs?', 'on each side of the heart', [['in the middle of your chest', 'wrong_part'], ['inside your heart', 'detail_misread']], 'The labels say the heart is in the middle of your chest and the lungs are on each side of it.'],
      [2, 'How is your heart different when you sleep and when you run?', 'it beats slower when you sleep and faster when you run', [['it beats faster when you sleep', 'comparison_confusion'], ['it stops when you sleep and starts when you run', 'unsupported_inference']], 'The page says it beats faster when you run and more slowly when you sleep.'],
      [3, 'Why did the author add the part called Keep Your Heart Strong?', 'to get readers to take care of their hearts', [['to tell how big a heart is', 'topic_too_narrow'], ['to tell a story about a soccer game', 'purpose_confusion']], 'That part tells what you can do, playing outside and eating fruits and vegetables, to keep your heart healthy.'],
    ] },
  ],
  reserve: { title: 'The Okefenokee Swamp', lines: [
    ['🌳', 'The Okefenokee Swamp in south Georgia is one of the biggest swamps in the United States.'],
    ['💧', 'A swamp is wet land where trees grow in shallow water.'],
    ['📌', 'Heading: Animals of the Swamp'],
    ['🐊', 'Alligators float in the dark water with only their eyes showing.'],
    ['🐢', 'Turtles warm themselves in the sun on old logs.'],
    ['🦉', 'At night, owls hoot from the tall cypress trees.'],
    ['📌', 'Heading: Visiting the Swamp'],
    ['🛶', 'Visitors paddle canoes along quiet water trails.'],
    ['👮', 'Rangers teach visitors to stay far away from alligators.'],
    ['📷', 'Caption: A great blue heron hunts for fish at the edge of a water trail.'],
    ['📖', 'Glossary: cypress means a tall tree that can grow in shallow water.'],
  ], qs: [
    [1, 'Use the glossary. What is a cypress?', 'a tall tree that can grow in water', [['a kind of swamp bird', 'detail_misread'], ['a small boat', 'detail_not_asked']], 'The glossary says a cypress is a tall tree that can grow in shallow water.'],
    [2, 'Under which heading can you learn how people explore the swamp?', 'Visiting the Swamp', [['Animals of the Swamp', 'text_feature_confusion'], ['The Okefenokee Swamp', 'text_feature_confusion']], 'The part under Visiting the Swamp tells about canoes and rangers. The Okefenokee Swamp is the title of the whole page.'],
    [2, 'What does the caption tell about?', 'a bird hunting for fish', [['alligators floating in the water', 'text_feature_confusion'], ['owls hooting at night', 'text_feature_confusion']], 'The caption says a great blue heron hunts for fish at the edge of a water trail.'],
    [3, 'Why do rangers tell visitors to stay far away from alligators?', 'alligators can be dangerous', [['alligators are shy and sleepy', 'unsupported_inference'], ['the water trails are closed', 'detail_not_in_text']], 'Rangers keep people safe. Telling visitors to stay far away is a clue that alligators can be dangerous.'],
  ] },
};

/* ------------------------------------------------------------------------ */
/* GRADE 2 INFORMATIONAL: main idea, steps, purpose, comparing two texts      */
/* ------------------------------------------------------------------------ */
const mainIdea: Spec = {
  id: 'r2.main-idea', strand: 'info', grade: '2', title: 'Grade 2 informational text: main idea, connected steps, purpose and two texts', kidTitle: 'Big idea', icon: '💡',
  standards: ['RI.2.2', 'RI.2.3', 'RI.2.6', 'RI.2.8', 'RI.2.9', 'RI.2.10'], prereqs: ['r1.info-details'],
  parentTip: 'After a fact page, ask him to say the main idea in one sentence, then name two details that support it.',
  intro: 'The main idea is what the whole page is about. Details are the facts that support it. Read the page, then think about the big idea.',
  verb: 'Read the page.',
  passages: [
    { title: 'A Can\'s Second Life', lines: [
      ['🥫', 'When you drop a can in the recycling bin, its journey is just beginning.'],
      ['🚛', 'First, a truck takes the can to a recycling center.'],
      ['🧲', 'There, big magnets and machines sort the metal from paper and plastic.'],
      ['🔥', 'Next, the cans are crushed and melted into hot liquid metal.'],
      ['📄', 'The metal cools into thin, flat sheets.'],
      ['🏭', 'Last, a factory shapes the sheets into brand-new cans.'],
      ['♻️', 'A recycled can can be back on a store shelf in about two months!'],
    ], qs: [
      [1, 'What sorts the metal from paper and plastic?', 'magnets and machines', [['the truck driver', 'unsupported_inference'], ['the factory', 'sequence_confusion']], 'The third sentence says big magnets and machines sort the metal.'],
      [2, 'What happens right after the cans are melted?', 'the metal cools into flat sheets', [['a truck takes them away', 'sequence_confusion'], ['magnets sort them', 'sequence_confusion']], 'Next they are melted, then the metal cools into sheets, and last a factory makes new cans.'],
      [3, 'What is the main idea of this page?', 'an old can goes through many steps to become a new can', [['magnets can pick up metal', 'topic_too_narrow'], ['trucks drive to recycling centers', 'topic_too_narrow']], 'Every step on the page is part of one journey: an old can becoming a new one.'],
      [3, 'Why did the author write this page?', 'to explain how a can gets recycled', [['to tell a story about a truck driver', 'purpose_confusion'], ['to get readers to buy new cans', 'purpose_confusion']], 'The page explains the steps, first, next and last, of recycling a can.'],
    ] },
    { title: 'Two Texts: Bat and Ball Games', lines: [
      ['📘', 'Text 1: Baseball'],
      ['⚾', 'Baseball is a popular sport in the United States.'],
      ['🧢', 'A batter hits the ball with a round bat and runs around four bases.'],
      ['👥', 'Each team has nine players on the field.'],
      ['📗', 'Text 2: Cricket'],
      ['🏏', 'Cricket is a popular sport in India.'],
      ['🏃', 'A batter hits the ball with a flat bat and runs between two sets of sticks called wickets.'],
      ['👥', 'Each team has eleven players on the field.'],
    ], qs: [
      [1, 'In Text 2, what are wickets?', 'sets of sticks the batter runs between', [['the four bases in baseball', 'comparison_confusion'], ['flat bats', 'detail_not_asked']], 'Text 2 says the batter runs between two sets of sticks called wickets.'],
      [2, 'How are the bats different?', 'a baseball bat is round and a cricket bat is flat', [['both bats are flat', 'overgeneralized_comparison'], ['a cricket bat is round and a baseball bat is flat', 'comparison_confusion']], 'Text 1 says a round bat and Text 2 says a flat bat.'],
      [3, 'How are baseball and cricket alike?', 'a batter hits a ball and then runs', [['each team has nine players', 'comparison_confusion'], ['both are most popular in India', 'overgeneralized_comparison']], 'Nine players is only baseball and India is only cricket. In both, a batter hits the ball and runs.'],
      [3, 'What is the main topic of both texts?', 'sports where a batter hits a ball', [['the United States', 'topic_too_narrow'], ['how to run very fast', 'topic_too_narrow']], 'Both texts tell about a sport where a batter hits a ball with a bat.'],
    ] },
    { title: 'Why Leaves Change Color', lines: [
      ['🍁', 'In the fall, many leaves turn red, orange and yellow.'],
      ['🌿', 'All summer, leaves are green because of a coloring called chlorophyll.'],
      ['☀️', 'Chlorophyll helps leaves use sunlight to make food for the tree.'],
      ['🌥️', 'In fall, the days get shorter, and there is less sunlight.'],
      ['🍂', 'The tree stops making chlorophyll, so the green fades away.'],
      ['🎨', 'Then the yellow and orange colors that were hiding underneath can finally show.'],
      ['🌳', 'The tree rests all winter and grows new green leaves in spring.'],
    ], qs: [
      [1, 'What makes leaves green in summer?', 'chlorophyll', [['sunlight', 'detail_not_asked'], ['orange coloring', 'detail_misread']], 'The second sentence says leaves are green because of chlorophyll.'],
      [2, 'Where were the yellow and orange colors during the summer?', 'hidden under the green', [['up in the sunlight', 'unsupported_inference'], ['down in the roots', 'detail_not_in_text']], 'The page says the colors were hiding underneath and show when the green fades.'],
      [2, 'Why does the green fade in the fall?', 'the tree stops making chlorophyll', [['the leaves get too much sunlight', 'opposite_cause'], ['the tree grows new leaves', 'sequence_confusion']], 'With shorter days and less sunlight, the tree stops making chlorophyll, so the green fades.'],
      [3, 'What is the main idea of this page?', 'leaves change color when trees stop making chlorophyll in fall', [['leaves help trees make food', 'topic_too_narrow'], ['trees rest all winter', 'topic_too_narrow']], 'The whole page explains why leaves turn red, orange and yellow in fall. The other choices are single details.'],
    ] },
  ],
  reserve: { title: 'Hurricanes', lines: [
    ['🌀', 'A hurricane is a huge storm that forms over warm ocean water.'],
    ['💨', 'Its winds spin in a giant circle and can blow faster than a car on a highway.'],
    ['👁️', 'The calm middle of the storm is called the eye.'],
    ['🌊', 'Strong winds push ocean water up onto the land.'],
    ['🛰️', 'Weather scientists watch hurricanes from space with satellites.'],
    ['🏠', 'They warn people on the coast so families can get ready or move to a safe place.'],
  ], qs: [
    [1, 'What is the calm middle of a hurricane called?', 'the eye', [['the coast', 'detail_not_asked'], ['the circle', 'detail_misread']], 'The page says the calm middle of the storm is called the eye.'],
    [2, 'Why do scientists warn people on the coast?', 'so families can stay safe', [['so families can watch the eye', 'unsupported_inference'], ['so people can go to the ocean', 'opposite_effect']], 'The warnings let families get ready or move to a safe place.'],
    [3, 'Why does the author compare the wind to a car on a highway?', 'to help you picture how fast it blows', [['to tell you to stay in your car', 'unsupported_inference'], ['to show that hurricanes happen on highways', 'literal_reading']], 'Most children know cars on a highway go fast, so the comparison shows how fast the wind blows.'],
    [3, 'What is the main idea of this page?', 'hurricanes are powerful storms that people watch and prepare for', [['the eye of a storm is calm', 'topic_too_narrow'], ['satellites are in space', 'topic_too_narrow']], 'The page tells what hurricanes are, how strong they are, and how people watch and get ready for them.'],
  ] },
};

const SPECS = [storyDetails, infoDetails, characterResponse, textFeatures, mainIdea];
const toSkill = ({ intro, verb, passages, reserve: _reserve, ...s }: Spec): Skill => ({ ...s, subject: 'reading', intro: [{ say: intro }], items: build(s.id, verb, passages, false) });
export const GRADE1_PASSAGE_SKILLS: Skill[] = SPECS.filter(s => s.grade === '1').map(toSkill);
export const GRADE2_PASSAGE_SKILLS: Skill[] = SPECS.filter(s => s.grade === '2').map(toSkill);
export const PASSAGE_SKILL_IDS = SPECS.map(s => s.id);
/** Whole passages held out for the mock: never shown in practice. */
export const PASSAGE_MOCK: Item[] = SPECS.flatMap(s => s.reserve ? build(s.id, s.verb, [s.reserve], true) : []);
