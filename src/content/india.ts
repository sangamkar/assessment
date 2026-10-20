import type { Skill, Visual } from './types';
import { items, makeItem, num, numberChoices, pic, txt } from './helpers';

/* India-only skills: shown when the India (CBSE/NCERT) curriculum is switched on. */
const REGIONS: Skill['regions'] = ['in-cbse'];

const symbols: Skill = {
  id: 'in.symbols',
  subject: 'social',
  strand: 'civics',
  grade: 'K',
  title: 'National symbols of India',
  kidTitle: 'India’s symbols',
  icon: '🇮🇳',
  standards: ['NCERT EVS / Class 1–2 general awareness'],
  prereqs: [],
  regions: REGIONS,
  parentTip: 'Look at a ₹10 note or coin and the Indian flag together. Find the Ashoka Chakra and count its spokes.',
  intro: [{ say: 'This is the flag of India. It is called the Tiranga, which means three colours: saffron, white and green, with a blue wheel in the middle.', visual: { kind: 'emoji', emoji: '🇮🇳', size: 'xl' } }],
  items: items('in.symbols', [
    { difficulty: 1, speakChoices: false, say: 'Which is the flag of India?', show: 'Flag of India', choices: [pic('🇺🇸', 'United States flag', 'flag_confusion'), pic('🇮🇳', 'India flag'), pic('🇯🇵', 'Japan flag', 'flag_confusion')], explain: 'India’s flag has saffron, white and green stripes, with a blue wheel in the middle.' },
    { difficulty: 1, say: 'What is the national bird of India?', show: 'National bird of India', choices: [pic('🦅', 'eagle', 'home_country_symbol'), pic('🦚', 'peacock'), pic('🦜', 'parrot', 'symbol_confusion')], explain: 'The peacock is India’s national bird. The bald eagle is the national bird of the United States.' },
    { difficulty: 1, say: 'What is the national animal of India?', show: 'National animal of India', choices: [pic('🐯', 'tiger'), pic('🐘', 'elephant', 'symbol_confusion'), pic('🐄', 'cow', 'symbol_confusion')], explain: 'The tiger is India’s national animal.' },
    { difficulty: 2, say: 'What is the national flower of India?', show: 'National flower of India', choices: [pic('🌹', 'rose', 'symbol_confusion'), pic('🌻', 'sunflower', 'symbol_confusion'), pic('🪷', 'lotus')], explain: 'The lotus is India’s national flower. It grows in ponds.' },
    { difficulty: 2, say: 'What is the national fruit of India?', show: 'National fruit of India', choices: [pic('🥭', 'mango'), pic('🍎', 'apple', 'symbol_confusion'), pic('🍌', 'banana', 'symbol_confusion')], explain: 'The mango is India’s national fruit.' },
    { difficulty: 2, say: 'What is the national anthem of India?', show: 'National anthem of India', choices: [txt('Jana Gana Mana'), txt('Vande Mataram', 'anthem_song_confusion'), txt('Twinkle Twinkle', 'symbol_confusion')], explain: 'Jana Gana Mana is the national anthem. Vande Mataram is the national song.' },
    { difficulty: 3, speakChoices: false, say: 'Look carefully. Which one is the flag of India?', show: 'Look carefully: India’s flag', choices: [pic('🇮🇪', 'Ireland flag', 'flag_detail_confusion'), pic('🇳🇪', 'Niger flag', 'flag_detail_confusion'), pic('🇮🇳', 'India flag')], explain: 'India’s stripes go across, with saffron on top and a blue wheel in the middle. Ireland’s stripes go up and down.' },
    { difficulty: 3, say: 'The wheel in the middle of India’s flag is the Ashoka Chakra. How many spokes does it have?', show: 'Spokes in the Ashoka Chakra', choices: [num(12, 'flag_detail_confusion'), num(24), num(50, 'home_country_symbol')], explain: 'The Ashoka Chakra has 24 spokes. (The US flag has 50 stars.)' },
    { difficulty: 2, say: 'What is the national tree of India?', show: 'National tree of India', choices: [pic('🌲', 'pine tree', 'symbol_confusion'), pic('🌳', 'banyan tree'), pic('🌴', 'palm tree', 'symbol_confusion')], explain: 'The banyan is India’s national tree. It grows very big, and new roots hang down from its branches.' },
    { difficulty: 3, say: 'Which colour is at the top of India’s flag?', show: 'Top stripe of India’s flag', choices: [pic('🟩', 'green', 'flag_detail_confusion'), pic('⬜', 'white', 'flag_detail_confusion'), pic('🟧', 'saffron'), pic('🟦', 'blue', 'flag_detail_confusion')], explain: 'Saffron is at the top, white is in the middle with the blue wheel, and green is at the bottom.' },
  ]),
};

const festivals: Skill = {
  id: 'in.festivals',
  subject: 'social',
  strand: 'history',
  grade: 'K',
  title: 'Festivals and national days of India',
  kidTitle: 'India’s festivals',
  icon: '🪔',
  standards: ['NCERT EVS / Class 1–2 general awareness'],
  prereqs: [],
  regions: REGIONS,
  parentTip: 'Before each festival, tell the story behind it and make one small craft (a diya, a rangoli, a kite).',
  intro: [{ say: 'India celebrates many festivals from many religions. Diwali is the festival of lights!', visual: { kind: 'emoji', emoji: '🪔', size: 'xl' } }],
  items: items('in.festivals', [
    { difficulty: 1, say: 'Which festival is called the festival of lights?', show: 'Festival of lights', choices: [pic('🪔', 'Diwali'), pic('🎨', 'Holi', 'festival_confusion'), pic('🎄', 'Christmas', 'festival_confusion')], explain: 'Diwali is the festival of lights. People light diyas and lamps.' },
    { difficulty: 1, say: 'At which festival do people throw coloured powder and water?', show: 'Festival of colours', choices: [pic('🪔', 'Diwali', 'festival_confusion'), pic('🎨', 'Holi'), pic('🪁', 'Makar Sankranti', 'festival_confusion')], explain: 'Holi is the festival of colours.' },
    { difficulty: 2, say: 'At Makar Sankranti and Uttarayan, many people fly…', show: 'At Makar Sankranti people fly…', choices: [pic('🪁', 'kites'), pic('🎈', 'balloons', 'festival_confusion'), pic('✈️', 'aeroplanes', 'festival_confusion')], explain: 'People fly colourful kites on Makar Sankranti and Uttarayan.' },
    { difficulty: 2, say: 'On which date is India’s Independence Day?', show: 'Independence Day of India', choices: [txt('15 August'), txt('26 January', 'republic_independence_confusion'), txt('4 July', 'home_country_symbol')], explain: 'India became free on 15 August 1947. (The 4th of July is the United States’ birthday.)' },
    { difficulty: 3, say: 'On which date is Republic Day, when India’s constitution began?', show: 'Republic Day of India', choices: [txt('15 August', 'republic_independence_confusion'), txt('26 January'), txt('2 October', 'national_day_confusion')], explain: 'Republic Day is 26 January. India’s constitution started on that day in 1950.' },
    { difficulty: 3, say: 'Gandhi Jayanti, on 2 October, is the birthday of whom?', show: 'Gandhi Jayanti honours…', choices: [txt('Mahatma Gandhi'), txt('Jawaharlal Nehru', 'national_day_confusion'), txt('Martin Luther King Jr.', 'home_country_symbol')], explain: 'Gandhi Jayanti is Mahatma Gandhi’s birthday. Dr. King learned about peaceful protest from Gandhi!' },
    { difficulty: 1, say: 'At Diwali, people light little clay lamps. What are they called?', show: 'Little clay lamps', choices: [txt('kites', 'festival_confusion'), txt('diyas'), txt('rakhis', 'festival_confusion')], explain: 'The little clay lamps are called diyas. People fill them with oil and light them for Diwali.' },
    { difficulty: 2, say: 'Raksha Bandhan celebrates the love between whom?', show: 'Raksha Bandhan celebrates…', choices: [txt('brothers and sisters'), txt('teachers and students', 'festival_confusion'), txt('farmers and their cows', 'festival_confusion')], explain: 'On Raksha Bandhan, a sister ties a rakhi on her brother’s wrist, and he promises to care for her.' },
    { difficulty: 2, say: 'Which festival comes at the end of Ramadan, the month of fasting?', show: 'After Ramadan comes…', visual: { kind: 'emoji', emoji: '🌙', size: 'xl' }, choices: [txt('Holi', 'festival_confusion'), txt('Christmas', 'festival_confusion'), txt('Eid ul-Fitr')], explain: 'Eid ul-Fitr comes at the end of Ramadan. Families share sweets like sevaiyan and visit friends.' },
    { difficulty: 3, say: 'Children’s Day in India is on 14 November. It is the birthday of a leader who loved children. Who was he?', show: 'Children’s Day honours…', choices: [txt('Mahatma Gandhi', 'national_day_confusion'), txt('Jawaharlal Nehru'), txt('George Washington', 'home_country_symbol')], explain: 'Jawaharlal Nehru, India’s first Prime Minister, was born on 14 November. Children called him Chacha Nehru.' },
  ]),
};

const indiaMap: Skill = {
  id: 'in.map',
  subject: 'social',
  strand: 'geography',
  grade: '1',
  title: 'India on the map: continent, capital, mountains, seas',
  kidTitle: 'Explore India',
  icon: '🗺️',
  standards: ['NCERT EVS / Class 1–3 geography awareness'],
  prereqs: ['ss.globes'],
  regions: REGIONS,
  parentTip: 'Do an India map puzzle. Find Delhi, the Himalayas, and the city where family lives.',
  intro: [{ say: 'India is a big country in Asia. The Himalaya mountains are in the north, and the Indian Ocean is in the south.', visual: { kind: 'emoji', emoji: '🌏', size: 'xl' } }],
  items: items('in.map', [
    { difficulty: 1, say: 'India is on which continent?', show: 'India is in…', choices: [txt('Asia'), txt('North America', 'home_country_anchoring'), txt('Africa', 'continent_confusion')], explain: 'India is in Asia. The United States is in North America.' },
    { difficulty: 2, say: 'What is the capital of India?', show: 'Capital of India', choices: [txt('Mumbai', 'largest_city_as_capital'), txt('New Delhi'), txt('Kolkata', 'capital_confusion')], explain: 'New Delhi is the capital. Mumbai is a very big city, but it is not the capital.' },
    { difficulty: 2, say: 'The tall, snowy mountains in the north of India are called the…', show: 'Mountains in the north of India', visual: { kind: 'emoji', emoji: '🏔️', size: 'xl' }, choices: [txt('Himalayas'), txt('Rocky Mountains', 'home_country_anchoring'), txt('Alps', 'continent_confusion')], explain: 'The Himalayas are the highest mountains in the world. Mount Everest is there.' },
    { difficulty: 2, say: 'Which ocean is to the south of India?', show: 'Ocean south of India', visual: { kind: 'emoji', emoji: '🌊', size: 'xl' }, choices: [txt('Atlantic Ocean', 'home_country_anchoring'), txt('Indian Ocean'), txt('Arctic Ocean', 'ocean_confusion')], explain: 'The Indian Ocean is south of India. The Atlantic is the ocean near Georgia.' },
    { difficulty: 3, say: 'Which is a great river of India?', show: 'A great river of India', choices: [txt('Ganga'), txt('Mississippi', 'home_country_anchoring'), txt('Nile', 'continent_confusion')], explain: 'The Ganga flows from the Himalayas across north India. The Mississippi is in the United States.' },
    { difficulty: 3, say: 'How many states does India have?', show: 'States in India', choices: [num(28), num(50, 'home_country_anchoring'), num(7, 'continent_count')], explain: 'India has 28 states, plus union territories like Delhi. The United States has 50 states.' },
    { difficulty: 1, say: 'Is India a city, a country, or a continent?', show: 'India is a…', choices: [txt('a city', 'place_hierarchy_confusion'), txt('a country'), txt('a continent', 'place_hierarchy_confusion')], explain: 'India is a country. It is in the continent of Asia.' },
    { difficulty: 1, say: 'Which of these is a big city in India?', show: 'A big city in India', choices: [txt('Atlanta', 'home_country_anchoring'), txt('London', 'continent_confusion'), txt('Mumbai')], explain: 'Mumbai is one of India’s biggest cities. Atlanta is in the United States and London is in England.' },
    { difficulty: 2, speakChoices: false, say: 'The Thar Desert is in India. Which picture shows a desert?', show: 'Find the desert', choices: [pic('🏜️', 'desert'), pic('🏔️', 'snowy mountain', 'landform_confusion'), pic('🏝️', 'island', 'landform_confusion')], explain: 'A desert is a dry, sandy place with very little rain. The Thar Desert is in the west of India, in Rajasthan.' },
    { difficulty: 3, say: 'Which country is a neighbour of India?', show: 'India’s neighbour', choices: [txt('Nepal'), txt('Mexico', 'home_country_anchoring'), txt('Brazil', 'continent_confusion')], explain: 'Nepal is next to India, up in the Himalayas. Mexico is next to the United States.' },
  ]),
};

const COINS = [1, 2, 5, 10];

const money: Skill = {
  id: 'in.money',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Indian money: coins and making change (₹)',
  kidTitle: 'Rupees',
  icon: '🪙',
  standards: ['JM1 Ch12 How Much Can We Spend?'],
  prereqs: ['m.add', 'm.numerals'],
  regions: REGIONS,
  parentTip: 'Play shop with real ₹1, ₹2, ₹5 and ₹10 coins. Price toys under ₹20 and let him pay and get change.',
  intro: [{ say: 'In India, money is counted in rupees. Here are coins worth one, two, five and ten rupees.', visual: { kind: 'coins', values: [1, 2, 5, 10], symbol: '₹' } }],
  generate: (rng, d) => {
    if (d === 1) {
      const v = rng.pick(COINS);
      return makeItem('in.money', `find${v}`, d, {
        say: `Find the ${v} rupee coin.`,
        show: `Find ₹${v}`,
        choices: COINS.map((c) => (c === v ? { visual: { kind: 'coins', values: [c], symbol: '₹' } as Visual, correct: true as const } : { visual: { kind: 'coins', values: [c], symbol: '₹' } as Visual, why: 'coin_value_unknown' })),
        speakChoices: false,
        explain: `This coin says ${v}. It is worth ${v} rupee${v > 1 ? 's' : ''}.`,
      });
    }
    if (d === 2) {
      const count = rng.int(2, 3);
      const coins = Array.from({ length: count }, () => rng.pick(COINS)).sort((a, b) => b - a);
      const total = coins.reduce((a, b) => a + b, 0);
      return makeItem('in.money', `sum${coins.join('-')}`, d, {
        say: 'How much money is this, in rupees?',
        show: 'How many rupees?',
        visual: { kind: 'coins', values: coins, symbol: '₹' },
        choices: numberChoices(rng, total, [
          { n: count, why: 'counted_coins_not_value' },
          { n: coins[0], why: 'only_biggest_coin' },
          { n: total + 1, why: 'near_miss' },
        ], { min: 1, max: 40 }).map((c) => ({ ...c, text: `₹${c.text}`, say: `${c.say} rupees` })),
        hint: `Start with the biggest coin, ${coins[0]}, then count on.`,
        explain: `Start with the biggest coin and count on: ${coins.map((_, i) => coins.slice(0, i + 1).reduce((a, b) => a + b, 0)).join(', ')}. That is ${total} rupees.`,
      });
    }
    const have = rng.pick([10, 20]);
    const price = rng.int(2, have - 2);
    const left = have - price;
    const thing = rng.pick([['pencil', '✏️'], ['ball', '⚽'], ['kite', '🪁'], ['ice cream', '🍦']]);
    return makeItem('in.money', `change${have}-${price}`, d, {
      say: `You have ${have} rupees. A ${thing[0]} costs ${price} rupees. How much money is left after you buy it?`,
      show: `You have ₹${have}. ${thing[1]} costs ₹${price}. Money left?`,
      visual: { kind: 'emoji', emoji: thing[1], size: 'xl' },
      choices: numberChoices(rng, left, [
        { n: price, why: 'answered_part_taken' },
        { n: have + price, why: 'added_instead' },
        { n: left + 1, why: 'near_miss' },
      ], { min: 0, max: 40 }).map((c) => ({ ...c, text: `₹${c.text}`, say: `${c.say} rupees` })),
      explain: `${have} take away ${price} is ${left}. You have ${left} rupees left.`,
    });
  },
};

export const INDIA_SKILLS: Skill[] = [symbols, festivals, indiaMap, money];
