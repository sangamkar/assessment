import type { Difficulty, Skill } from './types';
import { items, txt } from './helpers';

/**
 * Row: [difficulty, prompt, correct, wrong choices as [text, misconception], explanation naming the clue].
 * Difficulty: 1 = one clear clue, 2 = two clues to put together, 3 = a reason or trait that is never stated.
 * Ids are positional: edit in place, append only.
 */
type Wrong = readonly [text: string, why: string];
type Row = readonly [d: Difficulty, say: string, answer: string, wrong: readonly Wrong[], explain: string];
const kindergarten: readonly Row[] = [
  [2, 'Mia puts on her rain boots and opens her umbrella before she walks outside. What is the weather probably like?', 'rainy', [['sunny and hot', 'ignores_clue'], ['snowy', 'clue_partly_used']], 'Rain boots fit snow too, but an umbrella is for rain. Both clues together say rainy.'],
  [1, 'A puppy yawns, curls up on its bed and closes its eyes. What is the puppy ready to do?', 'sleep', [['play fetch', 'ignores_clue'], ['eat dinner', 'unsupported_inference']], 'Yawning, curling up and closing its eyes are clues the puppy is ready to sleep.'],
  [2, 'Leo played soccer in the hot sun. Then he held an empty cup under the faucet. What does he probably want?', 'a drink of water', [['a snack', 'unsupported_inference'], ['to play more soccer', 'ignores_clue']], 'Playing in the hot sun makes you thirsty, and the cup is under the faucet. He wants water to drink.'],
  [1, 'Snow covers the ground. Nia puts on mittens, a hat and a thick coat. How does it probably feel outside?', 'cold', [['hot', 'opposite_inference'], ['rainy', 'unsupported_inference']], 'Snow, mittens and a thick coat are clues that it is cold.'],
  [2, 'A kitten hears a can open. It runs to its bowl and meows. What does the kitten probably want?', 'its dinner', [['a bath', 'unsupported_inference'], ['to go outside', 'unsupported_inference']], 'The sound of a can and running to its bowl are clues that the kitten wants to eat.'],
  [2, 'Raj waited by the window all morning. When his best friend\'s car pulled up, he jumped and clapped. How does Raj probably feel?', 'excited', [['sleepy', 'ignores_clue'], ['scared', 'unsupported_inference']], 'Jumping and clapping when his friend came are clues that Raj is excited.'],
  [1, 'A girl puts a seed in the soil and pours water on it. What does she hope will happen?', 'a plant will grow', [['the soil will dry up', 'opposite_inference'], ['a bird will eat the seed', 'unsupported_inference']], 'She planted a seed and watered it, so she hopes it grows into a plant.'],
  [1, 'The lights are off. The moon and stars shine through the window. Dad reads one more bedtime story. What time of day is it?', 'night', [['morning', 'ignores_clue'], ['lunchtime', 'ignores_clue']], 'The moon, the stars and a bedtime story are clues that it is night.'],
];
const first: readonly Row[] = [
  [2, 'Ava reread the note from her friend. Then she packed a towel and her swimsuit. Where is she probably going?', 'to a pool', [['to a library', 'ignores_clue'], ['to a sleepover', 'clue_partly_used']], 'A towel could go to a sleepover, but a swimsuit is for swimming. Both clues point to a pool.'],
  [2, 'The class heard a loud rumble of thunder. The sky turned dark gray, and Ms. Lane said, "Everyone inside, please!" Why did the class go inside?', 'a storm was coming', [['it was time for lunch', 'unsupported_inference'], ['the sun was too bright', 'ignores_clue']], 'Thunder and a dark gray sky are clues that a storm was coming.'],
  [2, 'Sam read a recipe. He set out flour, eggs, sugar and a mixing bowl. Then he turned on the oven. What is Sam probably going to do?', 'bake something', [['wash the dishes', 'unsupported_inference'], ['make a salad', 'clue_partly_used']], 'Flour, eggs and sugar go in baked foods, and he turned on the oven. He is going to bake.'],
  [2, 'Rosa stepped outside. The path was muddy, the leaves were dripping, and there were puddles everywhere. What probably happened before she came out?', 'it rained', [['it was a hot, dry day', 'ignores_clue'], ['someone washed the car', 'clue_partly_used']], 'A car wash could make one puddle, but mud, dripping leaves and puddles everywhere mean it rained.'],
  [3, 'Zoe saw her neighbor carrying heavy boxes. She ran over and held the door open. What can you tell about Zoe?', 'she is helpful', [['she is in a hurry', 'unsupported_inference'], ['she wanted a box', 'unsupported_inference']], 'Zoe ran over to hold the door for someone with heavy boxes. That shows she is helpful.'],
  [2, 'A robin carried twigs and grass to a branch again and again. A few days later, three blue eggs sat there. What was the robin building?', 'a nest', [['a place to hide food', 'unsupported_inference'], ['a perch to sing on', 'clue_partly_used']], 'Twigs and grass on a branch, and then eggs in that spot, are clues the robin built a nest.'],
  [3, 'Ben came to a fork in the trail. He read the sign twice, then turned left toward the lake. Why did Ben read the sign?', 'to find the way to the lake', [['to see how many people hiked there', 'unsupported_inference'], ['to rest his legs', 'unsupported_inference']], 'At a fork you must choose a path. After reading the sign, Ben chose the path to the lake.'],
  [3, 'Kai left a glass of ice on the picnic table on a hot day. An hour later, the glass was full of water and the ice was gone. What made the ice change?', 'the heat melted it', [['someone put it in a freezer', 'opposite_inference'], ['the glass got colder', 'opposite_inference']], 'It was a hot day and the ice turned to water. Heat melts ice.'],
];
function skill(id: string, grade: 'K' | '1', rows: readonly Row[]): Skill {
  return { id, subject: 'reading', strand: 'lit', grade, title: `${grade === 'K' ? 'Kindergarten' : 'Grade 1'}: make simple inferences`, kidTitle: grade === 'K' ? 'Picture clues' : 'Use story clues', icon: '🔎', standards: grade === 'K' ? ['RL.K.1', 'RL.K.3'] : ['RL.1.1', 'RL.1.3'], prereqs: [], parentTip: 'Ask which clue helped explain the answer.', intro: [{say:'Clues in a story can help us figure out an answer.'}], items: build(id, rows, false) };
}
function build(id: string, rows: readonly Row[], reserve: boolean) {
  return items(reserve ? `${id}.reserved-reading` : id, rows.map(([difficulty, say, answer, wrong, explain]) => ({ difficulty, say, choices: [txt(answer), ...wrong.map(([text, why]) => txt(text, why))], explain }))).map(item => ({...item, skill: id}));
}
export const READING_INFERENCE_SKILLS = [skill('r.inference-k', 'K', kindergarten), skill('r1.inference', '1', first)];

const heldOut: readonly {id:string; rows:readonly Row[]}[] = [
  {id:'r.inference-k', rows:[
    [1, 'Tara yawns, rubs her eyes and puts her head on her pillow. What is she ready to do?', 'go to sleep', [['ride her bike', 'ignores_clue'], ['eat breakfast', 'unsupported_inference']], 'Yawning, rubbing her eyes and lying on her pillow are clues that Tara is ready to sleep.'],
    [2, 'Buddy the dog scratches at the back door. He wags his tail and looks at his leash. What does Buddy probably want?', 'to go for a walk', [['to take a nap', 'ignores_clue'], ['to eat his food', 'unsupported_inference']], 'Scratching at the door and looking at his leash are clues Buddy wants a walk.'],
    [2, 'Omar fell off his scooter. Now he has a bandage on his knee. What probably happened to his knee?', 'he scraped it', [['a bug bit it', 'unsupported_inference'], ['it got muddy', 'unsupported_inference']], 'He fell off his scooter and needed a bandage, so he probably scraped his knee.'],
    [2, 'Mom puts six candles on a cake. Friends come over with gifts and sing a song. What are they celebrating?', 'a birthday', [['the first day of school', 'unsupported_inference'], ['a snow day', 'ignores_clue']], 'Candles on a cake, gifts and a song are clues for a birthday party.'],
  ]},
  {id:'r1.inference', rows:[
    [3, 'A girl returned a book to the library desk. The librarian put it back on the shelf in its place. Why did the librarian do that?', 'so the next reader can find it', [['to keep the book for herself', 'unsupported_inference'], ['because the book was broken', 'unsupported_inference']], 'Library books have a place on the shelf so the next reader can find them.'],
    [2, 'Niko buckled his helmet and pumped air into both tires. Then he rolled out of the driveway. What is Niko riding?', 'a bike', [['a skateboard', 'clue_partly_used'], ['a car', 'clue_partly_used']], 'A helmet and two tires to pump up are clues for a bike.'],
    [3, 'The baker smelled smoke and rushed to turn off the oven. Why did she hurry?', 'the food might be burning', [['the oven was too cold', 'opposite_inference'], ['she wanted to bake more bread', 'unsupported_inference']], 'Smoke from an oven means food may be burning, so she rushed to turn it off.'],
    [2, 'A storm made the power go out, and the house went dark. Ella grabbed a flashlight. How did the flashlight help her?', 'it gave her light to see', [['it kept the food cold', 'unsupported_inference'], ['it turned the power back on', 'unsupported_inference']], 'The house was dark, and a flashlight makes light so Ella could see.'],
  ]},
];
export const READING_INFERENCE_MOCK = heldOut.flatMap(({id,rows}) => build(id, rows, true));
