/**
 * Parent-facing descriptions of the misconception tags on wrong choices.
 * Every tag gets a readable fallback; the ones that recur across many items
 * get a curated explanation and a concrete fix.
 */
export interface MisconceptionInfo {
  title: string;
  fix?: string;
}

/** Tags that mean "a nearby but random wrong answer" — not a pattern worth reporting. */
export const NOISE_TAGS = new Set(['near_miss', 'not_in_story', 'not_in_text', 'not_true', 'no_association']);

const CURATED: Record<string, MisconceptionInfo> = {
  count_skipped_one: { title: 'Skips an object while counting', fix: 'Have him touch or move each object as he counts it.' },
  count_double_tap: { title: 'Counts an object twice', fix: 'Line objects up and push each one aside after counting it.' },
  teen_counted_extras_only: { title: 'Teen numbers: forgets the ten', fix: 'Build teens with a full ten frame plus extras; say "ten and four is fourteen".' },
  teen_digit_reversal: { title: 'Reverses teen digits (14 → 41)', fix: 'Point out that the 1 in teen numbers means ONE ten.' },
  decade_transition: { title: 'Gets stuck crossing a decade (29 → 30)', fix: 'Count across decades out loud daily: 28, 29, 30, 31.' },
  ones_instead_of_tens: { title: 'Counts by ones when asked to count by tens', fix: 'Bundle sticks in tens and count bundles: 10, 20, 30.' },
  tens_counted_as_ones: { title: 'Counts groups of ten as ones', fix: 'Ask "How many in EACH group?" before counting groups.' },
  more_fewer_confusion: { title: 'Mixes up "more" and "fewer"', fix: 'Line up two groups one-to-one; the group with leftovers has more.' },
  subtracted_instead: { title: 'Subtracts when the story adds', fix: 'Act out stories with toys; ask "Is the group getting bigger or smaller?"' },
  added_instead: { title: 'Adds when the story subtracts or compares', fix: 'Act it out: "Are some going away?"' },
  answered_part_taken: { title: 'Answers with the part taken away', fix: 'Ask "How many are LEFT?" and cover the ones taken.' },
  answered_one_part: { title: 'Answers with one part instead of the total', fix: 'Push the two groups together, then count all.' },
  gave_whole: { title: 'Gives the whole instead of the missing part', fix: 'Use number bonds: cover one part and ask what is hiding.' },
  counted_filled_not_empty: { title: 'Counts filled boxes instead of empty ones', fix: 'Ask "How many MORE?" and point at the empty spaces.' },
  pattern_core_not_found: { title: 'Does not find the repeating unit in a pattern', fix: 'Say the pattern aloud and circle the part that repeats.' },
  compared_ends_not_length: { title: 'Compares where objects end, not their whole length', fix: 'Always line up objects at the same starting line.' },
  graph_wrong_row: { title: 'Reads the wrong row of a graph', fix: 'Have him point to the picture first, then count across.' },
  shape_name_confusion: { title: 'Mixes up shape names', fix: 'Shape hunts at home; name and trace shapes daily.' },
  orientation_dependence: { title: 'Thinks a turned shape is a different shape', fix: 'Turn paper shapes around: "Still a triangle?"' },
  size_dependence: { title: 'Thinks small or big changes the shape', fix: 'Compare big and small versions of the same shape.' },
  accepts_open_shape: { title: 'Accepts shapes with gaps', fix: 'Shapes must be closed: "Could a bug get out?"' },
  accepts_curved_sides: { title: 'Accepts curved sides as straight', fix: 'Run a finger along each side: is it straight?' },
  square_rectangle_confusion: { title: 'Mixes up square and rectangle', fix: 'Measure sides with string: a square’s sides are all equal.' },
  side_count_confusion: { title: 'Miscounts sides', fix: 'Put a sticker on each side as it is counted.' },
  corner_count_confusion: { title: 'Miscounts corners', fix: 'Put a finger on each corner while counting.' },
  above_below_confusion: { title: 'Mixes up above and below', fix: 'Play Simon Says with position words.' },
  same_start_not_rhyme: { title: 'Picks words that start the same instead of rhyming', fix: 'Rhymes match at the END: "cat-hat", not "cat-car".' },
  meaning_not_sound: { title: 'Chooses by meaning instead of sound', fix: 'Remind him: "Listen to how it SOUNDS, not what it means."' },
  no_rhyme_awareness: { title: 'Not yet hearing rhymes', fix: 'Read rhyming books daily and pause for him to fill in the rhyme.' },
  used_first_sound_only: { title: 'Blends only the first sound', fix: 'Robot-talk games with all sounds stretched: "sss-uuu-nnn".' },
  used_first_letter_only: { title: 'Reads only the first letter and guesses', fix: 'Have him point to and say EVERY letter before reading the word.' },
  vowel_confusion: { title: 'Mixes up short vowel sounds', fix: 'Practice vowel pairs: pin/pan/pen with picture cards.' },
  final_sound_ignored: { title: 'Ignores the last sound when reading', fix: 'Sweep a finger to the very end of the word.' },
  voicing_confusion: { title: 'Mixes similar sounds (b/p, d/t, f/v)', fix: 'Feel the throat: b buzzes, p is just air.' },
  letter_reversal_or_lookalike: { title: 'Confuses look-alike letters (b/d/p/q)', fix: 'Use the "bed" trick: b and d make the headboard and footboard.' },
  lookalike_sight_word: { title: 'Confuses look-alike sight words (was/saw)', fix: 'Practice the pair side by side and point to the first letter.' },
  sight_word_unknown: { title: 'Sight word not yet known', fix: 'Add it to the weekly fridge words.' },
  digraph_confusion: { title: 'Mixes up sh / ch / th', fix: 'Quiet "sh" (finger on lips) vs. train "ch".' },
  ignored_silent_e: { title: 'Ignores silent e', fix: 'Magic-e card: add an e to pin → pine and hear the change.' },
  sequence_error: { title: 'Mixes up story order', fix: 'Retell stories with first / next / last fingers.' },
  detail_error: { title: 'Misses key details when listening', fix: 'Ask one detail question after each page of a read-aloud.' },
  minor_detail_as_main: { title: 'Picks a small detail instead of the main idea', fix: 'Ask "Who/what is on almost every page?"' },
  detail_as_main_topic: { title: 'Picks a detail as the main topic', fix: 'Ask "What is it MOSTLY about?"' },
  inference_from_wrong_detail: { title: 'Draws a conclusion from the wrong clue', fix: 'Ask "Which words in the story tell you?"' },
  association_not_relation: { title: 'Analogies: picks something related but not the same connection', fix: 'Say the connection out loud first: "A dog EATS a bone."' },
  copied_first_pair: { title: 'Analogies: copies the first pair', fix: 'Remind him the answer goes with the NEW picture.' },
  copied_cell_above: { title: 'Matrices: copies a neighbouring box', fix: 'Say the row rule AND the column rule before choosing.' },
  copied_cell_left: { title: 'Matrices: copies a neighbouring box', fix: 'Say the row rule AND the column rule before choosing.' },
  mirror_vs_turn: { title: 'Confuses a flipped shape with a turned shape', fix: 'Use cut-out shapes: turn on the table vs. flip over.' },
  rule_not_found: { title: 'Does not find the grouping rule', fix: 'Ask "What is the same about three of them?"' },
  distracted_by_irrelevant_attribute: { title: 'Distracted by size/color/turn that does not matter', fix: 'Name every attribute, then find the one that matters.' },
  moves_means_alive: { title: 'Thinks things that move are alive', fix: 'Living things grow, eat/drink and have babies.' },
  size_predicts_sinking: { title: 'Thinks big things sink and small things float', fix: 'Test it in the bath: beach ball vs. marble.' },
  need_want_confusion: { title: 'Mixes up needs and wants', fix: 'Ask "Could you live without it?"' },
  then_now_confusion: { title: 'Mixes up long ago and today', fix: 'Compare old and new photos of the same thing.' },
};

export function describeMisconception(tag: string): MisconceptionInfo {
  if (CURATED[tag]) return CURATED[tag];
  const words = tag.replace(/_/g, ' ');
  return { title: words.charAt(0).toUpperCase() + words.slice(1) };
}
