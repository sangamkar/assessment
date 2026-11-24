import type { Difficulty, Item, Rng } from '../types';
import { assemble, choiceCount, fromPlans, makeItem, no, ok, skill, words } from './util';

/* Grade 1–2 vocabulary. Sentences give a clue but never the meaning itself, and no held-out mock word is a target. */

type Plans = Record<Difficulty, ((rng: Rng) => Item)[]>;
const emptyPlans = (): Plans => ({ 1: [], 2: [], 3: [] });
const T: Record<string, string> = { o: 'opposite_meaning', c: 'missed_context_clue', s: 'sounds_like_other_word', m: 'other_meaning_of_word' };

/* ---------------------------------------------------------------- context clues (G1–2) */
// word | meaning | wrong:tag; … | clue words | sentence
const CONTEXT: string[][] = [[
  'famished|very hungry|very sleepy:c;very full:o;very cold:c|ate three bowls of soup|Ben was so famished that he ate three bowls of soup.',
  'filthy|very dirty|very clean:o;very small:c;very fast:c|rolling in the mud and needing a bath|The puppy was filthy after rolling in the mud, so we gave it a bath.',
  'grinned|smiled a big smile|cried:o;yawned:c;frowned:o|she was glad, from ear to ear|Mia was glad, and she grinned from ear to ear.',
  'exhausted|very tired|very excited:c;full of energy:o;very fast:c|after the long race he lay down to rest|Sam was exhausted after the long race, so he lay down to rest.',
  'dashed|ran fast|walked slowly:o;hid:c;sat down:c|to get away from the dog|The rabbit dashed across the yard to get away from the dog.',
  'frightened|scared|happy:o;sleepy:c;angry:c|she hid under her blanket during the thunder|Lily was frightened of the thunder, so she hid under her blanket.',
  'tossed|threw|kicked:c;dropped:c;hid:c|the dog caught it in the air|Jo tossed the ball, and her dog caught it in the air.',
  'scrumptious|very tasty|very hard:c;tasting bad:o;very small:c|we asked for more|The cookies were scrumptious, so we asked for more.',
  'giggling|laughing|crying:o;sleeping:c;singing:c|funny cartoons|My little brother is always giggling at funny cartoons.',
  'plump|round and chubby|very thin:o;very fast:c;very fluffy:c|she eats a lot of food|Our cat is plump because she eats a lot of food.',
  'giant|very big|very small:o;very orange:c;very soft:c|four people had to lift it|The giant pumpkin was so heavy that four people had to lift it.',
  'brief|short|long:o;neat:c;funny:c|I wrote only two sentences|Our teacher asked us to be brief, so I wrote only two sentences.',
], [
  'slippery|smooth and wet, so you might fall|sticky:c;rough and dry:o;very cold:c|I spilled water and almost fell|The floor was slippery after I spilled the water, and I almost fell.',
  'puzzled|confused|angry:c;proud:c;sure of the answer:o|he scratched his head at the riddle|Dad was puzzled by the riddle and scratched his head.',
  'delicate|easily broken|very heavy:c;very cheap:c;very strong:o|we must hold it gently|Grandma’s old vase is delicate, so we must hold it gently.',
  'knead|press and squeeze it|need it:s;cut it:c;cool it:c|for ten minutes until it is soft|Before baking, Mom has to knead the dough for ten minutes until it is soft.',
  'crept|moved quietly|ran loudly:o;jumped high:c;rolled over:c|so the mouse would not hear her coming|The kitten crept toward the toy mouse so it would not hear her coming.',
  'courageous|brave|scared:o;slow:c;tired:c|ran into the burning house to save the dog|The firefighter was courageous and ran into the burning house to save the dog.',
  'evaporated|dried up|got bigger:o;froze:c;splashed:c|the hot sun, and the ground was dry by noon|The puddle evaporated in the hot sun, and the ground was dry by noon.',
  'startled|surprised and scared|made sleepy:o;fed:c;made proud:c|the loud roar made the birds fly away|The lion’s roar was so loud that it startled the birds, and they flew away.',
  'rowdy|loud and wild|quiet and calm:o;hungry:c;sleepy:c|until the teacher clapped for quiet|The class was rowdy until the teacher clapped her hands for quiet.',
  'construct|build|knock down:o;wash:c;hide:c|a fort from blankets and chairs|We will construct a fort from blankets and chairs.',
  'snug|tight|loose:o;dirty:c;old:c|Mom bought me a bigger pair|My shoes were too snug, so Mom bought me a bigger pair.',
  'eager|wanting it very much|not wanting it:o;afraid of it:c;too late for it:c|she counted the days until her birthday party|Rosa was eager for her party and counted the days until it came.',
], [
  'reserved|quiet and shy|chatty:o;saved for later:m;sick:c|usually talkative, but hardly said a word|Ana is usually talkative, but today she was reserved and hardly said a word.',
  'immaculate|perfectly clean|very messy:o;very large:c;brand new:c|unlike his messy room|Unlike his messy room, Max’s desk was immaculate.',
  'treacherous|dangerous|safe:o;pretty:c;short:c|loose rocks and slippery mud|The trail was treacherous, with loose rocks and slippery mud.',
  'ancient|very old|brand new:o;very tall:c;very cold:c|built more than a thousand years ago|The ancient castle was built more than a thousand years ago.',
  'reluctant|not wanting to|excited to:o;able to:c;ready to:c|she stood at the edge for a long time|Lena was reluctant to jump into the cold pool, so she stood at the edge for a long time.',
  'praised|said good things about|yelled at:o;paid:c;ignored:c|for working hard and never giving up|The coach praised the team for working hard and never giving up.',
  'hoard|collect and save|eat right away:o;crack open:c;plant:c|so it has food all winter|The squirrel will hoard nuts in the fall so it has food all winter.',
  'bland|without much taste|too spicy:o;too hot:c;too sweet:c|Dad added salt and pepper|The soup was bland, so Dad added salt and pepper.',
  'astonished|very surprised|bored:o;angry:c;sleepy:c|the magician pulled a rabbit out of his hat|We were astonished when the magician pulled a rabbit out of his hat.',
  'eventually|after a long time|right away:o;every day:c;never:c|it will take many years|The tiny seed will eventually grow into a tall tree, but it will take many years.',
  'cunning|clever and tricky|kind and honest:o;slow:c;hungry:c|tricked the crow into dropping its cheese|The fox was cunning and tricked the crow into dropping its cheese.',
  'cautious|careful|careless:o;cheerful:s;sleepy:c|she looked both ways twice before crossing|Pia is cautious, so she looked both ways twice before crossing.',
]];

export const CONTEXT_CLUES = skill({
  id: 'r1.context-clues', strand: 'vocab', grade: '1', title: 'Use sentence clues to find the meaning of a new word', kidTitle: 'Clue detective', icon: '🔦',
  standards: ['L.1.4a', 'L.2.4a'], prereqs: ['r.word-meanings'],
  parentTip: 'When a book has a new word, cover it and ask, "What word would make sense here?" Then check his guess against the clues.',
  intro: [{ say: 'When you meet a new word, look at the other words around it. They are clues! Ben ate three bowls of soup, so famished must mean very hungry.' }],
  generate: (() => {
    const plans = emptyPlans();
    CONTEXT.forEach((rows, i) => {
      const d = (i + 1) as Difficulty;
      for (const r of rows) {
        const [word, meaning, wrong, clue, sentence] = r.split('|');
        plans[d].push((rng) => makeItem('r1.context-clues', word, d, {
          say: `${sentence} What does ${word} mean?`, show: `What does ${word} mean?`, visual: words(sentence),
          choices: assemble(ok(meaning), rng.shuffle(wrong.split(';')).map((x) => { const [t, k] = x.split(':'); return no(t, T[k]); }), choiceCount(d)),
          explain: `The clue is: ${clue}. So ${word} means ${meaning}.`,
        }));
      }
    });
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- multiple-meaning words (G2) */
// word | meaning A | meaning B | not a meaning | A sentence; A sentence | B sentence; B sentence
const MULTI: [Difficulty, string][] = [
  [1, 'bat|an animal that flies at night|a stick used to hit a ball|a kind of bird|A bat hung upside down in the cave.;The bat ate bugs all night.|Sam hit the ball with his bat.;She swung the bat as hard as she could.'],
  [1, 'bark|the sound a dog makes|the hard outside of a tree|a kind of leaf|We heard the dog bark at the mail carrier.;My puppy has a loud bark.|The bark on the old tree was rough.;A beetle hid under the bark of the log.'],
  [1, 'ring|a circle of metal worn on a finger|to make a bell sound|a kind of rope|Mom wears a gold ring.;The ring was too big for my finger.|The bell will ring at noon.;Did you hear the phone ring?'],
  [1, 'fly|a small bug with wings|to move through the air|to fall down|A fly landed on my sandwich.;Shoo that fly away from the cake.|Birds fly south in the winter.;I want to fly my kite.'],
  [1, 'watch|a small clock worn on the wrist|to look at something for a while|to wash something|My watch says it is three o’clock.;Grandpa gave me a new watch.|We watch the birds at the feeder.;Let us watch the parade.'],
  [1, 'wave|a moving hump of water|to move your hand to say hello|a kind of fish|A big wave splashed us at the beach.;The surfer rode the wave.|Wave to Grandma as she drives away.;The kids wave at the bus driver.'],
  [1, 'park|a place with grass and things to play on|to stop a car and leave it|to paint something|We had a picnic at the park.;The park has a big slide.|Dad will park the car by the store.;You cannot park here.'],
  [1, 'duck|a bird that swims and quacks|to bend down quickly|to run away fast|A duck swam in the pond.;The duck quacked at us.|Duck so the ball does not hit you!;We had to duck under the low branch.'],
  [2, 'trunk|an elephant’s long nose|the thick main stem of a tree|a kind of shoe|The elephant sprayed water with its trunk.;The baby elephant held its mom’s tail with its trunk.|The tree trunk was too wide to hug.;A squirrel ran up the trunk of the oak.'],
  [2, 'bank|a place that keeps money safe|the land along the side of a river|a kind of bench|Dad put money in the bank.;The bank closes at five.|We sat on the bank of the river.;A frog jumped off the muddy bank into the water.'],
  [2, 'light|not heavy|something that helps you see|very fast|The feather is so light it floats.;My backpack is light today.|Turn on the light so we can read.;The light from the lamp was bright.'],
  [2, 'kind|nice and caring|a type or sort|very quiet|It was kind of you to share.;Our neighbor is a kind man.|What kind of fruit do you like?;A robin is a kind of bird.'],
  [2, 'match|a small stick that makes a flame|to go together or be the same|to break into pieces|Only grown-ups should light a match.;The match made a tiny flame.|My socks do not match.;Find the cards that match.'],
  [2, 'fair|a place with rides and games|equal and right for everyone|very far away|We rode the Ferris wheel at the fair.;My pig won a ribbon at the fair.|It is fair to take turns.;That game was not fair.'],
  [2, 'letter|a sign like A or B|a note you send in the mail|a kind of paper bag|B is the second letter.;My name starts with the letter M.|I wrote a letter to my aunt.;The mail carrier brought a letter for Mom.'],
  [2, 'fall|the season after summer|to drop down|to grow taller|Leaves turn red in the fall.;School starts in the fall.|Be careful or you will fall.;Apples fall from the tree.'],
  [3, 'spring|the season after winter|a coil of metal that bounces back|a kind of flower|Flowers bloom in the spring.;We plant seeds every spring.|The toy jumps because of the spring inside.;The old bed has a broken spring.'],
  [3, 'scale|a tool for weighing things|one of the small hard plates on a fish or snake|a kind of ladder|Put the apples on the scale.;The scale says I weigh forty pounds.|A fish scale is shiny.;The snake lost a scale on its tail.'],
  [3, 'pitcher|a jug for pouring|the player who throws the ball to the batter|a picture you paint|Pour the lemonade from the pitcher.;The pitcher was full of milk.|The pitcher threw a fast ball.;Our pitcher struck out the batter.'],
  [3, 'star|a light in the night sky|the most important actor in a show|a kind of planet|I wished on the first star tonight.;The star twinkled above the trees.|She is the star of the school play.;The star of the movie signed my book.'],
  [3, 'rock|a hard stone|to move gently back and forth|to shout loudly|I tripped on a rock.;He skipped a flat rock on the lake.|Mom will rock the baby to sleep.;The boat began to rock in the wind.'],
  [3, 'bill|a bird’s beak|a paper that says how much to pay|a coin|The duck dipped its bill in the water.;A toucan has a big, bright bill.|Dad paid the bill for our dinner.;The water bill came in the mail.'],
];

export const MULTIPLE_MEANING = skill({
  id: 'r2.multiple-meaning', strand: 'vocab', grade: '2', title: 'Multiple-meaning words in context', kidTitle: 'Two-meaning words', icon: '🦇',
  standards: ['L.2.4a', 'L.1.4a'], prereqs: ['r1.context-clues'],
  parentTip: 'Play "bat or bat?": say a sentence with bat, ring or bark and let him act out which meaning you used.',
  intro: [{ say: 'Some words have two meanings. A bat can be an animal or a stick for hitting a ball. The other words in the sentence tell you which one.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🦇' }, { kind: 'emoji', emoji: '🏏' }] } }],
  generate: (() => {
    const plans = emptyPlans();
    for (const [d, line] of MULTI) {
      const [word, a, b, nope, as, bs] = line.split('|');
      const groups: [string, string, string[], string[]][] = [[a, b, as.split(';'), bs.split(';')], [b, a, bs.split(';'), as.split(';')]];
      for (const [mine, other, same, diff] of groups) {
        same.forEach((s, i) => {
          plans[d].push(() => makeItem('r2.multiple-meaning', `${word}-${s}`, d, {
            say: `${s} What does ${word} mean in this sentence?`, show: `What does ${word} mean here?`, visual: words(s),
            choices: [ok(mine), no(other, 'other_meaning_of_word'), no(nope, 'not_a_meaning')],
            explain: `In this sentence, ${word} means ${mine}. It can also mean ${other}, but the other words show which one fits.`,
          }));
          const d2 = Math.min(3, d + 1) as Difficulty;
          plans[d2].push(() => makeItem('r2.multiple-meaning', `${word}-same-${s}`, d2, {
            say: `${s} Which sentence uses ${word} the same way?`, show: `Same meaning of ${word}?`, visual: words(s), speakChoices: true,
            choices: [ok(same[1 - i]), ...diff.map((x) => no(x, 'other_meaning_of_word'))],
            explain: `In both sentences, ${word} means ${mine}. In the other sentences it means ${other}.`,
          }));
        });
      }
    }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- synonyms and antonyms (G1) */
// word synonym antonym related related
const SYN: string[][] = [[
  'big large small tall wide', 'happy glad sad silly busy', 'fast quick slow loud late', 'shut close open turn push', 'tired sleepy awake hungry busy',
  'loud noisy quiet bright proud', 'sick ill well tired hot', 'laugh giggle cry smile sing', 'begin start finish try wait', 'grin smile frown laugh wink',
], [
  'shout yell whisper sing talk', 'rush hurry wait carry climb', 'easy simple hard quick nice', 'near close far over behind', 'below under above beside inside',
  'build make break paint draw', 'brave bold scared loud proud', 'answer reply ask write read', 'tiny little huge round thin', 'rich wealthy poor busy proud',
], [
  'shiny bright dull wet smooth', 'friend pal enemy neighbor cousin', 'pretty lovely ugly shiny neat', 'whole entire partial empty round',
  'gentle tender rough loud sleepy', 'messy sloppy neat tall busy', 'giant enormous tiny tall heavy', 'polite courteous rude quiet shy',
  'difficult tough simple heavy tall', 'end finish start open wait',
]];

export const SYNONYMS_ANTONYMS = skill({
  id: 'r1.synonyms-antonyms', strand: 'vocab', grade: '1', title: 'Synonyms and antonyms', kidTitle: 'Same or opposite', icon: '🔁',
  standards: ['L.1.5', 'L.2.5'], prereqs: ['r.word-meanings'],
  parentTip: 'Play "Same or opposite?" in the car: you say two words (big / large, hot / cold) and he answers.',
  intro: [{ say: 'Synonyms mean almost the same thing, like big and large. Antonyms are opposites, like big and small.', visual: { kind: 'text', text: 'big = large   big ≠ small', size: 'lg' } }],
  generate: (() => {
    const plans = emptyPlans();
    SYN.forEach((rows, i) => {
      const d = (i + 1) as Difficulty;
      for (const r of rows) {
        const [w, syn, ant, rel1, rel2] = r.split(' ');
        plans[d].push((rng) => makeItem('r1.synonyms-antonyms', `syn-${w}`, d, {
          say: `Which word means almost the same as ${w}?`, show: `Same as ${w}`, visual: words(w, 'xl'),
          choices: assemble(ok(syn), [no(ant, 'picked_opposite'), ...rng.shuffle([rel1, rel2]).map((x) => no(x, 'related_but_different'))], choiceCount(d)),
          explain: `${syn} means almost the same as ${w}. ${ant} is the opposite.`,
        }));
        plans[d].push((rng) => makeItem('r1.synonyms-antonyms', `ant-${w}`, d, {
          say: `Which word means the opposite of ${w}?`, show: `Opposite of ${w}`, visual: words(w, 'xl'),
          choices: assemble(ok(ant), [no(syn, 'picked_same_meaning'), ...rng.shuffle([rel1, rel2]).map((x) => no(x, 'related_but_different'))], choiceCount(d)),
          explain: `${ant} is the opposite of ${w}. ${syn} means almost the same as ${w}.`,
        }));
      }
    });
    return fromPlans(plans);
  })(),
});

export const VOCAB_SKILLS_1 = [CONTEXT_CLUES, SYNONYMS_ANTONYMS];
export const VOCAB_SKILLS_2 = [MULTIPLE_MEANING];
