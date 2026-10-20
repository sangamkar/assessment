import type { Skill } from './types';
import { items, pic, txt } from './helpers';

/* Grade 1–2 reading he does on his own, plus writing conventions (CCSS ELA / Georgia ELA). */

const vowelTeams: Skill = {
  id: 'r1.vowelteams',
  subject: 'reading',
  strand: 'phonics',
  grade: '1',
  title: 'Vowel teams (ai, ee, ea, oa, igh)',
  kidTitle: 'Vowel teams',
  icon: '👫',
  standards: ['RF.1.3c', 'RF.2.3b'],
  prereqs: ['r1.silente'],
  parentTip: '“When two vowels go walking, the first one does the talking” works for ai, ee, oa. Collect words with each team.',
  intro: [{ say: 'Some vowels work as a team. In boat, the o and a team up and say oh!', visual: { kind: 'text', text: 'boat', size: 'xl' } }],
  items: items('r1.vowelteams', [
    { difficulty: 1, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'boat', size: 'xl' }, choices: [pic('🦇', 'bat', 'vowel_team_ignored'), pic('⛵', 'boat'), pic('🐐', 'goat', 'first_letter_ignored')], explain: 'o and a team up to say oh: b, oh, t. Boat.' },
    { difficulty: 1, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'rain', size: 'xl' }, choices: [pic('🌧️', 'rain'), pic('🏃', 'ran', 'vowel_team_ignored'), pic('🚆', 'train', 'first_letter_ignored')], explain: 'a and i team up to say ay: r, ay, n. Rain.' },
    { difficulty: 2, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'seed', size: 'xl' }, choices: [pic('😢', 'sad', 'vowel_team_ignored'), pic('🌱', 'seed'), pic('🐝', 'bee', 'first_letter_ignored')], explain: 'Double e says ee: s, ee, d. Seed.' },
    { difficulty: 2, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'night', size: 'xl' }, choices: [pic('🥅', 'net', 'vowel_team_ignored'), pic('🛏️', 'bed', 'guessed_from_category'), pic('🌃', 'night')], explain: 'i, g, h together say eye: n, eye, t. Night. The g and h are silent!' },
    { difficulty: 3, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'peach', size: 'xl' }, choices: [pic('🍑', 'peach'), pic('🍐', 'pear', 'final_sound_ignored'), pic('🏖️', 'beach', 'first_letter_ignored')], explain: 'e and a team up to say ee: p, ee, ch. Peach.' },
    { difficulty: 3, say: 'Which word has the same vowel sound as boat?', show: 'Same vowel sound as “boat”', choices: [txt('road'), txt('rod', 'vowel_team_ignored'), txt('bat', 'vowel_team_ignored'), txt('rude', 'vowel_sound_confusion')], speakChoices: false, explain: 'Boat and road both have oa, which says oh.' },
  ]),
};

const PARK = {
  title: 'The Lost Kite',
  lines: [
    { emoji: '🪁', text: 'Nina had a red kite with a long blue tail.' },
    { emoji: '💨', text: 'One windy morning, she ran to the hill to fly it.' },
    { emoji: '🌳', text: 'A strong gust pulled the string out of her hand, and the kite got stuck in a tall oak tree.' },
    { emoji: '😟', text: 'Nina felt worried. She did not want to lose her favorite kite.' },
    { emoji: '👴', text: 'Her grandpa brought a long pole and gently lifted the kite down.' },
    { emoji: '🎉', text: 'Nina tied the string around her wrist so it would not slip again.' },
  ],
};
const OCTOPUS = {
  title: 'Clever Octopuses',
  lines: [
    { emoji: '🐙', text: 'An octopus has eight arms and no bones.' },
    { emoji: '🪨', text: 'Because it has no bones, it can squeeze into tiny cracks between rocks.' },
    { emoji: '🎨', text: 'An octopus can change the color of its skin to match the sand or rocks around it.' },
    { emoji: '🦈', text: 'This helps it hide from hungry sharks.' },
    { emoji: '🫙', text: 'Scientists have even seen octopuses open jars to get food inside!' },
  ],
};
const GARDEN = {
  title: 'Ravi’s Garden',
  lines: [
    { emoji: '👦', text: 'Ravi planted bean seeds in a pot by the window.' },
    { emoji: '💧', text: 'He watered them every morning before school.' },
    { emoji: '🌱', text: 'After a week, tiny green shoots poked out of the soil.' },
    { emoji: '📏', text: 'Ravi measured the plants every Saturday and wrote the numbers in a notebook.' },
    { emoji: '🫘', text: 'By summer, the vines had climbed a stick, and Ravi picked his very own beans for dinner.' },
  ],
};

const readAlone: Skill = {
  id: 'r2.readalone',
  subject: 'reading',
  strand: 'lit',
  grade: '2',
  title: 'Read a passage independently and answer questions',
  kidTitle: 'Read it yourself',
  icon: '📖',
  standards: ['RL.2.1', 'RL.2.3', 'RI.2.1', 'RI.2.2', 'RF.2.4'],
  prereqs: ['r.lit', 'r1.sentence'],
  parentTip: 'After he reads a chapter, ask one “why” question and one “how did they feel” question. Ask him to point to the sentence that proves it.',
  intro: [{ say: 'Now you read the story yourself! Read it carefully, then answer the question. You can look back at the story any time.' }],
  items: items('r2.readalone', [
    { difficulty: 1, say: 'Read the story. Where did the kite get stuck?', show: 'Where did the kite get stuck?', visual: { kind: 'story', ...PARK }, choices: [txt('in a tall oak tree'), txt('on the roof', 'not_in_story'), txt('in a pond', 'not_in_story')], speakChoices: false, explain: 'The story says the kite got stuck in a tall oak tree.' },
    { difficulty: 2, say: 'Read the story. How did Nina feel when the kite got stuck?', show: 'How did Nina feel?', visual: { kind: 'story', ...PARK }, choices: [txt('worried'), txt('sleepy', 'not_in_story'), txt('angry at Grandpa', 'inference_from_wrong_detail')], speakChoices: false, explain: 'The story says: Nina felt worried.' },
    { difficulty: 3, say: 'Read the story. Why did Nina tie the string around her wrist?', show: 'Why did Nina tie the string to her wrist?', visual: { kind: 'story', ...PARK }, choices: [txt('so the kite would not get away again'), txt('because the kite was red', 'irrelevant_detail'), txt('so Grandpa could find her', 'inference_from_wrong_detail')], speakChoices: false, explain: 'The wind pulled the string out of her hand. Tying it to her wrist keeps it from slipping away again.' },
    { difficulty: 1, say: 'Read the text. How many arms does an octopus have?', show: 'How many arms?', visual: { kind: 'story', ...OCTOPUS }, choices: [txt('eight'), txt('six', 'detail_error'), txt('ten', 'detail_error')], speakChoices: false, explain: 'The first sentence says an octopus has eight arms.' },
    { difficulty: 2, say: 'Read the text. Why can an octopus squeeze into tiny cracks?', show: 'Why can it squeeze into cracks?', visual: { kind: 'story', ...OCTOPUS }, choices: [txt('It has no bones.'), txt('It can change color.', 'detail_error'), txt('It is very small.', 'not_in_text')], speakChoices: false, explain: 'The text says: because it has no bones, it can squeeze into tiny cracks.' },
    { difficulty: 3, say: 'Read the text. What is the main idea?', show: 'What is the main idea?', visual: { kind: 'story', ...OCTOPUS }, choices: [txt('Octopuses have clever ways to survive.'), txt('Sharks are hungry.', 'detail_as_main_topic'), txt('Jars are hard to open.', 'detail_as_main_topic')], speakChoices: false, explain: 'Every sentence shows something clever an octopus can do. That is the main idea.' },
    { difficulty: 2, say: 'Read the story. What did Ravi do every morning?', show: 'What did Ravi do every morning?', visual: { kind: 'story', ...GARDEN }, choices: [txt('watered the seeds'), txt('measured the plants', 'sequence_error'), txt('picked beans', 'sequence_error')], speakChoices: false, explain: 'He watered them every morning. He measured them on Saturdays.' },
    { difficulty: 3, say: 'Read the story. In this story, what does the word "shoots" mean?', show: 'What does “shoots” mean here?', visual: { kind: 'story', ...GARDEN }, choices: [txt('new little plants'), txt('throws a ball', 'word_meaning_reversed'), txt('takes a photo', 'word_meaning_unknown')], speakChoices: false, explain: 'Tiny green shoots poked out of the soil, so shoots are the new little plants.' },
  ]),
};

const capitals: Skill = {
  id: 'w.capitals',
  subject: 'reading',
  strand: 'writing',
  grade: '1',
  title: 'Capital letters: sentence start, names, the word I',
  kidTitle: 'Capital letters',
  icon: '🔠',
  standards: ['L.1.2a', 'L.2.2a'],
  prereqs: ['r1.sentence'],
  parentTip: 'When he writes a sentence, play “capital detective”: check the first word, every name, and the word I.',
  intro: [{ say: 'Sentences start with a capital letter. Names start with a capital letter. The word I is always a capital!', visual: { kind: 'text', text: 'I saw Maya at the park.', size: 'lg' } }],
  items: items('w.capitals', [
    { difficulty: 1, say: 'Which sentence is written correctly?', show: 'Which is written correctly?', choices: [txt('The dog ran fast.'), txt('the dog ran fast.', 'capital_start_missing'), txt('The Dog ran fast.', 'capital_overuse')], speakChoices: false, explain: 'A sentence starts with a capital letter. Dog is not a name, so it stays small.' },
    { difficulty: 2, say: 'Which sentence is written correctly?', show: 'Which is written correctly?', choices: [txt('my friend sam is here.', 'capital_start_missing'), txt('My friend sam is here.', 'capital_name_missing'), txt('My friend Sam is here.')], speakChoices: false, explain: 'Start with a capital: My. Sam is a name, so it needs a capital too.' },
    { difficulty: 2, say: 'Which sentence is written correctly?', show: 'Which is written correctly?', choices: [txt('Can i play too?', 'capital_i_missing'), txt('Can I play too?'), txt('can I play too?', 'capital_start_missing')], speakChoices: false, explain: 'The word I is always a capital letter, and the sentence starts with a capital.' },
    { difficulty: 3, say: 'Which sentence is written correctly?', show: 'Which is written correctly?', choices: [txt('We went to Atlanta in June.'), txt('We went to atlanta in june.', 'capital_name_missing'), txt('We Went To Atlanta In June.', 'capital_overuse')], speakChoices: false, explain: 'Names of places and months get capitals: Atlanta, June. Other words stay small.' },
  ]),
};

const punctuation: Skill = {
  id: 'w.punctuation',
  subject: 'reading',
  strand: 'writing',
  grade: '1',
  title: 'End punctuation (. ? !)',
  kidTitle: 'End marks',
  icon: '❓',
  standards: ['L.1.2b'],
  prereqs: ['r1.sentence'],
  parentTip: 'Read sentences in a “telling”, “asking” and “excited” voice and let him pick the matching mark.',
  intro: [{ say: 'A telling sentence ends with a period. An asking sentence ends with a question mark. An excited sentence ends with an exclamation mark!', visual: { kind: 'row', items: [{ kind: 'text', text: '.', size: 'xl' }, { kind: 'text', text: '?', size: 'xl' }, { kind: 'text', text: '!', size: 'xl' }] } }],
  items: items('w.punctuation', [
    { difficulty: 1, say: 'Which mark goes at the end? Where is my hat', show: 'Where is my hat __', visual: { kind: 'text', text: 'Where is my hat __', size: 'lg' }, choices: [txt('?'), txt('.', 'question_vs_statement'), txt('!', 'end_mark_confusion')], speakChoices: false, explain: 'It asks something, so it ends with a question mark.' },
    { difficulty: 1, say: 'Which mark goes at the end? The cat is on the mat', show: 'The cat is on the mat __', visual: { kind: 'text', text: 'The cat is on the mat __', size: 'lg' }, choices: [txt('?', 'question_vs_statement'), txt('.'), txt('!', 'end_mark_confusion')], speakChoices: false, explain: 'It tells something, so it ends with a period.' },
    { difficulty: 2, say: 'Which mark goes at the end? Watch out, the ball is coming', show: 'Watch out, the ball is coming __', visual: { kind: 'text', text: 'Watch out, the ball is coming __', size: 'lg' }, choices: [txt('?', 'question_vs_statement'), txt('.', 'end_mark_confusion'), txt('!')], speakChoices: false, explain: 'It is a strong, excited warning, so it ends with an exclamation mark.' },
    { difficulty: 3, say: 'Which sentence is a question?', show: 'Which is a question?', choices: [txt('I wonder what time it is.', 'question_vs_statement'), txt('What time is it?'), txt('It is time to go!', 'end_mark_confusion')], speakChoices: false, explain: '“What time is it?” asks something and ends with a question mark. “I wonder…” only tells what someone is thinking.' },
  ]),
};

const sentences: Skill = {
  id: 'w.sentences',
  subject: 'reading',
  strand: 'writing',
  grade: '1',
  title: 'Complete sentences and word order',
  kidTitle: 'Make a sentence',
  icon: '🧱',
  standards: ['L.1.1j', 'W.1.3'],
  prereqs: ['r1.sentence'],
  parentTip: 'A sentence needs WHO and what they DO. When he writes, ask: “Who is it about? What did they do?”',
  intro: [{ say: 'A complete sentence tells who, and what they do. The bird sings. That is a sentence!' }],
  items: items('w.sentences', [
    { difficulty: 1, say: 'Which one is a complete sentence?', show: 'Which is a complete sentence?', choices: [txt('The big dog.', 'fragment_no_action'), txt('The big dog barks.'), txt('Barks loudly.', 'fragment_no_subject')], speakChoices: false, explain: '“The big dog barks.” tells who (the big dog) and what it does (barks).' },
    { difficulty: 2, say: 'Which words are in the right order?', show: 'Which is in the right order?', choices: [txt('I like to read books.'), txt('Like I books read to.', 'word_order_error'), txt('Books read I like to.', 'word_order_error')], speakChoices: false, explain: 'In English we say who first, then the action: I like to read books.' },
    { difficulty: 2, say: 'Which one is a complete sentence?', show: 'Which is a complete sentence?', choices: [txt('Running to the park.', 'fragment_no_subject'), txt('My sister and me.', 'fragment_no_action'), txt('We ran to the park.')], speakChoices: false, explain: '“We ran to the park.” has who (we) and what they did (ran).' },
    { difficulty: 3, say: 'Which sentence uses the joining word because correctly?', show: 'Which uses “because” correctly?', choices: [txt('I wore a coat because it was cold.'), txt('I wore a coat because.', 'fragment_no_action'), txt('Because I wore a coat.', 'fragment_no_subject')], speakChoices: false, explain: '“Because” joins a reason: I wore a coat because it was cold.' },
  ]),
};

const grammar: Skill = {
  id: 'w.grammar',
  subject: 'reading',
  strand: 'writing',
  grade: '2',
  title: 'Grammar: nouns, verbs, plurals, past tense, contractions',
  kidTitle: 'Word detectives',
  icon: '🔍',
  standards: ['L.1.1b', 'L.1.1c', 'L.1.1e', 'L.2.1b', 'L.2.1d', 'L.2.2c'],
  prereqs: ['w.sentences'],
  parentTip: 'Play “noun or verb?”: you say a word, he acts it out if it is a verb or points to it if it is a noun.',
  intro: [{ say: 'A noun is a person, place or thing. A verb is an action word. Dog is a noun. Jump is a verb!' }],
  items: items('w.grammar', [
    { difficulty: 1, say: 'Which word is an action word, a verb?', show: 'Which is a verb?', choices: [txt('jump'), txt('table', 'noun_verb_confusion'), txt('happy', 'noun_verb_confusion')], speakChoices: false, explain: 'Jump is something you do, so it is a verb.' },
    { difficulty: 1, say: 'Which word is a noun, a person, place or thing?', show: 'Which is a noun?', choices: [txt('run', 'noun_verb_confusion'), txt('school'), txt('quickly', 'noun_verb_confusion')], speakChoices: false, explain: 'School is a place, so it is a noun.' },
    { difficulty: 2, say: 'One mouse. Two…?', show: 'one mouse, two ___', choices: [txt('mouses', 'regular_plural_overgeneralized'), txt('mice'), txt('mices', 'regular_plural_overgeneralized')], speakChoices: false, explain: 'Mouse is a special word. One mouse, two mice.' },
    { difficulty: 2, say: 'Today I run. Yesterday I…?', show: 'Today I run. Yesterday I ___.', choices: [txt('runned', 'regular_past_overgeneralized'), txt('running', 'verb_tense_confusion'), txt('ran')], speakChoices: false, explain: 'Run is a special verb. Yesterday I ran.' },
    { difficulty: 3, say: 'Which word means the same as do not?', show: '“do not” = ?', choices: [txt('don’t'), txt('doesn’t', 'contraction_confusion'), txt('didn’t', 'contraction_confusion')], speakChoices: false, explain: 'Do not squishes together into don’t. The apostrophe takes the place of the o.' },
    { difficulty: 3, say: 'Read the sentence. Which word describes what the animal is like?', show: 'Which word describes the animal?', visual: { kind: 'text', text: 'The fluffy cat slept.', size: 'lg' }, choices: [txt('fluffy'), txt('cat', 'noun_verb_confusion'), txt('slept', 'noun_verb_confusion')], speakChoices: false, explain: 'Fluffy tells what the cat is like. It is a describing word, an adjective.' },
  ]),
};

export const READING2_SKILLS: Skill[] = [vowelTeams, readAlone, capitals, punctuation, sentences, grammar];
