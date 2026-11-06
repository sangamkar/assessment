import type { Item } from "./types";
import { items, txt } from "./helpers";
/** Fresh contexts for the two reading domains with only one authored skill each. */
const vocab = items("r.vocab.mock", [
  {
    difficulty: 1,
    say: "Mira said the path was narrow. Which word means the opposite of narrow?",
    choices: [
      txt("wide"),
      txt("long", "meaning_confusion"),
      txt("rocky", "meaning_confusion"),
    ],
    explain: "Wide is the opposite of narrow. This is about width, not length.",
  },
  {
    difficulty: 1,
    say: "The kitten was silent. Which word means the same as silent?",
    choices: [
      txt("quiet"),
      txt("hungry", "meaning_confusion"),
      txt("sleepy", "meaning_confusion"),
    ],
    explain: "Silent means making no sound, or quiet.",
  },
  {
    difficulty: 2,
    say: "The boat was beneath the bridge. Where was the boat?",
    choices: [
      txt("under the bridge"),
      txt("above the bridge", "meaning_confusion"),
      txt("beside the bridge", "meaning_confusion"),
    ],
    explain: "Beneath means under.",
  },
  {
    difficulty: 2,
    say: "The trail was damp after the rain. What does damp mean?",
    choices: [
      txt("a little wet"),
      txt("very dry", "meaning_confusion"),
      txt("very steep", "meaning_confusion"),
    ],
    explain: "Damp means slightly wet.",
  },
  {
    difficulty: 3,
    say: "A worker will repair the broken gate. What will the worker do?",
    choices: [
      txt("fix the gate"),
      txt("paint a new picture", "meaning_confusion"),
      txt("throw the gate away", "meaning_confusion"),
    ],
    explain: "To repair something is to fix it.",
  },
  {
    difficulty: 3,
    say: "The children gathered near the fountain. What did they do?",
    choices: [
      txt("came together"),
      txt("ran in different directions", "meaning_confusion"),
      txt("fell asleep", "meaning_confusion"),
    ],
    explain: "Gathered means came together in one place.",
  },
]).map((i) => ({ ...i, skill: "r.vocab" }));
const passage = (title: string, text: string) => ({
  kind: "story" as const,
  title,
  lines: [{ emoji: "", text }],
});
const info = items("r.info.mock", [
  {
    difficulty: 1,
    say: "Listen. Bees visit flowers. They collect nectar. What do bees collect?",
    visual: passage("Bees", "Bees visit flowers. They collect nectar."),
    choices: [
      txt("nectar"),
      txt("stones", "detail_not_in_text"),
      txt("snow", "detail_not_in_text"),
    ],
    explain: "The text says bees collect nectar.",
  },
  {
    difficulty: 1,
    say: "Listen. A ramp is a sloping surface. A ramp can help move a cart up to a higher place. What does a ramp help move in this text?",
    visual: passage(
      "A ramp",
      "A ramp is a sloping surface. A ramp can help move a cart up to a higher place.",
    ),
    choices: [
      txt("a cart"),
      txt("a cloud", "detail_not_in_text"),
      txt("a river", "detail_not_in_text"),
    ],
    explain: "The text gives the example of moving a cart.",
  },
  {
    difficulty: 2,
    say: "Listen. Penguins are birds. They cannot fly, but their flippers help them swim. How do flippers help penguins?",
    visual: passage(
      "Penguins",
      "Penguins are birds. They cannot fly, but their flippers help them swim.",
    ),
    choices: [
      txt("They help them swim."),
      txt("They help them fly.", "detail_not_in_text"),
      txt("They help them grow leaves.", "detail_not_in_text"),
    ],
    explain: "The text says their flippers help them swim.",
  },
  {
    difficulty: 2,
    say: "Listen. Rainwater can soak into soil. Roots take in water from the soil. What happens after water soaks into the soil in this text?",
    visual: passage(
      "Rain and roots",
      "Rainwater can soak into soil. Roots take in water from the soil.",
    ),
    choices: [
      txt("Roots take in water."),
      txt("Leaves turn into stones.", "detail_not_in_text"),
      txt("The soil disappears.", "detail_not_in_text"),
    ],
    explain: "Roots take in water from the soil after the rainwater soaks in.",
  },
  {
    difficulty: 3,
    say: "Listen. A map uses symbols for places. A key explains what those symbols mean. If a map has an unfamiliar symbol, what should you check?",
    visual: passage(
      "Map symbols",
      "A map uses symbols for places. A key explains what those symbols mean.",
    ),
    choices: [
      txt("the map key"),
      txt("the weather forecast", "detail_not_in_text"),
      txt("the time on a clock", "detail_not_in_text"),
    ],
    explain:
      "The map key explains the symbols, so it can help with an unfamiliar one.",
  },
  {
    difficulty: 3,
    say: "Listen. Metal spoons and wooden spoons can both stir soup. Metal usually carries heat more easily than wood. What is this text comparing?",
    visual: passage(
      "Two spoons",
      "Metal spoons and wooden spoons can both stir soup. Metal usually carries heat more easily than wood.",
    ),
    choices: [
      txt("two materials used for spoons"),
      txt("two kinds of soup", "detail_not_in_text"),
      txt("two ways to wash plates", "detail_not_in_text"),
    ],
    explain: "The text compares metal and wood, two materials used for spoons.",
  },
]).map((i) => ({ ...i, skill: "r.info" }));
const coinVisual = (values: number[]) => ({
  kind: "coins" as const,
  values,
  symbol: "¢",
});
const coinComparisons = items("m1.coins.mock", [
  {
    difficulty: 3,
    say: "Which of these two groups has the greater total value?",
    show: "Compare the coin values.",
    choices: [
      {
        visual: coinVisual([10, 10, 1]),
        say: "group with three coins",
        correct: true,
      },
      {
        visual: coinVisual([5, 5, 5, 5]),
        say: "group with four coins",
        why: "more_coins_means_more_money",
      },
      txt("They are equal", "coin_value_unknown"),
    ],
    explain:
      "Two dimes and one penny are 21 cents. Four nickels are 20 cents. 21 cents is more.",
  },
  {
    difficulty: 3,
    say: "Which of these two groups has the greater total value?",
    show: "Compare the coin values.",
    choices: [
      {
        visual: coinVisual([10, 1, 1, 1]),
        say: "group with four coins",
        why: "more_coins_means_more_money",
      },
      {
        visual: coinVisual([5, 5, 5]),
        say: "group with three coins",
        correct: true,
      },
      txt("They are equal", "coin_value_unknown"),
    ],
    explain:
      "One dime and three pennies are 13 cents. Three nickels are 15 cents. 15 cents is more.",
  },
]).map((i) => ({ ...i, skill: "m1.coins" }));
const storyChecks = items("r.lit.mock", [
  {
    difficulty: 1,
    say: "Listen. Lila put a blue cup on the table. Who put the cup on the table?",
    visual: passage("A blue cup", "Lila put a blue cup on the table."),
    choices: [
      txt("Lila"),
      txt("a dog", "detail_not_in_text"),
      txt("a pilot", "detail_not_in_text"),
    ],
    explain: "The story says Lila put the cup on the table.",
  },
  {
    difficulty: 1,
    say: "Listen. Ben looked for his hat. It was under his chair. Where was the hat?",
    visual: passage(
      "The missing hat",
      "Ben looked for his hat. It was under his chair.",
    ),
    choices: [
      txt("under his chair"),
      txt("in the garden", "detail_not_in_text"),
      txt("on a bus", "detail_not_in_text"),
    ],
    explain: "The story tells us the hat was under the chair.",
  },
  {
    difficulty: 1,
    say: "Listen. Asha drew a boat. Then she colored it green. What did Asha draw?",
    visual: passage(
      "A drawing",
      "Asha drew a boat. Then she colored it green.",
    ),
    choices: [
      txt("a boat"),
      txt("a house", "detail_not_in_text"),
      txt("a tree", "detail_not_in_text"),
    ],
    explain: "Asha drew a boat.",
  },
  {
    difficulty: 2,
    say: "Listen. Ravi took a towel to the pool. After swimming, he used it to dry himself. What did Ravi do before using the towel?",
    visual: passage(
      "At the pool",
      "Ravi took a towel to the pool. After swimming, he used it to dry himself.",
    ),
    choices: [
      txt("He went swimming."),
      txt("He went to bed.", "sequence_confusion"),
      txt("He dried himself.", "sequence_confusion"),
    ],
    explain: "He swam first, then used the towel to dry himself.",
  },
  {
    difficulty: 2,
    say: "Listen. Jo saw a friend carrying many books. She offered to carry some. Why did Jo offer to carry books?",
    visual: passage(
      "A helping hand",
      "Jo saw a friend carrying many books. She offered to carry some.",
    ),
    choices: [
      txt("to help her friend"),
      txt("to hide all the books", "inference_confusion"),
      txt("to build a wall", "inference_confusion"),
    ],
    explain: "Her friend had many books to carry, so Jo offered help.",
  },
  {
    difficulty: 2,
    say: "Listen. Milo watered his seed each day. At last a green shoot appeared. How did Milo probably feel when the shoot appeared?",
    visual: passage(
      "A green shoot",
      "Milo watered his seed each day. At last a green shoot appeared.",
    ),
    choices: [
      txt("pleased that the seed grew"),
      txt("angry that his shoe was missing", "inference_confusion"),
      txt("afraid of a loud storm", "inference_confusion"),
    ],
    explain:
      "He had cared for the seed, so seeing it grow would likely please him.",
  },
  {
    difficulty: 3,
    say: "Listen. Eva wanted to cross a puddle without wet shoes. She found a dry path around it and walked there. What problem did Eva solve?",
    visual: passage(
      "The puddle",
      "Eva wanted to cross a puddle without wet shoes. She found a dry path around it and walked there.",
    ),
    choices: [
      txt("getting past the puddle with dry shoes"),
      txt("finding her lost lunch", "problem_confusion"),
      txt("learning to swim", "problem_confusion"),
    ],
    explain:
      "Eva solved the problem of getting past the puddle without wet shoes.",
  },
  {
    difficulty: 3,
    say: "Listen. At first the paper tower fell. Kai made its base wider. This time it stayed up. What helped the tower stay up?",
    visual: passage(
      "The paper tower",
      "At first the paper tower fell. Kai made its base wider. This time it stayed up.",
    ),
    choices: [
      txt("making the base wider"),
      txt("making all the paper wet", "cause_effect_confusion"),
      txt("putting the tower away", "cause_effect_confusion"),
    ],
    explain: "The tower stayed up after Kai made the base wider.",
  },
  {
    difficulty: 3,
    say: "Listen. Maya could not reach a high shelf. She asked an adult for help. The adult handed her the book. What is a good title for this story?",
    visual: passage(
      "A story",
      "Maya could not reach a high shelf. She asked an adult for help. The adult handed her the book.",
    ),
    choices: [
      txt("Getting help with a book"),
      txt("A trip to the beach", "main_idea_confusion"),
      txt("Building a new shelf", "main_idea_confusion"),
    ],
    explain: "The main event is Maya asking for help getting a book.",
  },
]).map((i) => ({ ...i, skill: "r.lit" }));
const independentChecks = items("r2.readalone.mock", [
  {
    difficulty: 1,
    say: "Read the story yourself. Why did Lena put the model on a wider board?",
    visual: passage(
      "The model ship",
      "Lena made a model ship from cardboard. The narrow base tipped whenever she added a sail. She placed the ship on a wider board. Now it stayed upright while she worked. Lena added two sails and carried the finished model to her desk.",
    ),
    choices: [
      txt("to stop the model from tipping"),
      txt("to make the sails invisible", "inference_confusion"),
      txt("to hide the ship under the desk", "inference_confusion"),
    ],
    explain: "The narrow base tipped. The wider board helped it stay upright.",
  },
  {
    difficulty: 1,
    say: "Read the story yourself. What did Arun do after noticing the faded sign?",
    visual: passage(
      "The garden sign",
      "Arun helped in the community garden. One morning he noticed that rain had faded the sign by the gate. Visitors could no longer read when the garden opened. Arun asked for a fresh card and wrote a clear new sign. He placed it in a cover to keep it dry.",
    ),
    choices: [
      txt("He made a clearer sign."),
      txt("He locked the garden forever.", "detail_not_in_text"),
      txt("He removed every plant.", "detail_not_in_text"),
    ],
    explain: "Arun wrote a new sign so visitors could read the opening time.",
  },
  {
    difficulty: 1,
    say: "Read the story yourself. Which detail shows that Tia changed her plan?",
    visual: passage(
      "The windy picnic",
      "Tia planned a picnic on the open hill. When she arrived, the wind kept blowing the napkins away. She spotted a sheltered bench near a wall. Tia moved the picnic there and put the napkins under a small basket. The family could finally eat comfortably.",
    ),
    choices: [
      txt("She moved the picnic to a sheltered bench."),
      txt("She planned a picnic on the hill.", "sequence_confusion"),
      txt("Her family brought food.", "detail_not_in_text"),
    ],
    explain:
      "Moving from the hill to the sheltered bench shows how Tia changed her original plan.",
  },
]).map((i) => ({ ...i, skill: "r2.readalone" }));
export const MOCK_ONLY_ITEMS: Item[] = [
  ...vocab,
  ...info,
  ...coinComparisons,
  ...storyChecks,
  ...independentChecks,
];
