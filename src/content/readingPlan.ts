import type { Difficulty, Item, Skill } from './types';
import { items, txt } from './helpers';

type Row = readonly [prompt: string, answer: string, wrong1: string, wrong2: string, explanation: string];
const soundRows: readonly Row[] = [
  ['Which word has the same middle vowel sound as cat?', 'hat', 'hot', 'hit', 'Cat and hat both have the short a sound.'],
  ['Which word has the same middle vowel sound as bed?', 'leg', 'log', 'lug', 'Bed and leg both have the short e sound.'],
  ['Which word has the same middle vowel sound as pig?', 'sit', 'sat', 'set', 'Pig and sit both have the short i sound.'],
  ['Which word has the same middle vowel sound as dog?', 'fox', 'fix', 'fax', 'Dog and fox both have the short o sound.'],
  ['Which word has the same middle vowel sound as sun?', 'cup', 'cap', 'cop', 'Sun and cup both have the short u sound.'],
  ['Which word has the same middle vowel sound as map?', 'bag', 'big', 'bug', 'Map and bag both have the short a sound.'],
  ['Which word has the same middle vowel sound as ten?', 'hen', 'pan', 'pin', 'Ten and hen both have the short e sound.'],
  ['Which word has the same middle vowel sound as log?', 'pot', 'pet', 'pat', 'Log and pot both have the short o sound.'],
  ['Which word has the same middle vowel sound as fin?', 'win', 'wan', 'won', 'Fin and win both have the short i sound.'],
  ['Which word has the same middle vowel sound as bus?', 'mud', 'mad', 'mid', 'Bus and mud both have the short u sound.'],
  ['Which word has the same middle vowel sound as jam?', 'nap', 'nip', 'nut', 'Jam and nap both have the short a sound.'],
  ['Which word has the same middle vowel sound as web?', 'net', 'nut', 'not', 'Web and net both have the short e sound.'],
];
const rRows: readonly Row[] = [
  ['Which word has the same vowel sound as car?', 'star', 'stir', 'store', 'Car and star both have the ar sound.'],
  ['Which word has the same vowel sound as fork?', 'corn', 'can', 'coin', 'Fork and corn both have the or sound.'],
  ['Which word has the same vowel sound as bird?', 'shirt', 'short', 'shout', 'Bird and shirt both have the er sound.'],
  ['Which word has the same vowel sound as farm?', 'arm', 'air', 'ear', 'Farm and arm both have the ar sound.'],
  ['Which word has the same vowel sound as horn?', 'storm', 'steam', 'stem', 'Horn and storm both have the or sound.'],
  ['Which word has the same vowel sound as turn?', 'burn', 'barn', 'born', 'Turn and burn both have the er sound.'],
  ['Which word has the same vowel sound as dark?', 'park', 'perk', 'pork', 'Dark and park both have the ar sound.'],
  ['Which word has the same vowel sound as for?', 'more', 'mere', 'mare', 'For and more both have the or sound.'],
  ['Which word has the same vowel sound as jar?', 'far', 'fur', 'four', 'Jar and far both have the ar sound.'],
  ['Which word has the same vowel sound as north?', 'short', 'shirt', 'shut', 'North and short both have the or sound.'],
  ['Which word has the same vowel sound as first?', 'third', 'thud', 'thaw', 'First and third both have the er sound.'],
  ['Which word has the same vowel sound as card?', 'yard', 'word', 'year', 'Card and yard both have the ar sound.'],
];
// Avoid dialect-sensitive or multiple-correct choices in each listening task.
const prefixRows: readonly Row[] = [
  ['If you redo a drawing, what do you do?', 'do it again', 'throw it away', 'hide it', 'Re means again, so redo means do again.'],
  ['If you refill a cup, what do you do?', 'fill it again', 'empty it', 'break it', 'Re means again, so refill means fill again.'],
  ['If you reread a book, what do you do?', 'read it again', 'close it forever', 'write it', 'Re means again, so reread means read again.'],
  ['If a door is unlocked, what is true about it?', 'it is not locked', 'it is locked again', 'it is locked twice', 'Un can mean not. Unlocked means not locked, so the door can open.'],
  ['If a toy is unsafe, what is it?', 'not safe', 'very safe', 'new and shiny', 'Un can mean not. Unsafe means not safe.'],
  ['If a box is unopened, what is true?', 'it has not been opened', 'it is empty', 'it is very large', 'Unopened means not opened.'],
  ['If you repack a bag, what do you do?', 'pack it again', 'lose the bag', 'wash the bag', 'Re means again, so repack means pack again.'],
  ['If you untie a knot, what do you do?', 'undo the knot', 'make another knot', 'paint the knot', 'Un can mean undo. Untie means undo the knot.'],
  ['If you replay a song, what do you do?', 'play it again', 'turn the music off', 'draw a song', 'Re means again, so replay means play again.'],
  ['If you rebuild a tower, what do you do?', 'build it again', 'eat it', 'put it in a book', 'Re means again, so rebuild means build again.'],
  ['If a sock is unmatched, what does that mean?', 'it has no matching sock', 'it is made of wool', 'it is on a foot', 'Unmatched means it does not have a match.'],
  ['If you unwrap a gift, what do you do?', 'take off its wrapping', 'put more wrapping on', 'hide it under a bed', 'Unwrap means take the wrapping off.'],
];
const suffixRows: readonly Row[] = [
  ['A playful puppy likes to play. What does playful mean?', 'full of play', 'unable to play', 'asleep all day', 'The ending ful can mean full of.'],
  ['A careless driver does not take care. What does careless mean?', 'without care', 'full of care', 'ready for bed', 'The ending less can mean without.'],
  ['Mina jumped over the puddle. What does the ed ending in jumped tell you?', 'it already happened', 'it will happen tomorrow', 'it is happening right now', 'The ending ed tells about something that already happened, in the past.'],
  ['Two cats are sleeping. How many cats are there?', 'more than one', 'exactly one', 'none', 'The ending s can mean more than one.'],
  ['A helpful friend likes to help. What does helpful mean?', 'ready to help', 'unable to help', 'asleep', 'The ending ful helps make a word meaning full of help.'],
  ['A leafless tree has no leaves. What does leafless mean?', 'without leaves', 'covered in leaves', 'made from a leaf', 'The ending less means without.'],
  ['Ravi painted a picture of a boat. What does the ed ending in painted tell you?', 'he finished painting in the past', 'he will paint next week', 'he is painting right now', 'The ending ed shows the painting already happened.'],
  ['Three dogs are playing. What does the s in dogs tell us?', 'there is more than one dog', 'the dog is small', 'the dog is asleep', 'The ending s can mean more than one.'],
  ['A cloudless sky has no clouds. What does cloudless mean?', 'without clouds', 'full of clouds', 'full of stars', 'The ending less means without.'],
  ['A joyful child feels joy. What does joyful mean?', 'full of joy', 'without joy', 'full of sleep', 'The ending ful can mean full of.'],
  ['Ana waved to the bus driver. What does the ed ending in waved tell you?', 'the waving is over', 'she will wave next month', 'she is waving right now', 'The ending ed (here just d after the e) shows the waving already happened.'],
  ['Four books are on the shelf. What does the s in books tell us?', 'there is more than one book', 'the book is red', 'the book is open', 'The ending s can mean more than one.'],
];
interface Spec { id: string; grade: 'K'|'1'; strand: string; title: string; kidTitle: string; icon: string; rows: readonly Row[]; tag: string; level: (row: Row) => Difficulty }
// Difficulty follows the content: easy-to-hear vowels and common word parts first, look-alike sounds and rarer parts last.
const shortVowelLevel = ([, answer]: Row): Difficulty => /[ao]/.test(answer) ? 1 : /[iu]/.test(answer) ? 2 : 3;
const rLevel = ([, answer]: Row): Difficulty => answer.includes('ar') ? 1 : answer.includes('or') ? 2 : 3;
const prefixLevel = ([say]: Row): Difficulty => /\bre/.test(say) ? 1 : /\b(unsafe|unlocked|unopened)\b/.test(say) ? 2 : 3;
const suffixLevel = ([say]: Row): Difficulty => /less\b/.test(say) ? 3 : /\b(two|three|four)\b/i.test(say) ? 1 : 2;
const specs: Spec[] = [
  {id:'r.vowelsounds', grade:'K', strand:'phonological', title:'Hear and compare short vowel sounds', kidTitle:'Middle sounds', icon:'👂', rows:soundRows, tag:'vowel_sound_confusion', level:shortVowelLevel},
  {id:'r1.rcontrolled', grade:'1', strand:'phonics', title:'Hear r-controlled vowel sounds', kidTitle:'Vowels and R', icon:'🚗', rows:rRows, tag:'vowel_sound_confusion', level:rLevel},
  {id:'r1.prefixes', grade:'1', strand:'vocab', title:'Understand common prefixes', kidTitle:'Word beginnings', icon:'🧩', rows:prefixRows, tag:'word_part_confusion', level:prefixLevel},
  {id:'r1.suffixes', grade:'1', strand:'vocab', title:'Understand common suffixes', kidTitle:'Word endings', icon:'🧱', rows:suffixRows, tag:'word_part_confusion', level:suffixLevel},
];
const makeItems = (s: Spec, rows: readonly Row[], reserve: boolean): Item[] => items(reserve ? `${s.id}.reserved-reading` : s.id, rows.map((row, i) => { const [say, answer, wrong1, wrong2] = row; return {difficulty: s.level(row), say, choices:[txt(answer), txt(wrong1,s.tag), txt(wrong2,s.tag)], explain: rows[i][4]}; })).map(i => ({...i, skill:s.id}));
export const READING_PLAN_SKILLS: Skill[] = specs.map(s => ({id:s.id, subject:'reading', strand:s.strand, grade:s.grade, title:s.title, kidTitle:s.kidTitle, icon:s.icon, standards:['IXL Skill Plan: Reading'], prereqs:[], parentTip:'Ask which sounds or word parts helped with the answer.', intro:[{say:`Let’s practice ${s.title.toLowerCase()}.`}], items:makeItems(s,s.rows.slice(0,8),false)}));
export const READING_PLAN_MOCK: Item[] = specs.flatMap(s => makeItems(s,s.rows.slice(8),true));
