import type { Difficulty, Item, Skill } from './types';
import {items, txt} from './helpers';

// Distinct words in the two lists keep the focused check independent of the new practice list.
const practiceWords = ['the','and','you','said','come','here','look','little','play','with','down','make','where','what','have','some','could','would','people','because','after','again','every','under'];
const testWords = ['they','there','were','when','your','from','their','about','other','which','want','many','does','once','give','over','very','know','think','before','around','another','always','first'];
function wordItems(words:string[], reserve:boolean):Item[] {
  return items(reserve?'r.high-frequency.reserved-words':'r.high-frequency',words.map((word,i)=>({
    difficulty:(i<8?1:i<16?2:3) as Difficulty,
    say:reserve?`Tap the printed word ${word}.`:`Find the printed word ${word}.`,
    show:'Find the word.', speakChoices:false,
    choices:[txt(word), ...[1,2,3].map(n=>txt(words[(i+n)%words.length],'lookalike_sight_word'))],
    explain:`This is ${word}, spelled ${word.split('').join(', ')}.`,
  }))).map(item=>({...item,skill:'r.high-frequency'}));
}
type Row=readonly [prompt:string,answer:string,no1:string,no2:string,explain:string];
const practiceVocab:readonly Row[]=[
 ['The kitten was tiny. What does tiny mean?','very small','very loud','very late','Tiny means very small.'],
 ['The pond was shallow. What does shallow mean?','not deep','very hot','very loud','Shallow means not deep.'],
 ['A joyful child is feeling what?','happy','hungry','sleepy','Joyful means feeling joy or happiness.'],
 ['The box was empty. What does empty mean?','nothing is inside','it is very heavy','it is red','Empty means nothing is inside.'],
 ['The path was narrow. What does narrow mean?','not wide','very wet','very long','Narrow means not wide.'],
 ['The dog was weary after a long walk. What does weary mean?','tired','angry','noisy','Weary means tired.'],
 ['The noisy crowd cheered so much that we covered our ears. What does noisy mean?','making a lot of sound','making no sound','moving slowly','We cover our ears when there is a lot of sound, so noisy means making a lot of sound.'],
 ['Nora will gather the blocks. What will she do?','bring them together','throw them away','paint the floor','Gather means bring together.'],
 ['The soup was warm. What is the opposite of warm?','cold','hot','large','Cold is the opposite of warm.'],
 ['Which word means almost the same as quick?','fast','slow','quiet','Quick and fast have similar meanings.'],
 ['The gigantic dinosaur skeleton was taller than our house. What does gigantic mean?','very big','very old','very scary','Taller than a house is a clue that gigantic means very big.'],
 ['A brave child tries even when afraid. What does brave mean?','able to face fear','always sleepy','very small','Brave means able to face fear.'],
 ['The child whispered quietly. What does whispered mean?','spoke very softly','shouted loudly','jumped high','Whispered means spoke very softly.'],
 ['A porch is outside a house. Where is the porch?','outside the house','inside a shoe','under the sea','The sentence says the porch is outside the house.'],
 ['The rough rock had many bumps. What does rough mean?','not smooth','very sweet','very wet','Bumps are a clue that rough means not smooth.'],
 ['The road was dry. What is the opposite of dry?','wet','wide','rough','Wet is the opposite of dry.'],
];
const testVocab:readonly Row[]=[
 ['The swift rabbit was across the field before the fox could blink. What does swift mean?','fast','sleepy','heavy','Crossing a field in a blink is a clue that swift means fast.'],
 ['The glass was fragile and broke easily. What does fragile mean?','easily broken','very loud','hard to see','Fragile means easily broken.'],
 ['Ana was thrilled when she heard she could keep the puppy. She danced around the room. What does thrilled mean?','very excited and happy','very scared','very tired','Dancing around the room is a clue that thrilled means very excited and happy.'],
 ['Every seat on the bus was taken except one vacant seat in the back, so I sat there. What does vacant mean?','empty','broken','very tall','All the other seats were taken and I could sit there, so vacant means empty.'],
 ['The kitten hid beneath the table. Where was it?','under the table','above the table','on the roof','Beneath means under.'],
 ['Jay forgot his umbrella and came home soaked from the rain. What does soaked mean?','very wet','very dry','very loud','Walking in the rain without an umbrella makes you very wet, so soaked means very wet.'],
 ['The library was hushed, and no one said a word. What does hushed mean?','quiet','crowded','bright','No one said a word, so hushed means quiet.'],
 ['A worker will mend the torn coat. What does mend mean?','fix','hide','sell','Mend means fix.'],
 ['The massive truck could not fit under the low bridge. What does massive mean?','very big','very small','very slow','Only something very big would not fit under a bridge, so massive means very big.'],
 ['The sluggish turtle took all morning to cross the garden. What does sluggish mean?','slow','quick','loud','Taking all morning to cross a garden is a clue that sluggish means slow.'],
 ['When his brother broke his robot, Kai was furious. He stomped his feet and yelled. What does furious mean?','very angry','very happy','very hungry','Stomping and yelling after a toy breaks are clues that furious means very angry.'],
 ['It was a frosty morning, and the grass was covered in ice. What does frosty mean?','very cold','very hot','very windy','Ice on the grass is a clue that frosty means very cold.'],
 ['The glossy apple was so shiny that I could see my face in it. What does glossy mean?','shiny','sour','rotten','Seeing your face in it is a clue that glossy means shiny.'],
 ['The bird was perched on a branch. Where was it?','on a branch','under the soil','inside a shoe','Perched here means resting on the branch.'],
 ['The trail was steep and climbed sharply. What does steep mean?','sloping sharply','very quiet','completely flat','Steep means sloping sharply.'],
 ['A shelter keeps animals safe from rain. What does shelter provide?','a protected place','a loud song','a long race','A shelter provides a protected place.'],
];
function vocabItems(rows:readonly Row[],reserve:boolean):Item[]{return items(reserve?'r.word-meanings.reserved-words':'r.word-meanings',rows.map(([say,yes,no1,no2,explain],i)=>({difficulty:(i<6?1:i<11?2:3) as Difficulty,say,choices:[txt(yes),txt(no1,'word_meaning_unknown'),txt(no2,'word_meaning_unknown')],explain}))).map(i=>({...i,skill:'r.word-meanings'}));}
export const WORD_SKILLS:Skill[]=[
 {id:'r.high-frequency',subject:'reading',strand:'hfw',grade:'K',title:'Recognize common high-frequency words',kidTitle:'Everyday words',icon:'👀',standards:['Reading topic checklist'],prereqs:[],parentTip:'Notice which printed words need more practice.',intro:[{say:'Listen to the word, then find it among the printed words.'}],items:wordItems(practiceWords,false)},
 {id:'r.word-meanings',subject:'reading',strand:'vocab',grade:'K',title:'Understand common vocabulary in context',kidTitle:'Word meanings',icon:'💬',standards:['Reading topic checklist'],prereqs:[],parentTip:'Ask which clue helped explain the word.',intro:[{say:'Listen for clues that help you understand each word.'}],items:vocabItems(practiceVocab,false)},
];
export const WORD_MOCK_ITEMS:Item[]=[...wordItems(testWords,true),...vocabItems(testVocab,true)];
