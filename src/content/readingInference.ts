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
