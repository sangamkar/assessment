import type { Choice, Difficulty, Item, Rng, Skill, Visual } from '../types';
import { makeItem } from '../helpers';

/* Shared building blocks for the Grade 1–2 foundational reading generators. */

export type Draft = Omit<Choice, 'id'>;
export const ok = (text: string): Draft => ({ text, say: text, correct: true });
export const no = (text: string, why: string): Draft => ({ text, say: text, why });
export const okPic = (emoji: string, say: string): Draft => ({ visual: { kind: 'emoji', emoji }, say, correct: true });
export const noPic = (emoji: string, say: string, why: string): Draft => ({ visual: { kind: 'emoji', emoji }, say, why });
export const big = (emoji: string): Visual => ({ kind: 'emoji', emoji, size: 'xl' });
export const words = (text: string, size: 'md' | 'lg' | 'xl' = 'lg'): Visual => ({ kind: 'text', text, size });

/** 3 choices at level 1, 4 at levels 2–3 (fewer only when the data has fewer). */
export const choiceCount = (d: Difficulty) => (d === 1 ? 3 : 4);

/** Correct choice plus the first distinct wrong ones, up to `n`. */
export function assemble(answer: Draft, wrongs: Draft[], n: number): Draft[] {
  const key = (c: Draft) => (c.text ?? '').toLowerCase() + '|' + (c.visual?.kind === 'emoji' ? c.visual.emoji : '');
  const seen = new Set([key(answer)]);
  const out = [answer];
  for (const w of wrongs) {
    if (out.length >= n) break;
    if (seen.has(key(w))) continue;
    seen.add(key(w));
    out.push(w);
  }
  return out;
}

/** A generator that spreads its seeds evenly over a fixed list of item builders per level. */
export function fromPlans(plans: Record<Difficulty, ((rng: Rng) => Item)[]>) {
  return (rng: Rng, d: Difficulty): Item => {
    const list = plans[d].length ? plans[d] : plans[2];
    return list[Math.floor(rng.next() * list.length)](rng);
  };
}

export function skill(base: Omit<Skill, 'subject'>): Skill {
  return { subject: 'reading', ...base };
}

export { makeItem };

/** Whole-word, case-insensitive containment (used by tests and guards). */
export const mentions = (sentence: string, word: string) =>
  new RegExp(`(^|[^a-z'])${word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z']|$)`).test(sentence.toLowerCase());

/** Spell a word out for explanations: "k, i, t, e". */
export const spell = (w: string) => w.split('').join(', ');

/**
 * Pictures that show ONE word unambiguously (Unicode 13 or earlier).
 * Words whose emoji could be read two ways (globe/earth, rock/stone, mouse/mice) are left out on purpose.
 */
export const PIC: Record<string, string> = {
  // short vowels
  cap: '🧢', cat: '🐱', pin: '📌', tub: '🛁', hat: '🎩', can: '🥫', pig: '🐷', bat: '🦇', map: '🗺️', hut: '🛖', bus: '🚌', bug: '🐛',
  box: '📦', fox: '🦊', dog: '🐶', sun: '☀️', bed: '🛏️', web: '🕸️', egg: '🥚', van: '🚐', ant: '🐜', ten: '🔟', pen: '🖊️', rat: '🐀',
  ram: '🐏', ox: '🐂', nut: '🥜', gem: '💎', pan: '🍳', six: '6️⃣', leg: '🦵', bell: '🔔', duck: '🦆', sock: '🧦',
  // long vowels with silent e
  cake: '🎂', kite: '🪁', bike: '🚲', bone: '🦴', rose: '🌹', nose: '👃', plane: '✈️', snake: '🐍', whale: '🐋', dice: '🎲', rice: '🍚',
  skate: '⛸️', five: '5️⃣', nine: '9️⃣', note: '🎵', hole: '🕳️', fire: '🔥',
  // vowel teams
  tree: '🌳', bee: '🐝', sheep: '🐑', leaf: '🍃', peach: '🍑', seal: '🦭', tea: '🍵', eagle: '🦅', rain: '🌧️', snail: '🐌', train: '🚆',
  chain: '⛓️', crayon: '🖍️', goat: '🐐', boat: '⛵', coat: '🧥', soap: '🧼', bowl: '🥣', window: '🪟', rainbow: '🌈', snowman: '⛄',
  light: '💡', tie: '👔', pie: '🥧', fly: '🪰', key: '🔑', road: '🛣️',
  // oo, ue/ew, ea, ie, aw/au
  boot: '👢', moon: '🌙', spoon: '🥄', broom: '🧹', tooth: '🦷', book: '📖', foot: '🦶', hook: '🪝', wood: '🪵', bread: '🍞',
  feather: '🪶', thread: '🧵', fries: '🍟', saw: '🪚', paw: '🐾', yawn: '🥱', dinosaur: '🦕', astronaut: '🧑‍🚀',
  // r-controlled
  star: '⭐', car: '🚗', shark: '🦈', yarn: '🧶', scarf: '🧣', corn: '🌽', horn: '📯', horse: '🐴', storm: '⛈️', bird: '🐦', girl: '👧',
  shirt: '👕', turtle: '🐢', purse: '👛', church: '⛪', burger: '🍔', worm: '🪱', spider: '🕷️', ladder: '🪜', tiger: '🐯', butter: '🧈',
  hammer: '🔨',
  // diphthongs
  coin: '🪙', boy: '👦', oyster: '🦪', toilet: '🚽', house: '🏠', mouse: '🐭', cloud: '☁️', mouth: '👄', couch: '🛋️', owl: '🦉', cow: '🐮',
  crown: '👑', clown: '🤡', shower: '🚿', fountain: '⛲', mountain: '⛰️',
  // blends and digraphs
  crab: '🦀', frog: '🐸', drum: '🥁', flag: '🚩', truck: '🚚', plant: '🪴', tent: '⛺', hand: '✋', glove: '🧤', brick: '🧱', bridge: '🌉',
  sled: '🛷', swan: '🦢', skunk: '🦨', squid: '🦑', shrimp: '🦐', sloth: '🦥', clock: '⏰', sponge: '🧽', strawberry: '🍓', grapes: '🍇',
  chick: '🐤', cheese: '🧀', chair: '🪑', cherries: '🍒', shell: '🐚', ship: '🚢', shoe: '👞', fish: '🐟', thumb: '👍', three: '3️⃣',
  phone: '📱', dolphin: '🐬', elephant: '🐘', ring: '💍', king: '🤴', watch: '⌚', sandwich: '🥪', lock: '🔒', toothbrush: '🪥',
  pumpkin: '🎃', mushroom: '🍄', dragon: '🐉', trophy: '🏆', flamingo: '🦩', cricket: '🦗',
  // tricky spellings
  knife: '🔪', knot: '🪢', wrench: '🔧', ghost: '👻', eight: '8️⃣', two: '2️⃣', four: '4️⃣', honey: '🍯', money: '💰', monkey: '🐵',
  heart: '❤️', tongue: '👅', island: '🏝️', castle: '🏰', eye: '👁️', wolf: '🐺', door: '🚪', juice: '🧃', school: '🏫', anchor: '⚓',
  giraffe: '🦒', pencil: '✏️', city: '🏙️', ear: '👂', rocket: '🚀', pear: '🍐', bear: '🐻', lion: '🦁', rabbit: '🐰', octopus: '🐙', umbrella: '☂️',
  apple: '🍎', zebra: '🦓', banana: '🍌', camel: '🐫', panda: '🐼', lemon: '🍋', robot: '🤖', cactus: '🌵', magnet: '🧲', tulip: '🌷',
  basket: '🧺', llama: '🦙', butterfly: '🦋', tomato: '🍅', potato: '🥔', ladybug: '🐞', kangaroo: '🦘', avocado: '🥑', broccoli: '🥦',
  helicopter: '🚁', watermelon: '🍉', alligator: '🐊', calendar: '📅', violin: '🎻',
  guitar: '🎸', pineapple: '🍍', unicorn: '🦄', penguin: '🐧', parrot: '🦜', peacock: '🦚', carrot: '🥕', cookie: '🍪', candy: '🍬',
  pizza: '🍕', turkey: '🦃', hotdog: '🌭', laptop: '💻', sunset: '🌅', vest: '🦺', dress: '👗', pants: '👖',
};
