import type { Skill } from './types';
import { items, num, pic, txt } from './helpers';

const time: Skill = {
  id: 'ss.time',
  subject: 'social',
  strand: 'history',
  grade: 'K',
  title: 'Past, present, future; long ago and today',
  kidTitle: 'Long ago and today',
  icon: '⏳',
  standards: ['SSKH3'],
  prereqs: [],
  parentTip: 'Look at old family photos or ask a grandparent: "What did you have for phones and TV when you were little?"',
  intro: [{ say: 'Yesterday is the past. Today is now. Tomorrow is the future. Long ago, people used candles for light. Today we use light bulbs!', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🕯️' }, { kind: 'emoji', emoji: '💡' }] } }],
  items: items('ss.time', [
    { difficulty: 1, say: 'Which day comes after today?', show: 'After today comes…', choices: [txt('tomorrow'), txt('yesterday', 'time_word_confusion'), txt('last week', 'time_word_confusion')], explain: 'Tomorrow is the day after today.' },
    { difficulty: 1, say: 'Long ago, people used this for light. Which one?', show: 'Light from long ago', choices: [pic('💡', 'light bulb', 'then_now_confusion'), pic('🕯️', 'candle'), pic('🔦', 'flashlight', 'then_now_confusion')], explain: 'Long ago, before electricity, people used candles for light.' },
    { difficulty: 2, say: 'Which one is how people traveled long ago?', show: 'Travel long ago', choices: [pic('✈️', 'airplane', 'then_now_confusion'), pic('🚗', 'car', 'then_now_confusion'), pic('🐎', 'horse')], explain: 'Long ago, people rode horses or in wagons pulled by horses.' },
    { difficulty: 2, say: 'You ate breakfast this morning. Is that the past, the present, or the future?', show: 'Breakfast this morning was…', choices: [txt('past'), txt('future', 'time_word_confusion'), txt('present', 'time_word_confusion')], explain: 'It already happened, so it is in the past.' },
    { difficulty: 3, say: 'Which phone is the oldest?', show: 'Oldest phone', choices: [pic('📱', 'smart phone', 'then_now_confusion'), pic('☎️', 'old phone with a cord'), pic('📞', 'phone handset', 'then_now_confusion')], explain: 'The phone with a cord is from long ago. Smart phones are from today.' },
  ]),
};

const symbols: Skill = {
  id: 'ss.symbols',
  subject: 'social',
  strand: 'civics',
  grade: 'K',
  title: 'American symbols (flag, bald eagle, Statue of Liberty, Pledge)',
  kidTitle: 'American symbols',
  icon: '🇺🇸',
  standards: ['SSKCG2'],
  prereqs: [],
  parentTip: 'Count the stars and stripes on a flag together (50 stars for 50 states, 13 stripes for the first 13 colonies).',
  intro: [{ say: 'Symbols stand for our country. The flag, the bald eagle and the Statue of Liberty are American symbols.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🇺🇸' }, { kind: 'emoji', emoji: '🦅' }, { kind: 'emoji', emoji: '🗽' }] } }],
  items: items('ss.symbols', [
    { difficulty: 1, say: 'Which is the flag of the United States?', show: 'Flag of the United States', choices: [pic('🇨🇦', 'Canada flag', 'flag_confusion'), pic('🇺🇸', 'United States flag'), pic('🇬🇧', 'United Kingdom flag', 'flag_confusion')], explain: 'The United States flag has red and white stripes and white stars on blue.' },
    { difficulty: 2, say: 'Which bird is a symbol of the United States?', show: 'Bird symbol of the USA', choices: [pic('🦆', 'duck', 'symbol_confusion'), pic('🦉', 'owl', 'symbol_confusion'), pic('🦅', 'bald eagle')], explain: 'The bald eagle is our national bird. It stands for strength and freedom.' },
    { difficulty: 2, say: 'This is the Statue of Liberty. What does she hold up high?', show: 'She holds up a…', visual: { kind: 'emoji', emoji: '🗽', size: 'xl' }, choices: [txt('a torch'), txt('a sword', 'symbol_detail_confusion'), txt('an umbrella', 'symbol_detail_confusion')], explain: 'She holds a torch to welcome people and to stand for freedom.' },
    { difficulty: 3, say: 'What do we say at school to show we are loyal to our country and flag?', show: 'We say the…', choices: [txt('the Pledge of Allegiance'), txt('the ABC song', 'symbol_confusion'), txt('Happy Birthday', 'symbol_confusion')], explain: 'We say the Pledge of Allegiance facing the flag with a hand on our heart.' },
  ]),
};

const holidays: Skill = {
  id: 'ss.holidays',
  subject: 'social',
  strand: 'history',
  grade: 'K',
  title: 'National holidays and the people they honor',
  kidTitle: 'Holidays',
  icon: '🎆',
  standards: ['SSKH1', 'SSKH2'],
  prereqs: ['ss.symbols'],
  parentTip: 'Before each holiday, ask "Why do we celebrate this day? Who or what are we remembering?"',
  intro: [{ say: 'Holidays help us remember important people and days. On the Fourth of July we celebrate our country’s birthday!', visual: { kind: 'emoji', emoji: '🎆', size: 'xl' } }],
  items: items('ss.holidays', [
    { difficulty: 1, say: 'The Fourth of July is the birthday of what?', show: 'The Fourth of July is the birthday of…', visual: { kind: 'emoji', emoji: '🎆', size: 'xl' }, choices: [txt('our country'), txt('a president', 'holiday_meaning_confusion'), txt('Santa', 'holiday_meaning_confusion')], explain: 'On July 4th, 1776, our country began. We celebrate with fireworks!' },
    { difficulty: 2, say: 'On Thanksgiving, families share a big meal and say what they are…', show: 'On Thanksgiving we are…', visual: { kind: 'emoji', emoji: '🦃', size: 'xl' }, choices: [txt('thankful for'), txt('scared of', 'holiday_meaning_confusion'), txt('dressing up as', 'holiday_meaning_confusion')], explain: 'Thanksgiving is a day to give thanks for the good things we have.' },
    { difficulty: 3, say: 'Martin Luther King Junior worked hard so that all people would be…', show: 'Dr. King worked for…', choices: [txt('treated fairly'), txt('given more toys', 'holiday_meaning_confusion'), txt('allowed to stay up late', 'holiday_meaning_confusion')], explain: 'Dr. King worked peacefully so all people would be treated fairly, no matter their skin color.' },
    { difficulty: 3, say: 'On Veterans Day, we say thank you to whom?', show: 'Veterans Day honors…', choices: [txt('people who served in the military'), txt('teachers', 'holiday_meaning_confusion'), txt('farmers', 'holiday_meaning_confusion')], explain: 'Veterans served in the military to protect our country.' },
  ]),
};

const globes: Skill = {
  id: 'ss.globes',
  subject: 'social',
  strand: 'geography',
  grade: 'K',
  title: 'Maps and globes; land and water',
  kidTitle: 'Maps and globes',
  icon: '🌍',
  standards: ['SSKG2'],
  prereqs: [],
  parentTip: 'Spin a globe (or Google Earth) and have him land a finger. Is it land or water? Most times it is water!',
  intro: [{ say: 'A globe is a round model of the Earth. A map is a flat drawing of a place. On both, blue shows water and other colors show land.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🌍' }, { kind: 'emoji', emoji: '🗺️' }] } }],
  items: items('ss.globes', [
    { difficulty: 1, say: 'Which one is a globe?', show: 'Which is a globe?', choices: [pic('⚽', 'ball', 'shape_not_purpose'), pic('🌍', 'globe'), pic('🗺️', 'map', 'map_globe_confusion')], explain: 'A globe is a round model of the Earth.' },
    { difficulty: 1, say: 'On a map, what color usually shows water?', show: 'Water on a map is…', choices: [pic('🟩', 'green', 'map_color_confusion'), pic('🟦', 'blue'), pic('🟫', 'brown', 'map_color_confusion')], explain: 'Blue shows water like oceans, lakes and rivers.' },
    { difficulty: 2, say: 'Is the Earth covered by more land or more water?', show: 'More land or more water?', visual: { kind: 'emoji', emoji: '🌏', size: 'xl' }, choices: [txt('more water'), txt('more land', 'land_water_proportion'), txt('the same', 'land_water_proportion')], explain: 'Most of the Earth is covered by water — oceans are huge!' },
    { difficulty: 3, say: 'Why is a map easier to carry than a globe?', show: 'Why carry a map?', choices: [txt('A map is flat and folds up'), txt('A map is round', 'map_globe_confusion'), txt('A map has no places on it', 'not_true')], explain: 'A map is flat, so you can fold it and put it in your pocket.' },
  ]),
};

const TOWN = {
  kind: 'map' as const,
  rows: 3,
  cols: 4,
  cells: [
    { r: 0, c: 0, emoji: '🏠' },
    { r: 0, c: 1, emoji: '🌳' },
    { r: 0, c: 3, emoji: '🏫' },
    { r: 1, c: 1, emoji: '🏪' },
    { r: 1, c: 3, emoji: '🏥' },
    { r: 2, c: 0, emoji: '🏞️' },
    { r: 2, c: 2, emoji: '🚒' },
    { r: 2, c: 3, emoji: '📚' },
  ],
};

const mapRead: Skill = {
  id: 'ss.mapread',
  subject: 'social',
  strand: 'geography',
  grade: 'K',
  title: 'Read a simple map (next to, near, far, left, right)',
  kidTitle: 'Map explorer',
  icon: '🗺️',
  standards: ['SSKG3'],
  prereqs: ['ss.globes', 'm.position'],
  parentTip: 'Draw a map of his bedroom together. Hide a toy and mark it with an X for him to find.',
  intro: [{ say: 'A map shows where things are, like a bird looking down. Find the house. What is right next to it?', visual: TOWN }],
  items: items('ss.mapread', [
    { difficulty: 1, say: 'Look at the map. What is right next to the house?', show: 'Next to the house', visual: TOWN, choices: [pic('🌳', 'tree'), pic('🏫', 'school', 'near_far_confusion'), pic('🚒', 'fire station', 'near_far_confusion')], explain: 'The tree is in the very next box to the house.' },
    { difficulty: 2, say: 'Look at the map. What is right below the school?', show: 'Below the school', visual: TOWN, choices: [pic('🏪', 'store', 'map_direction_confusion'), pic('🏥', 'hospital'), pic('🌳', 'tree', 'map_direction_confusion')], explain: 'Go down one box from the school and you find the hospital.' },
    { difficulty: 2, say: 'Which place is farthest from the house?', show: 'Farthest from the house', visual: TOWN, choices: [pic('🌳', 'tree', 'near_far_confusion'), pic('🏪', 'store', 'near_far_confusion'), pic('📚', 'library')], explain: 'The library is in the opposite corner, so it is the farthest.' },
    { difficulty: 3, say: 'You are at the fire station. You walk one box to the right. Where are you now?', show: 'From the fire station, one box right', visual: TOWN, choices: [pic('🏞️', 'park', 'left_right_confusion'), pic('📚', 'library'), pic('🏥', 'hospital', 'map_direction_confusion')], explain: 'One box to the right of the fire station is the library. The park is to the left, and the hospital is up.' },
  ]),
};

const helpers: Skill = {
  id: 'ss.helpers',
  subject: 'social',
  strand: 'economics',
  grade: 'K',
  title: 'Community helpers and jobs',
  kidTitle: 'Community helpers',
  icon: '🧑‍🚒',
  standards: ['SSKE1'],
  prereqs: [],
  parentTip: 'When you meet workers (mail carrier, cashier, nurse), talk about how their job helps the community.',
  intro: [{ say: 'Community helpers have jobs that help us. Firefighters put out fires. Doctors help us when we are sick.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🧑‍🚒' }, { kind: 'emoji', emoji: '🧑‍⚕️' }] } }],
  items: items('ss.helpers', [
    { difficulty: 1, say: 'Who helps when there is a fire?', show: 'Fire!', visual: { kind: 'emoji', emoji: '🔥' }, choices: [pic('🧑‍🍳', 'chef', 'job_function_confusion'), pic('🧑‍🚒', 'firefighter'), pic('🧑‍🌾', 'farmer', 'job_function_confusion')], explain: 'Firefighters put out fires and keep us safe.' },
    { difficulty: 1, say: 'Who helps you when you are sick?', show: 'When you are sick', choices: [pic('🧑‍⚕️', 'doctor'), pic('🧑‍🎨', 'artist', 'job_function_confusion'), pic('🧑‍🚀', 'astronaut', 'job_function_confusion')], explain: 'Doctors and nurses help us get well.' },
    { difficulty: 2, say: 'Who grows the food we eat?', show: 'Grows our food', choices: [pic('🧑‍🏫', 'teacher', 'job_function_confusion'), pic('👮', 'police officer', 'job_function_confusion'), pic('🧑‍🌾', 'farmer')], explain: 'Farmers grow fruits, vegetables and grains.' },
    { difficulty: 3, say: 'A road is broken and has a big hole. Which helper would fix it?', show: 'Fix the road', choices: [pic('👷', 'construction worker'), pic('🧑‍⚕️', 'doctor', 'job_function_confusion'), pic('🧑‍🍳', 'chef', 'job_function_confusion')], explain: 'Construction workers build and fix roads and buildings.' },
  ]),
};

const needs: Skill = {
  id: 'ss.needs',
  subject: 'social',
  strand: 'economics',
  grade: 'K',
  title: 'Needs and wants; money and saving',
  kidTitle: 'Needs and wants',
  icon: '🐷',
  standards: ['SSKE2', 'SSKE3', 'SSKE4'],
  prereqs: [],
  parentTip: 'Give him three jars: Save, Spend, Share. Put a coin in one each week and talk about what he is saving for.',
  intro: [{ say: 'Needs are things we must have to live, like food, water and a home. Wants are things that are nice to have, like toys.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🍞' }, { kind: 'emoji', emoji: '🎮' }] } }],
  items: items('ss.needs', [
    { difficulty: 1, say: 'Which one is a NEED?', show: 'Which is a need?', choices: [pic('🎮', 'video game', 'need_want_confusion'), pic('💧', 'water'), pic('🍭', 'lollipop', 'need_want_confusion')], explain: 'We need water to live. Games and candy are wants.' },
    { difficulty: 1, say: 'Which one is a WANT?', show: 'Which is a want?', choices: [pic('🏠', 'home', 'need_want_confusion'), pic('🍎', 'food', 'need_want_confusion'), pic('🧸', 'new toy')], explain: 'A new toy is nice, but we do not need it to live. It is a want.' },
    { difficulty: 2, say: 'What do people use to buy things?', show: 'We buy things with…', choices: [pic('💵', 'money'), pic('🍂', 'leaves', 'money_concept'), pic('🪨', 'rocks', 'money_concept')], explain: 'People use money to buy goods and services.' },
    { difficulty: 3, say: 'You have money for only one thing. You need lunch. You want a toy. What should you buy?', show: 'Only one: lunch or toy?', choices: [pic('🥪', 'lunch'), pic('🪀', 'toy', 'need_want_confusion'), txt('both', 'scarcity_concept')], explain: 'Needs come first. You need lunch to stay healthy, so buy lunch and save for the toy.' },
    { difficulty: 3, say: 'What does it mean to save money?', show: 'Saving means…', visual: { kind: 'emoji', emoji: '🐷', size: 'xl' }, choices: [txt('keeping it to use later'), txt('spending it right away', 'saving_spending_confusion'), txt('throwing it away', 'not_true')], explain: 'Saving means keeping money now so you can buy something bigger later.' },
  ]),
};

const citizen: Skill = {
  id: 'ss.citizen',
  subject: 'social',
  strand: 'civics',
  grade: 'K',
  title: 'Rules and good citizenship',
  kidTitle: 'Good citizens',
  icon: '🤝',
  standards: ['SSKCG1'],
  prereqs: [],
  parentTip: 'Make family rules together and talk about why each rule keeps people safe or makes things fair.',
  intro: [{ say: 'Good citizens follow rules, take turns, tell the truth and help others. Rules keep us safe and fair.' }],
  items: items('ss.citizen', [
    { difficulty: 1, say: 'Your friend falls down on the playground. What should you do?', show: 'Your friend falls down', choices: [txt('help them up'), txt('laugh', 'citizenship_confusion'), txt('walk away', 'citizenship_confusion')], explain: 'A good citizen helps others.' },
    { difficulty: 1, say: 'Which one shows being a good citizen?', show: 'Good citizen', choices: [pic('🚮', 'throwing trash in the bin'), pic('😠', 'yelling', 'citizenship_confusion'), pic('🍫', 'taking all the snacks', 'citizenship_confusion')], explain: 'Putting trash in the bin keeps our community clean.' },
    { difficulty: 2, say: 'Why do we have rules?', show: 'Rules help us…', choices: [txt('to keep us safe and fair'), txt('to make us sad', 'rule_purpose_confusion'), txt('so grown-ups can win', 'rule_purpose_confusion')], explain: 'Rules keep everyone safe and make things fair.' },
    { difficulty: 3, say: 'Only one child can use the swing. Three children want a turn. What is the fair thing to do?', show: 'One swing, three children', visual: { kind: 'emoji', emoji: '🛝', size: 'xl' }, choices: [txt('take turns'), txt('the biggest child gets it', 'fairness_confusion'), txt('nobody gets to swing', 'fairness_confusion')], explain: 'Taking turns is fair. Everyone gets a chance.' },
  ]),
};

const home: Skill = {
  id: 'ss1.home',
  subject: 'social',
  strand: 'geography',
  grade: '1',
  title: 'Where I live: city, state, country, continent',
  kidTitle: 'Where I live',
  icon: '🏡',
  standards: ['SS1G2'],
  prereqs: ['ss.globes'],
  parentTip: 'Make "address nesting" cups: house in city in county in state (Georgia) in country (USA) in continent (North America).',
  intro: [{ say: 'Our home is in a city. Our city is in the state of Georgia. Georgia is in the United States. The United States is in North America.' }],
  items: items('ss1.home', [
    { difficulty: 1, say: 'Georgia is one of the fifty…', show: 'Georgia is a…', choices: [txt('states'), txt('cities', 'place_hierarchy_confusion'), txt('oceans', 'place_hierarchy_confusion')], explain: 'Georgia is a state. The United States has fifty states.' },
    { difficulty: 2, say: 'Which is the biggest?', show: 'Biggest place', choices: [txt('country'), txt('state', 'place_hierarchy_confusion'), txt('city', 'place_hierarchy_confusion')], explain: 'A country has many states, and a state has many cities.' },
    { difficulty: 3, say: 'Which continent is the United States on?', show: 'The USA is on…', choices: [txt('North America'), txt('Africa', 'continent_confusion'), txt('Asia', 'continent_confusion')], explain: 'The United States is on the continent of North America.' },
  ]),
};

const continents: Skill = {
  id: 'ss1.continents',
  subject: 'social',
  strand: 'geography',
  grade: '1',
  title: 'Continents and oceans',
  kidTitle: 'Continents and oceans',
  icon: '🌎',
  standards: ['SS1G3'],
  prereqs: ['ss1.home'],
  parentTip: 'Sing a continents song and point to each one on a world map puzzle.',
  intro: [{ say: 'The land on Earth is split into seven big parts called continents. The biggest bodies of water are oceans.' }],
  items: items('ss1.continents', [
    { difficulty: 1, say: 'How many continents are there?', show: 'How many continents?', choices: [num(7), num(5, 'continent_count'), num(50, 'states_vs_continents')], explain: 'There are 7 continents.' },
    { difficulty: 2, say: 'Which continent is covered in ice, where many penguins live?', show: 'Icy continent with penguins', visual: { kind: 'emoji', emoji: '🐧', size: 'xl' }, choices: [txt('Antarctica'), txt('Africa', 'continent_confusion'), txt('Europe', 'continent_confusion')], explain: 'Antarctica is the coldest continent, covered in ice. Many penguins live there.' },
    { difficulty: 3, say: 'What is the biggest ocean?', show: 'Biggest ocean', visual: { kind: 'emoji', emoji: '🌊', size: 'xl' }, choices: [txt('Pacific Ocean'), txt('Atlantic Ocean', 'ocean_confusion'), txt('Lake Lanier', 'water_body_confusion')], explain: 'The Pacific Ocean is the biggest. The Atlantic is the ocean near Georgia.' },
  ]),
};

export const SOCIAL_SKILLS: Skill[] = [time, holidays, symbols, citizen, helpers, needs, globes, mapRead, home, continents];
