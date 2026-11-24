import type { WordSkillSpec } from './wordEngine';
import { spell } from './util';

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const VOWEL_NAME: Record<string, string> = { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u' };

/* ---------------------------------------------------------------- magic e vs short vowel (Grade 1) */
export const MAGIC_E: WordSkillSpec = {
  id: 'r1.magic-e-words', grade: '1', title: 'Read silent-e (long vowel) and short-vowel look-alikes', kidTitle: 'Magic e or not?', icon: '🪄',
  standards: ['RF.1.3c', 'RF.1.3b'], prereqs: ['r1.silente'],
  parentTip: 'Write pairs on paper: kit / kite, cap / cape, hop / hope. Cover the e with a finger and read both ways.',
  intro: [{ say: 'Look at the end of the word. A silent e makes the vowel say its name. No e? The vowel makes its short sound.', visual: { kind: 'row', items: [{ kind: 'text', text: 'kit', size: 'lg' }, { kind: 'text', text: 'kite', size: 'lg' }] } }],
  vowelTag: 'short_long_vowel_confusion', pattern: /[aeiou][^aeiou]?e?$|[aeiou][^aeiou]e/,
  note: (w) => {
    const m = w.match(/([aeiou])[^aeiou]e$/);
    if (m) return `${cap(w)} ends with a silent e, so the ${VOWEL_NAME[m[1]]} says its name. It is spelled ${spell(w)}.`;
    const v = w.match(/[aeiou]/)?.[0] ?? 'a';
    return `${cap(w)} has no e at the end, so the ${v} makes its short sound. It is spelled ${spell(w)}.`;
  },
  levels: [[
    'kite kit bite kits | I can fly my ___ in the wind.',
    'cap cape cup tap | I wear my ___ on my head when I play ball.',
    'pin pine pen pan | Use a ___ to hold the note on the board.',
    'can cane cone cat | We got a ___ of soup.',
    'hat hate hit heat | Mom put a ___ on her head.',
    'rat rate rot ram | A ___ ran into a tiny hole in the wall.',
    'bike bake bite like | I ride my ___ to the park.',
    'bone done one bond | The dog chews on a ___.',
    'nose not note hose | I smell with my ___.',
    'rose rise rope rows | She smelled the red ___.',
    'five fine fire fig | I have ___ fingers on one hand.',
    'dice dive mice rice | Roll the ___ to play the game.',
    'tub tube tug tab | I wash in the ___.',
  ], [
    'snake snack stake shake | The ___ hissed in the grass.',
    'whale while whole wake | A ___ swims in the sea.',
    'plane plan plant planet | The ___ flew over the clouds.',
    'skate state slate stake | I can ___ on the ice.',
    'rice race rich nice | We ate ___ with beans.',
    'nine nice pine mine | Six plus three is ___.',
    'note not nose vote | She sang a high ___.',
    'hole hold pole hose | The mouse ran into a ___ in the wall.',
    'fire fine five hire | We sat by the warm ___.',
    'rode rod road robe | We ___ the bus to school.',
    'hope hop hoop hose | I ___ it is sunny today.',
    'cute cut cub cure | The baby duck is so ___!',
    'made mad mud maid | Dad ___ a cake for me.',
    'cake cane came lake | We ate ___ at the party.',
  ], [
    'slide slid slice slim | Kids go down the ___ at the park.',
    'smile smell small mile | Her big ___ showed her teeth.',
    'shine shin spine shone | The sun will ___ all day.',
    'invite invent insect inside | I will ___ Sam to my party.',
    'rope robe ripe rip | Climb up the ___ to the top.',
    'huge hug hush hue | An elephant is a ___ animal.',
    'grape grab grade gape | I ate one green ___.',
    'globe glob glove lobe | Find our country on the ___.',
    'white wait while write | Snow is cold and ___.',
    'drove dove drive grove | Mom ___ us to school in the car.',
    'spoke spook spike smoke | The teacher ___ to the class.',
    'stone stove stole tone | He threw a ___ into the pond.',
    'sunrise sunshine surprise sunset | The ___ was pink in the morning.',
  ]],
};

/* ---------------------------------------------------------------- vowel teams (Grade 1) */
const TEAMS: [RegExp, string][] = [
  [/igh/, 'I, G, H work together to say the long i sound'], [/ai/, 'A and I work together to say the long a sound'], [/ay/, 'A and Y work together to say the long a sound'],
  [/ee/, 'Two e letters work together to say the long e sound'], [/ea/, 'E and A work together to say the long e sound'], [/oa/, 'O and A work together to say the long o sound'],
  [/ow/, 'O and W work together to say the long o sound'], [/ie/, 'I and E work together to say the long i sound'], [/ey/, 'E and Y work together to say the long e sound'],
];
const teamNote = (w: string) => {
  const t = TEAMS.find(([re]) => re.test(w));
  return `${cap(w)}: ${t ? t[1] : 'the vowel team makes one long vowel sound'}. It is spelled ${spell(w)}.`;
};
export const VOWEL_TEAMS_1: WordSkillSpec = {
  id: 'r1.vowel-team-words', grade: '1', title: 'Read words with vowel teams ai, ay, ee, ea, oa, ow, igh', kidTitle: 'Vowel team words', icon: '🚣',
  standards: ['RF.1.3c'], prereqs: ['r1.vowelteams'],
  parentTip: 'Say "When two vowels go walking, the first one often does the talking" — then find exceptions together.',
  intro: [{ say: 'Vowel teams are two letters that make one long vowel sound. In boat, O and A team up to say oh.', visual: { kind: 'text', text: 'boat', size: 'xl' } }],
  vowelTag: 'vowel_team_confusion', pattern: /[aeiou][aeiouwy]|igh/, note: teamNote,
  levels: [[
    'rain ran rail main | Take an umbrella in the ___.',
    'tree tee three free | A bird sat in the ___.',
    'goat got boat coat | The ___ ate the grass on the farm.',
    'boat bat boot beat | We sailed the ___ on the lake.',
    'coat cot cat coast | Wear your ___ when it is cold.',
    'sheep shop ship sleep | The ___ said baa.',
    'light lit right night | Turn on the ___ so we can see.',
    'seal sell sail meal | The ___ swam and barked.',
    'peach patch pitch beach | I ate a sweet ___.',
    'train trap trim brain | The ___ goes on the tracks.',
    'soap soup sap snap | Wash your hands with ___.',
    'leaf left lead loaf | A ___ fell from the tree.',
    'bee be bed see',
  ], [
    'snail snap nail sail | A ___ moves slowly and has a shell.',
    'chain chin chair cane | The bike ___ fell off.',
    'eagle angle bagel easel | An ___ flew high in the sky.',
    'road rod red reed | Look both ways before you cross the ___.',
    'bowl bow blow boil | I ate cereal from a ___.',
    'window widow wind wonder | Look out the ___ at the rain.',
    'rainbow raincoat rainy ribbon',
    'snowman snowball showman sandman',
    'tie toe tea ten | Dad wore a ___ with his suit.',
    'night knight nut net | We sleep at ___.',
    'seed sad send speed | Plant the ___ in the dirt.',
    'feet fat fit feel | I have two ___ and ten toes.',
    'play plum plug pray | Let us ___ a game of tag.',
    'stay stray stain sty | Please ___ here and wait for me.',
    'crayon canyon crown cramp | I drew a cat with a red ___.',
  ], [
    'sweet sweat swept sheet | The candy is very ___.',
    'afraid afloat aid paid | The cat was ___ of the big dog.',
    'between beaten beetle better | I sat ___ Mom and Dad.',
    'coach couch cough coat | The ___ blew a whistle at practice.',
    'bright brought bite right | The sun is very ___ today.',
    'throat throw threat thread | My ___ hurts when I have a cold.',
    'raincoat raccoon rainbow ragged | Wear a ___ so you stay dry.',
    'explain explode expand expect | Can you ___ how you got the answer?',
    'teacher teaches cheater feature | My ___ reads us a story.',
    'daylight delight daily dairy | We hiked in the ___ before dark.',
    'flight fight flit fret | We took a ___ on a big plane.',
    'green grain groan grin | The ___ grass grew tall.',
  ]],
};

/* ---------------------------------------------------------------- more vowel teams (Grade 2) */
const TEAMS_2: [RegExp, string][] = [
  [/^(book|foot|hook|wood|shook|cook|good|look|stood|wool)$/, 'Here O, O says the short oo sound, like in book'], [/oo/, 'O, O says the long oo sound, like in moon'],
  [/ew/, 'E and W work together to say oo'], [/ue/, 'U and E work together to say oo'], [/ie/, 'I and E work together to say the long i sound'],
  [/ea(d|th|v|k|f)/, 'Here E and A say the short e sound, like in bread'], [/aw/, 'A and W work together to say aw'], [/au/, 'A and U work together to say aw'],
  [/ea/, 'E and A work together to say the long e sound'], [/ee/, 'Two e letters say the long e sound'],
];
export const VOWEL_TEAMS_2: WordSkillSpec = {
  id: 'r2.vowel-teams', grade: '2', title: 'Read vowel teams oo, ew, ue, ie, ea (bread), aw, au', kidTitle: 'Tricky vowel teams', icon: '🌙',
  standards: ['RF.2.3b'], prereqs: ['r1.vowel-team-words'],
  parentTip: 'Make two columns: oo as in moon and oo as in book. Sort words he finds in a story.',
  intro: [{ say: 'Some vowel teams make more than one sound. O O says oo in moon, but a shorter oo in book.', visual: { kind: 'row', items: [{ kind: 'text', text: 'moon', size: 'lg' }, { kind: 'text', text: 'book', size: 'lg' }] } }],
  vowelTag: 'vowel_team_confusion', pattern: /[aeiou][aeiouw]/,
  note: (w) => {
    const t = TEAMS_2.find(([re]) => re.test(w));
    return `${cap(w)}: ${t ? t[1] : 'look at the vowel team'}. It is spelled ${spell(w)}.`;
  },
  levels: [[
    'moon mean moan mom | The ___ is bright at night.',
    'boot boat bat beet | Put a ___ on each foot.',
    'book back beak boot | I read a ___ about frogs.',
    'foot fort fat food | I hurt my ___ when I tripped.',
    'spoon spin span soon | Eat soup with a ___.',
    'broom bloom brim boom | Sweep the floor with a ___.',
    'hook hoof honk hike | Hang your coat on the ___.',
    'wood wad wed weed | We burn ___ in the fire.',
    'pie pea pig pin | Mom baked an apple ___.',
    'saw sew raw slaw | Dad cut the board with a ___.',
    'paw pay pew pow | The dog hurt its ___.',
    'bread brad bead broad | We made toast from ___.',
  ], [
    'tooth truth toot touch | I lost a ___ today.',
    'feather father feeder further | A bird has a ___ on its wing.',
    'thread throat three tread | Use a needle and ___ to sew.',
    'fries fires flies fry | We ate ___ with ketchup.',
    'yawn yarn lawn dawn | I ___ when I am sleepy.',
    'new now knew news | I got a ___ bike for my birthday.',
    'blew blue blow blur | The wind ___ my hat away.',
    'glue glee gull gleam | Use ___ to stick the paper.',
    'true tree tray trip | Is that story ___ or made up?',
    'chew cheer chess shoe | Please ___ your food slowly.',
    'head heed had herd | Put the hat on your ___.',
  ], [
    'balloon ballot button bloom | I let go of my red ___ and it floated up.',
    'breakfast breaks bracelet bread | I ate eggs for ___.',
    'weather wetter whether feather | The ___ is sunny and warm.',
    'launch lunch laundry haunch | The rocket will ___ into space.',
    'drawing drowning daring dreaming | I made a ___ of my cat.',
    'noodle needle doodle nodule | I slurped a long ___ from my soup.',
    'rooster roaster roster booster | The ___ crowed at sunrise.',
    'heavy heave heady hazy | The box was too ___ to lift.',
    'spread spared speed spade | I ___ jam on my toast.',
    'screw screen scream crew | Use a ___ to hold the boards together.',
    'cartoon carton cotton carry | We watched a funny ___.',
    'dinosaur dinner diner donor | A ___ lived long, long ago.',
  ]],
};

/* ---------------------------------------------------------------- r-controlled vowels (Grade 1) */
export const R_VOWELS: WordSkillSpec = {
  id: 'r1.r-vowel-words', grade: '1', title: 'Read words with ar, or, er, ir, ur', kidTitle: 'Bossy R words', icon: '🏴‍☠️',
  standards: ['RF.1.3', 'RF.2.3'], prereqs: ['r1.rcontrolled'],
  parentTip: 'Bossy R changes the vowel: cat → cart, hot → horse. Read pairs and listen for the change.',
  intro: [{ say: 'When R comes after a vowel, it is bossy and changes the sound. A R says ar, like in car. E R, I R and U R all say er, like in bird.', visual: { kind: 'text', text: 'car  bird  corn', size: 'lg' } }],
  vowelTag: 'r_controlled_confusion', pattern: /[aeiou]r/,
  note: (w) => {
    const m = w.match(/ar|or|er|ir|ur/);
    const sound = m ? ({ ar: 'ar, like in car', or: 'or, like in corn', er: 'er, like in her', ir: 'er, like in bird', ur: 'er, like in turtle' } as Record<string, string>)[m[0]] : 'a bossy R sound';
    return `In ${w}, the letters ${m ? m[0].split('').join(' ') : 'with R'} say ${sound}. It is spelled ${spell(w)}.`;
  },
  levels: [[
    'car cat core curl | We drove in the ___.',
    'star stir stay stair | I saw a bright ___ in the sky.',
    'bird bid bud bard | A ___ sang in the tree.',
    'corn con cord core | We ate ___ on the cob.',
    'horn horse hen torn | Beep the ___ on the bike.',
    'shark shack shirk sharp | A ___ swam in the sea.',
    'girl grill gill curl | The ___ ran to her mom.',
    'shirt shut shift sport | My ___ has a pocket.',
    'yarn yawn yard yearn | The cat plays with a ball of ___.',
    'arm am aim harm | I hurt my ___ when I fell.',
    'barn ban bark burn | The cows sleep in the ___.',
    'fork fox form fort | Eat with a ___ and spoon.',
  ], [
    'scarf scar scare scoff | Wrap a ___ around your neck.',
    'storm store stem story | A big ___ brought rain and wind.',
    'horse house hose hoarse | I rode a ___ on the farm.',
    'purse pure purr nurse | Mom put her keys in her ___.',
    'church chunk crunch chirp | The bells rang at the ___.',
    'turtle tattle title tunnel | A ___ hides in its shell.',
    'burger burner badger bigger | I ate a ___ with cheese.',
    'worm warm worn wore | A ___ wiggled in the dirt.',
    'spider spied spade spine | A ___ spun a web.',
    'ladder letter later leader | Climb the ___ to the roof.',
    'tiger tiler tighter timer | The ___ has orange and black stripes.',
    'butter better bitter butler | Spread ___ on the bread.',
    'hammer hamper hammock hamster | Hit the nail with a ___.',
  ], [
    'perfect perfume prefer perform | Her drawing was ___ with no mistakes.',
    'thirsty thirty thirst thistle | After running, I was very ___.',
    'garden garter grader gander | We grow beans in our ___.',
    'market marker master mark | We buy fruit at the ___.',
    'morning mourning moaning morsel | I eat breakfast in the ___.',
    'hurry hurt hairy hurray | We must ___ or we will be late.',
    'dirty dirt thirty duty | My boots are ___ from the mud.',
    'corner cornet comer cooler | Turn left at the ___.',
    'person poison prison passion | That ___ is my aunt.',
    'forest forget florist fast | Bears live in the ___.',
    'carpet carrot captain crept | The dog slept on the ___.',
    'circle circus cereal cycle | A ball is round like a ___.',
  ]],
};

/* ---------------------------------------------------------------- diphthongs (Grade 2) */
export const DIPHTHONGS: WordSkillSpec = {
  id: 'r2.oi-oy-ou-ow', grade: '2', title: 'Read words with oi, oy, ou, ow', kidTitle: 'Oy and ow words', icon: '🤡',
  standards: ['RF.2.3b'], prereqs: ['r1.vowel-team-words'],
  parentTip: 'oi and oy say "oy!" (coin, boy). ou and ow say "ow!" like when you bump your toe (cloud, cow).',
  intro: [{ say: 'O I and O Y say oy, like in boy. O U and O W can say ow, like when you get hurt. Cow. Cloud.', visual: { kind: 'text', text: 'coin  boy  cloud  cow', size: 'lg' } }],
  vowelTag: 'diphthong_confusion', pattern: /oi|oy|ou|ow/,
  note: (w) => {
    const m = w.match(/oi|oy|ou|ow/);
    const s = m ? (m[0] === 'oi' || m[0] === 'oy' ? 'oy, like in boy' : 'ow, like in cow') : 'one gliding sound';
    return `In ${w}, the letters ${m ? m[0].split('').join(' ') : ''} say ${s}. It is spelled ${spell(w)}.`;
  },
  levels: [[
    'coin con cone corn | I put a ___ in my piggy bank.',
    'boy bay buy bow | The ___ kicked the ball.',
    'cow cot coy claw | The ___ gave us milk.',
    'owl oil own bowl | The ___ hooted at night.',
    'house horse hose mouse | We live in a blue ___.',
    'mouse mouth moss mess | A ___ ate the cheese.',
    'cloud clod clout cold | A gray ___ covered the sun.',
    'crown crow clown crane | The king wore a gold ___.',
    'clown crown clan clone | The ___ had a red nose and big shoes.',
    'toy toe try tow | I share my ___ with my friend.',
    'mouth moth math month | Open your ___ wide.',
    'couch catch cough crouch | We sat on the soft ___.',
  ], [
    'toilet tablet toil toast',
    'shower shoulder shiver show | I take a ___ before bed.',
    'fountain mountain fortune fourteen | Get a drink at the water ___.',
    'mountain mounting maintain fountain | We hiked up the tall ___.',
    'point paint print pint | Do not ___ at people.',
    'soil soul sail soy | Plant the seeds in the ___.',
    'loud load lord lid | The drum is very ___.',
    'ground grand grind grown | The apple fell to the ___.',
    'round rained rind raid | A ball is ___.',
    'found fund fond foul | I ___ my lost shoe under the bed.',
    'brown brawn brain bran | The bear has ___ fur.',
    'enjoy envoy engine employ | I ___ reading books.',
    'voice vice vote vase | Use your quiet ___ in the library.',
  ], [
    'howl hole hall hail | Wolves ___ at the moon.',
    'flower flour floor flavor | A ___ grew in the garden.',
    'allow alley alloy allot | Mom will ___ us to stay up late.',
    'boiling bowling bailing booing | The water is ___ in the pot.',
    'cowboy cowbell caboose cowl | The ___ rode his horse.',
    'outside upside outfit aside | Let us play ___ in the sun.',
    'towel tower towed tool | Dry off with a ___.',
    'pouch porch punch peach | The kangaroo carries its baby in a ___.',
    'destroy destiny deploy decoy | The storm can ___ the old barn.',
    'around abound arena aloud | We walked ___ the lake.',
    'noisy nosy noise nicely | The ___ crowd cheered loudly.',
    'royal rival rally reveal | The king lives in a ___ palace.',
  ]],
};

/* ---------------------------------------------------------------- blends and digraphs in longer words (Grade 1) */
export const BLENDS_DIGRAPHS: WordSkillSpec = {
  id: 'r1.blend-digraph-words', grade: '1', title: 'Read words with blends and digraphs (sh, ch, th, wh, ph, ck, ng, tch)', kidTitle: 'Letter team words', icon: '🦀',
  standards: ['RF.1.3a', 'RF.1.3b'], prereqs: ['r1.digraphs'],
  parentTip: 'Point to every letter as he reads. In crab, both c and r are heard; in ship, s and h make one sound.',
  intro: [{ say: 'In a blend you hear both letters, like C R in crab. In a digraph two letters make one new sound, like S H in ship.', visual: { kind: 'text', text: 'crab  ship', size: 'xl' } }],
  vowelTag: 'vowel_confusion',
  note: (w) => {
    const dg = w.match(/tch|sh|ch|th|wh|ph|ck|ng/);
    const bl = w.match(/^(spl|spr|str|squ|scr|shr|[bcfgps]l|[bcdfgpt]r|s[cklmnptw])/);
    const parts: string[] = [];
    if (bl && !(dg && dg.index === 0)) parts.push(`it starts with the blend ${bl[0].split('').join(' ')}, so you hear each letter`);
    if (dg) parts.push(`${dg[0].split('').join(' ')} work together as one sound`);
    return `${cap(w)}: ${parts.join(', and ') || 'read every letter in order'}. It is spelled ${spell(w)}.`;
  },
  levels: [[
    'crab cab carb grab | A ___ walks sideways on the sand.',
    'frog fog from frock | The ___ jumped into the pond.',
    'drum dram dump drip | Bang on the ___.',
    'flag lag flat fig | Wave the ___ at the game.',
    'ship sip chip shop | The ___ sailed across the sea.',
    'fish fist fizz dish | A ___ swims in the pond.',
    'chick check thick kick | The ___ came out of the egg.',
    'shell sell chill smell | I found a ___ at the beach.',
    'duck dock deck tuck | A ___ swims and quacks.',
    'sock sack shock stock | Put on your other ___.',
    'clock lock block click | The ___ says it is time for bed.',
    'truck trick tuck track | The dump ___ is full of rocks.',
    'tent ten dent test | We slept in a ___ when we went camping.',
    'hand had band hard | Raise your ___ to ask a question.',
  ], [
    'thumb thump tomb thud | I hurt my ___ on the door.',
    'three tree there threw | I have ___ toy cars.',
    'whale wheel wall while | A ___ is a huge sea animal.',
    'chair cheer chain hair | Sit in the ___.',
    'cheese chess chose cheers | Mice like to eat ___.',
    'shark sharp chart shack | A ___ has sharp teeth.',
    'phone pony prone shone | I talked to Grandma on the ___.',
    'ring rang rung wing | She wore a gold ___ on her finger.',
    'king kin kind sing | The ___ sat on his throne.',
    'watch wash witch match | My ___ tells the time.',
    'peach preach pinch beach | A ___ is a fuzzy fruit.',
    'glove globe love grove | Put a ___ on each hand.',
    'brick brink bring trick | The wall is made of red ___.',
    'sled sad slid seed | We rode the ___ down the snowy hill.',
    'swan swam swim sway | A white ___ swims on the lake.',
    'plant plan pant planet | Water the ___ so it can grow.',
  ], [
    'skunk sunk stunk spunk | The ___ has a white stripe and a bad smell.',
    'squid squad squib quid | A ___ has ten arms and lives in the sea.',
    'shrimp shrink skimp shrub | A tiny pink ___ swam by.',
    'sloth slot slosh cloth | A ___ hangs from a tree and moves slowly.',
    'sponge spoke plunge spongy | Wash the dishes with a ___.',
    'bridge bride bring badge | We drove over the ___ across the river.',
    'sandwich sandal sandbox sandpit | I packed a ___ for lunch.',
    'mushroom mustard muskrat marsh | A ___ grew under the tree.',
    'dolphin dolly dollop dollar | A ___ jumped out of the water.',
    'elephant elegant element eleven | An ___ has a long trunk.',
    'trophy tropic trolley tiptoe | We won a gold ___ for the race.',
    'dragon dagger drag wagon | The ___ in the story breathed fire.',
    'flamingo flaming flapping flinging | A pink ___ stood on one leg.',
    'cricket ticket cracker crack | A ___ chirped in the grass.',
    'chicken kitchen children thicken | A ___ laid an egg.',
    'pumpkin pumping napkin pump | We carved a ___ for Halloween.',
    'cherries cheers chores cherish | I picked red ___ from the tree.',
  ]],
};

/* ---------------------------------------------------------------- irregular / tricky spellings (Grade 2) */
const TRICKY: [RegExp, string][] = [
  [/^kn/, 'the k is silent'], [/^wr/, 'the w is silent'], [/mb$/, 'the b is silent'], [/stle$|sten$/, 'the t is silent'], [/igh/, 'i, g, h say the long i sound'],
  [/gh$/, 'g, h say f here'], [/gn$/, 'the g is silent'], [/^gh/, 'the h is silent'], [/ch/, 'c, h says k here'], [/c[eiy]/, 'c before e, i or y says s'],
  [/g[eiy]/, 'g before e, i or y can say j'],
];
const TRICKY_WORD: Record<string, string> = {
  busy: 'the u says the short i sound and the s says z', friend: 'the i is silent, so i, e says the short e sound', beautiful: 'e, a, u says yoo',
  answer: 'the w is silent', tongue: 'the u, e at the end is silent', honey: 'the o says the short u sound', money: 'the o says the short u sound',
  monkey: 'the o says the short u sound', island: 'the s is silent', wolf: 'the o says the oo sound, like in book', door: 'o, o says or here',
  heart: 'e, a, r says ar here', school: 'c, h says k here', eye: 'e, y, e says the long i sound', two: 'the w is silent', one: 'it starts with the w sound but no w',
  four: 'o, u, r says or here', eight: 'e, i, g, h says the long a sound',
};
export const TRICKY_SPELLINGS: WordSkillSpec = {
  id: 'r2.tricky-spellings', grade: '2', title: 'Read words with silent letters and irregular spellings', kidTitle: 'Tricky spellings', icon: '🕵️',
  standards: ['RF.2.3e', 'RF.2.3f'], prereqs: ['r1.sight-spell'],
  parentTip: 'Keep a "sneaky letters" list on the fridge: knife, write, lamb, castle. Underline the silent letter.',
  intro: [{ say: 'Some words have sneaky letters you do not hear, like the k in knife. Look at every letter, not just the sounds.', visual: { kind: 'text', text: 'knife', size: 'xl' } }],
  vowelTag: 'spelled_by_sound', tagAll: 'spelled_by_sound',
  note: (w) => {
    const t = TRICKY_WORD[w] ?? TRICKY.find(([re]) => re.test(w))?.[1];
    return `${cap(w)} is spelled ${spell(w)}${t ? ` — ${t}` : '. It does not follow the usual rules, so remember its letters'}.`;
  },
  levels: [[
    'two tow!lookalike_word tu too!homophone_confusion | I have ___ hands.',
    'one won!homophone_confusion own!lookalike_word on!lookalike_word | I have ___ nose.',
    'four for!homophone_confusion fur!lookalike_word foor | A dog has ___ legs.',
    'eight ate!homophone_confusion ait eigt | Four plus four is ___.',
    'eye eey ey aye | I see with my left ___.',
    'heart hart heat!lookalike_word hurt!lookalike_word | My ___ beats fast when I run.',
    'door dore doer dour!lookalike_word | Shut the ___ when you come in.',
    'wolf wulf woolf wool!lookalike_word | A ___ howled at the moon.',
    'honey hunny honny homey!lookalike_word | Bees make ___.',
    'money muny monny many!lookalike_word | I saved my ___ in a jar.',
    'monkey munky monky mankey | A ___ swung from the tree.',
    'school skool scool shool | We read books at ___.',
  ], [
    'knife nife knif kife | Cut the bread with a ___.',
    'knot not!homophone_confusion nott knob!lookalike_word | Tie a ___ in the rope.',
    'ghost gost goast gust!lookalike_word | The ___ said boo!',
    'light lite lit!lookalike_word lihgt | Turn off the ___.',
    'wrench rench wrinch ranch!lookalike_word | Dad fixed the sink with a ___.',
    'tongue tung tounge tong | I lick ice cream with my ___.',
    'castle castel casle cassle | The king lives in a ___.',
    'island iland eyeland ilend | The ___ has water all around it.',
    'juice juse jooce joose | I drink apple ___.',
    'giraffe jiraffe giraf jiraf | A ___ has a long neck.',
    'pencil pensil pencel pencle | Write your name with a ___.',
    'anchor anker ankor ancher | Drop the ___ to stop the boat.',
    'city sity citty sitty | We live in a big ___.',
  ], [
    'laugh laff lauf luff | Funny jokes make me ___.',
    'enough enuff enouf enogh | Do we have ___ cups for everyone?',
    'sign sine sighn sigh!lookalike_word | The ___ says STOP.',
    'climb clime clim climbe | I can ___ up the tree.',
    'lamb lam lamm lab!lookalike_word | A baby sheep is a ___.',
    'write rite!homophone_confusion right!homophone_confusion wrote!lookalike_word | I will ___ my name on my paper.',
    'kneel neel kneal knell!lookalike_word | Please ___ down on the rug.',
    'busy bizzy bisy buzzy | Mom is ___ cooking dinner.',
    'friend frend freind fiend!lookalike_word | My best ___ came over to play.',
    'beautiful butiful beautifull beutiful | The sunset was ___.',
    'wrist rist wrest!lookalike_word rest!lookalike_word | She wore a watch on her ___.',
    'answer anser answr ansir | Do you know the ___?',
    'listen lissen listin lisen | Please ___ to the bird sing.',
    'whistle wissle whisle whistel | The coach blew a ___.',
  ]],
};

export const PHONICS_WORD_SPECS = [MAGIC_E, VOWEL_TEAMS_1, VOWEL_TEAMS_2, R_VOWELS, DIPHTHONGS, BLENDS_DIGRAPHS, TRICKY_SPELLINGS];
