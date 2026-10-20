import type { Skill } from './types';
import { items, pic, txt } from './helpers';

const living: Skill = {
  id: 's.living',
  subject: 'science',
  strand: 'life',
  grade: 'K',
  title: 'Living and nonliving things',
  kidTitle: 'Alive or not?',
  icon: '🌱',
  standards: ['SKL1'],
  prereqs: [],
  parentTip: 'On a walk, point at things and ask "Is it living? Does it grow? Does it need food or water?"',
  intro: [
    { say: 'Living things grow, need food and water, and have babies. A tree is living. A rock is not living.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🌳' }, { kind: 'emoji', emoji: '🪨' }] } },
  ],
  items: items('s.living', [
    { difficulty: 1, say: 'Which one is living?', show: 'Which is living?', choices: [pic('🪨', 'rock', 'living_nonliving_confusion'), pic('🐞', 'ladybug'), pic('🚗', 'car', 'moves_means_alive'), pic('🧸', 'teddy bear', 'looks_alive_means_alive')], explain: 'A ladybug is living. It eats, grows and has babies.' },
    { difficulty: 1, say: 'Which one is NOT living?', show: 'Which is NOT living?', choices: [pic('🌻', 'sunflower', 'plants_not_alive'), pic('🐟', 'fish', 'living_nonliving_confusion'), pic('⚽', 'ball')], explain: 'A ball does not grow, eat or drink. It is not living.' },
    { difficulty: 2, say: 'Which one is living? Be careful!', show: 'Which is living?', choices: [pic('🤖', 'robot', 'moves_means_alive'), pic('🌵', 'cactus'), pic('☁️', 'cloud', 'moves_means_alive'), pic('🔥', 'fire', 'moves_means_alive')], explain: 'A cactus is a plant, and plants are living. Robots, clouds and fire move, but they do not grow from food and water or have babies.' },
    { difficulty: 3, say: 'A car can move, but it is NOT living. Why not?', show: 'Why is a car not living?', choices: [txt('It does not grow or have babies'), txt('It is too big', 'irrelevant_attribute'), txt('It has wheels', 'irrelevant_attribute')], explain: 'Living things grow and make more living things. A car never grows or has baby cars!' },
    { difficulty: 3, say: 'What do ALL living things need?', show: 'All living things need…', choices: [pic('💧', 'water'), pic('📺', 'TV', 'want_vs_need'), pic('🧥', 'a coat', 'human_only_need'), pic('🍬', 'candy', 'want_vs_need')], explain: 'All living things — plants, animals and people — need water.' },
  ]),
};

const babies: Skill = {
  id: 's.babies',
  subject: 'science',
  strand: 'life',
  grade: 'K',
  title: 'Parents and offspring; plants vs animals',
  kidTitle: 'Animal babies',
  icon: '🐣',
  standards: ['SKL1'],
  prereqs: ['s.living'],
  parentTip: 'Look at family photos: "Who do you look like? What is the same? What is different?" Then do the same with animal pictures.',
  intro: [{ say: 'Baby animals look like their parents. A baby cat is called a kitten. A baby dog is a puppy.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🐈' }, { kind: 'emoji', emoji: '🐱' }] } }],
  items: items('s.babies', [
    { difficulty: 1, say: 'Which baby belongs to the hen?', show: 'Whose baby?', visual: { kind: 'emoji', emoji: '🐔', size: 'xl' }, choices: [pic('🐣', 'chick'), pic('🐶', 'puppy', 'parent_offspring_mismatch'), pic('🐸', 'frog', 'parent_offspring_mismatch')], explain: 'A hen is a mother chicken. Her baby is a chick.' },
    { difficulty: 1, say: 'Which one is a plant?', show: 'Which is a plant?', choices: [pic('🦋', 'butterfly', 'plant_animal_confusion'), pic('🌷', 'tulip'), pic('🐛', 'caterpillar', 'plant_animal_confusion')], explain: 'A tulip is a plant. It grows in soil and makes its food from sunlight.' },
    { difficulty: 2, say: 'Which grown-up does this baby grow into?', show: 'What will it grow into?', visual: { kind: 'emoji', emoji: '🐛', size: 'xl', label: 'caterpillar' }, choices: [pic('🐍', 'snake', 'looks_similar_not_related'), pic('🦋', 'butterfly'), pic('🐞', 'ladybug', 'parent_offspring_mismatch')], explain: 'A caterpillar grows into a butterfly. Some babies do not look like their parents at first!' },
    { difficulty: 2, say: 'How is a kitten like its mother cat?', show: 'How is a kitten like its mother?', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🐱' }, { kind: 'emoji', emoji: '🐈' }] }, choices: [txt('It has fur and whiskers'), txt('It is the same size', 'offspring_identical'), txt('It can fly', 'not_true')], explain: 'A kitten has fur, whiskers and a tail like its mother. It is smaller, but it grows.' },
    { difficulty: 3, say: 'A baby frog does not look like its parents. What is a baby frog called?', show: 'A baby frog is a…', visual: { kind: 'emoji', emoji: '🐸', size: 'xl' }, choices: [txt('tadpole'), txt('kitten', 'parent_offspring_mismatch'), txt('chick', 'parent_offspring_mismatch')], explain: 'A baby frog is a tadpole. It swims with a tail, then grows legs.' },
  ]),
};

const animals: Skill = {
  id: 's.animals',
  subject: 'science',
  strand: 'life',
  grade: 'K',
  title: 'Animal features and how they help',
  kidTitle: 'Amazing animals',
  icon: '🦜',
  standards: ['SKL2'],
  prereqs: ['s.living'],
  parentTip: 'At the zoo or in books, ask "What body part helps it swim? Fly? Stay warm?"',
  intro: [{ say: 'Animals have body parts that help them live. Birds have feathers and wings. Fish have fins to swim.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🦜' }, { kind: 'emoji', emoji: '🐟' }] } }],
  items: items('s.animals', [
    { difficulty: 1, say: 'Which animal has feathers?', show: 'Which has feathers?', choices: [pic('🐶', 'dog', 'body_covering_confusion'), pic('🦜', 'parrot'), pic('🐢', 'turtle', 'body_covering_confusion')], explain: 'Birds have feathers. A parrot is a bird.' },
    { difficulty: 1, say: 'Which animal lives in the ocean?', show: 'Which lives in the ocean?', choices: [pic('🐙', 'octopus'), pic('🐿️', 'squirrel', 'habitat_confusion'), pic('🐫', 'camel', 'habitat_confusion')], explain: 'An octopus lives in the ocean.' },
    { difficulty: 2, say: 'Which animal carries its home on its back?', show: 'Carries its home', choices: [pic('🐰', 'rabbit', 'feature_confusion'), pic('🐌', 'snail'), pic('🐝', 'bee', 'feature_confusion')], explain: 'A snail carries its shell on its back. The shell keeps it safe.' },
    { difficulty: 2, say: 'Which animal has scales?', show: 'Which has scales?', choices: [pic('🐍', 'snake'), pic('🐑', 'sheep', 'body_covering_confusion'), pic('🦉', 'owl', 'body_covering_confusion')], explain: 'Snakes and fish are covered in scales. Sheep have wool and owls have feathers.' },
    { difficulty: 3, say: 'A duck has webbed feet. What do webbed feet help a duck do?', show: 'Webbed feet help it…', visual: { kind: 'emoji', emoji: '🦆', size: 'xl' }, choices: [txt('swim'), txt('fly', 'feature_function_confusion'), txt('dig', 'feature_function_confusion')], explain: 'Webbed feet push water like paddles, so ducks swim well.' },
  ]),
};

const plants: Skill = {
  id: 's.plants',
  subject: 'science',
  strand: 'life',
  grade: 'K',
  title: 'What plants need and their parts',
  kidTitle: 'Growing plants',
  icon: '🌻',
  standards: ['SKL2'],
  prereqs: ['s.living'],
  parentTip: 'Grow a bean in a clear cup with a wet paper towel so he can watch the roots and stem appear.',
  intro: [{ say: 'Plants need water, sunlight, air and soil to grow. Roots drink water. Leaves catch sunlight.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '💧' }, { kind: 'emoji', emoji: '☀️' }, { kind: 'emoji', emoji: '🌱' }] } }],
  items: items('s.plants', [
    { difficulty: 1, say: 'What does a plant need to grow?', show: 'A plant needs…', choices: [pic('🍬', 'candy', 'human_wants_for_plants'), pic('💧', 'water'), pic('📺', 'TV', 'human_wants_for_plants')], explain: 'Plants need water to grow.' },
    { difficulty: 2, say: 'Which part of a plant grows under the ground and drinks water?', show: 'Under the ground, drinks water', choices: [txt('roots'), txt('flower', 'plant_part_confusion'), txt('leaves', 'plant_part_confusion')], explain: 'Roots grow under the ground. They drink water and hold the plant in place.' },
    { difficulty: 2, say: 'What does a plant get from the sun?', show: 'From the sun, plants get…', visual: { kind: 'emoji', emoji: '☀️', size: 'xl' }, choices: [txt('light'), txt('soil', 'plant_needs_confusion'), txt('water', 'plant_needs_confusion')], explain: 'Leaves use sunlight to make food for the plant.' },
    { difficulty: 3, say: 'When we eat a carrot, which part of the plant are we eating?', show: 'A carrot is the plant’s…', visual: { kind: 'emoji', emoji: '🥕', size: 'xl' }, choices: [txt('root'), txt('flower', 'plant_part_confusion'), txt('leaf', 'plant_part_confusion'), txt('seed', 'plant_part_confusion')], explain: 'A carrot grows under the ground. It is a root! The green leafy part grows on top.' },
  ]),
};

const senses: Skill = {
  id: 's.senses',
  subject: 'science',
  strand: 'physical',
  grade: 'K',
  title: 'Five senses for observing',
  kidTitle: 'Five senses',
  icon: '👀',
  standards: ['SKP1'],
  prereqs: [],
  parentTip: 'Mystery bag: put an object in a pillowcase. He uses touch only to guess, then tells you which sense he used.',
  intro: [{ say: 'Scientists observe with their senses. We see with our eyes, hear with our ears, smell with our nose, taste with our tongue and touch with our skin.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '👁️' }, { kind: 'emoji', emoji: '👂' }, { kind: 'emoji', emoji: '👃' }, { kind: 'emoji', emoji: '👅' }, { kind: 'emoji', emoji: '✋' }] } }],
  items: items('s.senses', [
    { difficulty: 1, say: 'Which body part do you use to smell a flower?', show: 'Smell a flower with…', visual: { kind: 'emoji', emoji: '🌸' }, choices: [pic('👂', 'ear', 'sense_organ_confusion'), pic('👃', 'nose'), pic('👁️', 'eye', 'sense_organ_confusion')], explain: 'We smell with our nose.' },
    { difficulty: 1, say: 'Which body part do you use to hear a bell?', show: 'Hear a bell with…', visual: { kind: 'emoji', emoji: '🔔' }, choices: [pic('👂', 'ear'), pic('👅', 'tongue', 'sense_organ_confusion'), pic('✋', 'hand', 'sense_organ_confusion')], explain: 'We hear with our ears.' },
    { difficulty: 2, say: 'Which sense tells you a pillow is soft?', show: 'Soft pillow — which sense?', choices: [pic('✋', 'touch'), pic('👁️', 'sight', 'sense_organ_confusion'), pic('👃', 'smell', 'sense_organ_confusion')], explain: 'We feel soft and hard with our sense of touch.' },
    { difficulty: 3, say: 'You are in your bedroom. You cannot see the kitchen, but you know cookies are baking. Which sense told you?', show: 'Cookies baking — which sense?', visual: { kind: 'emoji', emoji: '🍪' }, choices: [pic('👁️', 'sight', 'ignored_constraint'), pic('👃', 'smell'), pic('👅', 'taste', 'sense_organ_confusion'), pic('✋', 'touch', 'sense_organ_confusion')], explain: 'You cannot see them, so it must be your nose! Smells travel through the air.' },
  ]),
};

const materials: Skill = {
  id: 's.materials',
  subject: 'science',
  strand: 'physical',
  grade: 'K',
  title: 'Describe and sort objects by physical properties',
  kidTitle: 'What is it like?',
  icon: '🧱',
  standards: ['SKP1'],
  prereqs: ['s.senses'],
  parentTip: 'Bath-time science: predict sink or float for toys, then test. Was the prediction right?',
  intro: [{ say: 'We can describe things by size, shape, color, how heavy they are, how they feel, and if they sink or float.' }],
  items: items('s.materials', [
    { difficulty: 1, say: 'Which one feels soft?', show: 'Which is soft?', choices: [pic('🪨', 'rock', 'texture_confusion'), pic('🧸', 'teddy bear'), pic('🔨', 'hammer', 'texture_confusion')], explain: 'A teddy bear is soft and squishy.' },
    { difficulty: 2, say: 'Which one will most likely float in water?', show: 'Which will float?', visual: { kind: 'emoji', emoji: '🌊' }, choices: [pic('🪨', 'rock', 'size_predicts_sinking'), pic('🔑', 'key', 'size_predicts_sinking'), pic('🍂', 'leaf')], explain: 'A leaf is light and floats. A rock and a key are heavy for their size, so they sink.' },
    { difficulty: 2, speakChoices: false, say: 'Which one is made of glass?', show: 'Which is made of glass?', choices: [pic('🥛', 'glass of milk'), pic('🧦', 'sock', 'material_confusion'), pic('📦', 'box', 'material_confusion')], explain: 'A drinking glass is made of glass. Glass is hard and you can see through it.' },
    { difficulty: 3, say: 'A big beach ball and a small marble go in water. Which one sinks?', show: 'Which one sinks?', choices: [txt('the small marble'), txt('the big beach ball', 'size_predicts_sinking'), txt('both float', 'size_predicts_sinking')], explain: 'Big does not always mean sinks! The beach ball is full of air, so it floats. The marble is solid glass, so it sinks.' },
  ]),
};

const pushPull: Skill = {
  id: 's.pushpull',
  subject: 'science',
  strand: 'physical',
  grade: 'K',
  title: 'Pushes and pulls change motion',
  kidTitle: 'Push and pull',
  icon: '🛝',
  standards: ['SKP2'],
  prereqs: [],
  parentTip: 'Roll a toy car with a small push and a big push. Which goes farther? Try it on carpet vs. the kitchen floor.',
  intro: [{ say: 'A push moves something away from you. A pull moves something toward you. A bigger push makes it go faster and farther!' }],
  items: items('s.pushpull', [
    { difficulty: 1, say: 'You kick a ball. Is that a push or a pull?', show: 'Kicking a ball is a…', visual: { kind: 'emoji', emoji: '⚽', size: 'xl' }, choices: [txt('push'), txt('pull', 'push_pull_confusion'), txt('neither', 'no_force_idea')], explain: 'Kicking moves the ball away from you, so it is a push.' },
    { difficulty: 1, say: 'You open a drawer toward you. Is that a push or a pull?', show: 'Opening a drawer is a…', choices: [txt('push', 'push_pull_confusion'), txt('pull'), txt('neither', 'no_force_idea')], explain: 'The drawer comes toward you, so it is a pull.' },
    { difficulty: 2, say: 'You want the swing to go higher. What should you do?', show: 'Make the swing go higher', choices: [txt('push it harder'), txt('push it softer', 'force_size_confusion'), txt('do not push', 'no_force_idea')], explain: 'A bigger push makes things move more.' },
    { difficulty: 3, say: 'You give a toy car the same push on three floors. Where will it roll the farthest?', show: 'Where will it roll farthest?', choices: [txt('smooth wood floor'), txt('thick carpet', 'friction_confusion'), txt('sand', 'friction_confusion')], explain: 'Smooth floors let things roll farther. Carpet and sand rub against the wheels and slow them down.' },
  ]),
};

const sky: Skill = {
  id: 's.sky',
  subject: 'science',
  strand: 'earth',
  grade: 'K',
  title: 'Day and night sky (sun, moon, stars)',
  kidTitle: 'Day and night',
  icon: '🌙',
  standards: ['SKE1'],
  prereqs: [],
  parentTip: 'Look for the moon during the day sometimes! Keep a 1-week moon drawing journal.',
  intro: [{ say: 'In the day we see the sun. At night we can see the moon and stars. The sun is a star too — it is just very close!', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '☀️' }, { kind: 'emoji', emoji: '🌙' }, { kind: 'emoji', emoji: '⭐' }] } }],
  items: items('s.sky', [
    { difficulty: 1, say: 'What gives us light and keeps us warm in the day?', show: 'Light and warmth in the day', choices: [pic('🌙', 'moon', 'day_night_confusion'), pic('☀️', 'sun'), pic('☁️', 'cloud', 'sky_object_confusion')], explain: 'The sun gives us light and heat during the day.' },
    { difficulty: 1, speakChoices: false, say: 'Which picture shows night time?', show: 'Which is night?', choices: [pic('🌃', 'night city'), pic('🏖️', 'beach day', 'day_night_confusion'), pic('🌅', 'sunrise', 'day_night_confusion')], explain: 'At night the sky is dark and we can see stars.' },
    { difficulty: 2, say: 'The sun is going down. What comes next?', show: 'After sunset comes…', visual: { kind: 'emoji', emoji: '🌇', size: 'xl' }, choices: [txt('night'), txt('morning', 'day_night_sequence'), txt('lunch time', 'day_night_sequence')], explain: 'After the sun sets, it gets dark and night begins.' },
    { difficulty: 3, say: 'Stars are still in the sky during the day. Why can’t we see them?', show: 'Why can’t we see stars in the day?', choices: [txt('The sun is too bright'), txt('The stars go to sleep', 'stars_disappear_misconception'), txt('The stars move away', 'stars_disappear_misconception')], explain: 'Stars are always there. The sun is so bright that it hides them.' },
  ]),
};

const earth: Skill = {
  id: 's.earth',
  subject: 'science',
  strand: 'earth',
  grade: 'K',
  title: 'Earth materials: rocks, soil, sand',
  kidTitle: 'Rocks and soil',
  icon: '🪨',
  standards: ['SKE2'],
  prereqs: [],
  parentTip: 'Collect 5 rocks outside. Sort them by size, color and smooth vs. rough. Look at sand with a magnifying glass.',
  intro: [{ say: 'Rocks can be big or tiny. Sand is made of very tiny pieces of rock. Soil is where plants grow.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🪨' }, { kind: 'emoji', emoji: '🏖️' }, { kind: 'emoji', emoji: '🌱' }] } }],
  items: items('s.earth', [
    { difficulty: 1, speakChoices: false, say: 'Which one is a rock?', show: 'Which is a rock?', choices: [pic('🪨', 'rock'), pic('🧽', 'sponge', 'material_confusion'), pic('🍞', 'bread', 'material_confusion')], explain: 'A rock is hard and comes from the earth.' },
    { difficulty: 2, say: 'Where do worms like to live?', show: 'Worms live in…', visual: { kind: 'emoji', emoji: '🪱', size: 'xl' }, choices: [txt('soil'), txt('rocks', 'earth_material_confusion'), txt('water bottles', 'not_true')], explain: 'Worms live in soil. They help mix it so plants can grow.' },
    { difficulty: 2, say: 'Sand is made of tiny pieces of what?', show: 'Sand is tiny pieces of…', visual: { kind: 'emoji', emoji: '🏖️', size: 'xl' }, choices: [txt('rock'), txt('sugar', 'looks_similar_not_same'), txt('paper', 'material_confusion')], explain: 'Over a long time, waves break rocks into tiny pieces. That is sand!' },
    { difficulty: 3, say: 'You want to plant a seed. Which will help it grow best?', show: 'Best for planting', choices: [txt('soil'), txt('rocks', 'earth_material_confusion'), txt('dry sand', 'earth_material_confusion')], explain: 'Soil holds water and food for plants. Rocks and dry sand do not.' },
  ]),
};

const stem: Skill = {
  id: 's.stem',
  subject: 'science',
  strand: 'engineering',
  grade: 'K',
  title: 'Engineering design: tools, materials, test and improve',
  kidTitle: 'Build it!',
  icon: '🛠️',
  standards: ['K-2-ETS1-1', 'K-2-ETS1-2'],
  prereqs: [],
  parentTip: 'Weekend challenge: build the tallest tower from 20 paper cups, or a foil boat that holds the most pennies. Test, change one thing, test again.',
  intro: [{ say: 'Engineers solve problems. They plan, build, test, and make it better. If it does not work, that is how we learn!' }],
  items: items('s.stem', [
    { difficulty: 1, say: 'Which tool helps you see a tiny bug up close?', show: 'See a tiny bug up close', choices: [pic('🔍', 'magnifying glass'), pic('🔭', 'telescope', 'tool_function_confusion'), pic('📏', 'ruler', 'tool_function_confusion')], explain: 'A magnifying glass makes small things look bigger. A telescope is for things far away, like stars.' },
    { difficulty: 2, say: 'Which would keep you dry in the rain?', show: 'Keeps you dry', choices: [pic('📰', 'newspaper hat', 'material_property_confusion'), pic('☂️', 'umbrella'), pic('🧶', 'yarn hat', 'material_property_confusion')], explain: 'An umbrella is made of waterproof material. Paper and yarn soak up water.' },
    { difficulty: 2, say: 'You want to build a tall block tower that does not fall. What should go on the bottom?', show: 'What goes on the bottom?', choices: [txt('big, wide blocks'), txt('small blocks', 'stability_confusion'), txt('a ball', 'stability_confusion')], explain: 'Big, wide blocks on the bottom make a strong base.' },
    { difficulty: 3, say: 'Your paper boat sinks. What is the best thing to do next?', show: 'My boat sank! Now what?', choices: [txt('change the design and test again'), txt('give up', 'fixed_mindset'), txt('do the exact same thing again', 'no_iteration')], explain: 'Engineers change one thing and test again. Every try teaches you something!' },
  ]),
};

const weather: Skill = {
  id: 's1.weather',
  subject: 'science',
  strand: 'earth',
  grade: '1',
  title: 'Weather, seasons and weather tools',
  kidTitle: 'Weather watch',
  icon: '🌦️',
  standards: ['S1E1'],
  prereqs: ['s.sky'],
  parentTip: 'Keep a weather chart for a week: draw sun, cloud, rain or snow each morning. Count which weather won.',
  intro: [{ say: 'Weather can be sunny, rainy, cloudy, windy or snowy. There are four seasons: winter, spring, summer and fall.' }],
  items: items('s1.weather', [
    { difficulty: 1, say: 'What should you wear on a snowy day?', show: 'Snowy day', visual: { kind: 'emoji', emoji: '❄️', size: 'xl' }, choices: [pic('🩳', 'shorts', 'weather_clothing_mismatch'), pic('🧥', 'warm coat'), pic('🩴', 'flip flops', 'weather_clothing_mismatch')], explain: 'Snow is cold, so we wear a warm coat.' },
    { difficulty: 2, say: 'Which tool tells how hot or cold it is?', show: 'Hot or cold tool', choices: [pic('🌡️', 'thermometer'), pic('⏰', 'clock', 'tool_function_confusion'), pic('📏', 'ruler', 'tool_function_confusion')], explain: 'A thermometer measures temperature — how hot or cold it is.' },
    { difficulty: 2, say: 'Which season comes after winter?', show: 'After winter comes…', choices: [txt('spring'), txt('fall', 'season_order_confusion'), txt('summer', 'season_order_confusion')], explain: 'Winter, spring, summer, fall. Spring comes after winter, when flowers start to bloom.' },
    { difficulty: 3, say: 'Dark gray clouds are filling the sky. What weather is probably coming?', show: 'Dark gray clouds mean…', visual: { kind: 'emoji', emoji: '☁️', size: 'xl' }, choices: [txt('rain'), txt('a sunny day', 'weather_sign_confusion'), txt('a rainbow right now', 'weather_sign_confusion')], explain: 'Dark, heavy clouds are full of water. Rain is probably coming.' },
  ]),
};

const lifeCycle: Skill = {
  id: 's2.lifecycle',
  subject: 'science',
  strand: 'life',
  grade: '2',
  title: 'Life cycles (butterfly, frog)',
  kidTitle: 'Life cycles',
  icon: '🦋',
  standards: ['S2L1'],
  prereqs: ['s.babies'],
  parentTip: 'Order life-cycle picture cards (egg → caterpillar → chrysalis → butterfly). Many nature centers sell caterpillar kits in spring.',
  intro: [{ say: 'A butterfly starts as a tiny egg. Then it is a caterpillar. Then it makes a chrysalis. Then out comes a butterfly!', visual: { kind: 'sequence', items: ['🥚', '🐛', '🫘', '🦋'], blank: -1 } }],
  items: items('s2.lifecycle', [
    { difficulty: 1, say: 'A butterfly lays an egg. What hatches from the egg?', show: 'What hatches?', visual: { kind: 'emoji', emoji: '🥚', size: 'xl' }, choices: [pic('🐛', 'caterpillar'), pic('🦋', 'butterfly', 'skipped_stage'), pic('🐣', 'chick', 'parent_offspring_mismatch')], explain: 'A caterpillar hatches from a butterfly egg.' },
    { difficulty: 2, say: 'What comes next? Egg, caterpillar, chrysalis, and then…', show: 'What comes next?', visual: { kind: 'sequence', items: ['🥚', '🐛', '🫘', '?'], blank: 3 }, choices: [pic('🦋', 'butterfly'), pic('🥚', 'egg', 'cycle_restart_confusion'), pic('🐛', 'caterpillar', 'stage_order_confusion')], explain: 'After the chrysalis, a butterfly comes out.' },
    { difficulty: 3, say: 'A tadpole grows legs and loses its tail. What does it become?', show: 'A tadpole becomes a…', choices: [pic('🐟', 'fish', 'looks_similar_not_related'), pic('🐸', 'frog'), pic('🦎', 'lizard', 'looks_similar_not_related')], explain: 'A tadpole grows into a frog.' },
  ]),
};

export const SCIENCE_SKILLS: Skill[] = [living, babies, animals, plants, senses, materials, pushPull, sky, earth, stem, weather, lifeCycle];
