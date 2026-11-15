import type { Skill } from './types';
import { items, txt } from './helpers';

const kindergarten = [
  ['Mia puts on boots and carries an umbrella. Rain falls outside. What is the weather?', 'rainy', 'sunny', 'snowy'],
  ['A puppy curls up and closes its eyes. What is the puppy probably ready to do?', 'sleep', 'swim', 'eat'],
  ['Leo holds an empty cup under the faucet. What does he probably want?', 'water', 'sand', 'a shoe'],
  ['The snow covers the ground. Nia puts on mittens. How does it probably feel outside?', 'cold', 'hot', 'warm'],
  ['A kitten hears a can open and runs to its food bowl. What might it want?', 'food', 'a bath', 'a book'],
  ['A boy smiles when his friend arrives. How does he probably feel?', 'happy', 'sleepy', 'cold'],
  ['A girl puts a seed in soil and pours water on it. What does she hope will grow?', 'a plant', 'a car', 'a spoon'],
  ['The lights are off and the stars are out. What time is it probably?', 'night', 'morning', 'lunchtime'],
] as const;
const first = [
  ['Ava reread the note and packed a towel and swimsuit. Where might she be going?', 'to a pool', 'to a library', 'to a bakery'],
  ['The class heard thunder, and everyone hurried indoors. Why did they go inside?', 'a storm might be coming', 'the sun became brighter', 'they wanted to plant seeds'],
  ['Sam checked the recipe and set out flour, eggs, and a bowl. What is Sam likely to do?', 'make food', 'wash a car', 'draw a map'],
  ['The path was muddy and the leaves were wet. What probably happened earlier?', 'it rained', 'it snowed indoors', 'the sun dried everything'],
  ['Zoe held the door while her neighbor carried boxes. What can you infer about Zoe?', 'she wanted to help', 'she hid the boxes', 'she wanted to close the door'],
  ['The bird carried twigs to a branch again and again. What might the bird be building?', 'a nest', 'a boat', 'a tunnel'],
  ['Ben read the sign twice before choosing a trail. Why did he read it?', 'to find his way', 'to make the trail longer', 'to change the weather'],
  ['The ice in the glass became water on the warm table. What probably caused the change?', 'warmth melted the ice', 'the glass grew taller', 'the water turned into snow'],
] as const;
function skill(id: string, grade: 'K' | '1', rows: readonly (readonly [string,string,string,string])[]): Skill {
  return { id, subject: 'reading', strand: 'lit', grade, title: `${grade === 'K' ? 'Kindergarten' : 'Grade 1'}: make simple inferences`, kidTitle: grade === 'K' ? 'Picture clues' : 'Use story clues', icon: '🔎', standards: ['IXL Skill Plan: Inference'], prereqs: [], parentTip: 'Ask which clue helped explain the answer.', intro: [{say:'Clues in a story can help us figure out an answer.'}], items: items(id, rows.map(([say, answer, wrong1, wrong2]) => ({ difficulty: 1 as const, say, choices: [txt(answer), txt(wrong1, 'inference_confusion'), txt(wrong2, 'inference_confusion')], explain: `The story clues support this answer: ${answer}.` }))) };
}
export const READING_INFERENCE_SKILLS = [skill('r.inference-k', 'K', kindergarten), skill('r1.inference', '1', first)];

const heldOut: readonly {id:string; rows:readonly (readonly [string,string,string,string])[]}[] = [
  {id:'r.inference-k', rows:[
    ['Tara yawns and puts her head on her pillow. What is she probably ready to do?', 'sleep', 'swim', 'ride a bike'],
    ['The dog scratches at the closed door and looks outside. What might it want?', 'to go outside', 'to wear a hat', 'to read a book'],
    ['A child puts a bandage on a scraped knee. What probably happened?', 'the knee got a scrape', 'the child found a balloon', 'the sun went down'],
    ['A child puts a birthday candle on a cake. What might the child be celebrating?', 'a birthday', 'a snowfall', 'bedtime'],
  ]},
  {id:'r1.inference', rows:[
    ['The librarian put a returned book back on its shelf. Why did she do that?', 'so someone else could find it', 'to make the book wet', 'to turn off the lights'],
    ['Niko put on a helmet and checked the tires before leaving. What might Niko ride?', 'a bicycle', 'a pillow', 'a plate'],
    ['The baker smelled smoke and quickly turned off the oven. Why?', 'the food might be burning', 'the oven was too cold', 'the bread was still flour'],
    ['Ella brought a flashlight because the power was out. How would it help?', 'it would provide light', 'it would turn on the refrigerator', 'it would make the room colder'],
  ]},
];
export const READING_INFERENCE_MOCK = heldOut.flatMap(({id,rows}) => items(`${id}.reserved-reading`, rows.map(([say, answer, wrong1, wrong2]) => ({ difficulty:2 as const, say, choices:[txt(answer),txt(wrong1,'inference_confusion'),txt(wrong2,'inference_confusion')], explain:`The clues support this answer: ${answer}.` }))).map(item => ({...item, skill:id})));
