import type { Difficulty, Item, Skill } from './types';
import { items, txt } from './helpers';

type Row = readonly [say:string, answer:string, wrong1:string, wrong2:string, explain:string];
type Spec = {id:string; title:string; kidTitle:string; strand:string; grade:'K'|'1'; icon:string; rows:readonly Row[]; quiet?:boolean; tag:string};
const spellingRows = (rows: readonly (readonly [string,string,string])[], pattern:string): Row[] => rows.map(([word, bad1, bad2]) => [`Which spelling shows the word ${word}?`,word,bad1,bad2,`${word} is spelled ${word.split('').join(', ')}. ${pattern}`]);
const specs: Spec[] = [
{id:'r1.spell-r',title:'Read and choose spellings of r-controlled words',kidTitle:'Spell with R',strand:'phonics',grade:'1',icon:'🚗',quiet:true,tag:'r_controlled_spelling',rows:spellingRows([
 ['car','cer','cur'],['star','ster','stur'],['park','perk','pirk'],['farm','ferm','furm'],['corn','carn','cirn'],['fork','fark','furk'],['horn','harn','hirn'],['storm','starm','sterm'],['bird','bard','bord'],['shirt','shart','short'],['turn','tarn','torn'],['burn','barn','born']
], 'Listen for the vowel and r together.')},
{id:'r1.spell-blends',title:'Read and choose spellings with consonant blends',kidTitle:'Blend spellings',strand:'phonics',grade:'1',icon:'🔠',quiet:true,tag:'consonant_blend_confusion',rows:spellingRows([
 ['frog','fog','frok'],['flag','fag','flak'],['drum','dum','drim'],['trip','tip','trup'],['stop','top','stip'],['step','sep','stap'],['crab','cab','creb'],['clap','cap','clep'],['nest','net','nast'],['hand','had','hend'],['lamp','lap','lemp'],['milk','mik','mulk']
], 'Listen for both consonant sounds in the blend.')},
{id:'r1.spell-vowel',title:'Choose spellings with silent e and vowel teams',kidTitle:'Long vowel spelling',strand:'phonics',grade:'1',icon:'🚂',quiet:true,tag:'vowel_team_confusion',rows:spellingRows([
 ['cake','cack','kake'],['bike','bick','biek'],['home','hom','hoam'],['cute','cut','cuut'],['rain','rane','rean'],['seed','sead','sed'],['boat','boet','bot'],['night','nite','niht'],['tree','tre','trea'],['coat','coet','cot'],['feet','fet','feete'],['tail','taill','tael']
], 'Use the spelling pattern in the word.')},
{id:'r1.spell-variant',title:'Choose spellings of common vowel patterns',kidTitle:'More vowel patterns',strand:'phonics',grade:'1',icon:'🌧️',quiet:true,tag:'vowel_pattern_confusion',rows:spellingRows([
 ['cow','caw','cuw'],['coin','coyn','cain'],['house','hous','hause'],['cloud','clowd','claud'],['toy','toi','tay'],['moon','mun','moun'],['book','buk','boak'],['ball','bal','bawl'],['soil','soyl','soal'],['town','toun','tawn'],['food','fud','foud'],['look','luk','loak']
], 'Look carefully at the vowel pattern.')},
{id:'r1.soft-sounds',title:'Read and spell words with soft c and g',kidTitle:'Soft C and G',strand:'phonics',grade:'1',icon:'🧊',quiet:true,tag:'soft_letter_confusion',rows:spellingRows([
 ['face','fasse','faze'],['ice','ise','ize'],['rice','rise','rize'],['mice','mise','mize'],['city','sity','zity'],['cent','centt','zent'],['page','paje','paze'],['cage','caje','caze'],['gem','jem','zem'],['giant','jiant','ziant'],['race','rase','raze'],['cereal','sereal','zereel']
], 'In this word the letter c or g has a soft sound.')},
{id:'r1.syllable-spell',title:'Read and choose multisyllable spellings',kidTitle:'Word parts together',strand:'phonics',grade:'1',icon:'🦋',quiet:true,tag:'syllable_spelling_confusion',rows:spellingRows([
 ['sunset','sunzet','sunseth'],['basket','baskit','baskut'],['napkin','napken','napkun'],['rabbit','rabit','rabbot'],['picnic','picnik','picknic'],['magnet','magnit','magnett'],['kitten','kittun','kitton'],['pumpkin','pumpken','pumpkun'],['candle','candl','candul'],['table','tabl','tabul'],['apple','aple','appul'],['purple','purpl','purpul']
], 'Read the word in parts and check the whole spelling.')},
{id:'r.syllable-compare',title:'Compare the number of syllables in words',kidTitle:'Compare word beats',strand:'phonological',grade:'K',icon:'🥁',tag:'syllable_count_confusion',rows:[
 ['Which word has more syllables: cat, tiger, or dog?','tiger','cat','dog','Tiger has two beats; cat and dog each have one.'],
 ['Which word has more syllables: sun, rabbit, or moon?','rabbit','sun','moon','Rabbit has two beats; sun and moon each have one.'],
 ['Which word has more syllables: frog, elephant, or fish?','elephant','frog','fish','Elephant has three beats; frog and fish each have one.'],
 ['Which word has more syllables: boat, banana, or car?','banana','boat','car','Banana has three beats; boat and car each have one.'],
 ['Which word has more syllables: tree, apple, or leaf?','apple','tree','leaf','Apple has two beats; tree and leaf each have one.'],
 ['Which word has more syllables: bed, potato, or chair?','potato','bed','chair','Potato has three beats; bed and chair each have one.'],
 ['Which word has more syllables: shoe, window, or sock?','window','shoe','sock','Window has two beats; shoe and sock each have one.'],
 ['Which word has more syllables: train, butterfly, or bus?','butterfly','train','bus','Butterfly has three beats; train and bus each have one.'],
 ['Which word has more syllables: cup, table, or plate?','table','cup','plate','Table has two beats; cup and plate each have one.'],
 ['Which word has more syllables: pen, umbrella, or book?','umbrella','pen','book','Umbrella has three beats; pen and book each have one.'],
 ['Which word has more syllables: hat, pencil, or coat?','pencil','hat','coat','Pencil has two beats; hat and coat each have one.'],
 ['Which word has more syllables: bear, alligator, or fox?','alligator','bear','fox','Alligator has four beats; bear and fox each have one.']
]},
{id:'r.sound-position',title:'Identify the first, middle, and last sound',kidTitle:'Sounds in order',strand:'phonological',grade:'K',icon:'👂',tag:'sound_position_confusion',rows:[
 ['What sound comes first in map?','m as in moon','s as in sun','t as in top','Map starts with the m sound.'],
 ['What sound comes last in map?','p as in pan','m as in moon','t as in top','Map ends with the p sound.'],
 ['What sound comes first in sun?','s as in sun','m as in moon','t as in top','Sun starts with the s sound.'],
 ['What sound comes last in sun?','n as in nest','s as in sun','t as in top','Sun ends with the n sound.'],
 ['What vowel sound is in the middle of cat?','short a as in apple','short i as in insect','short u as in up','Cat has short a in the middle.'],
 ['What vowel sound is in the middle of sit?','short i as in insect','short a as in apple','short u as in up','Sit has short i in the middle.'],
 ['What sound comes first in dog?','d as in dog','m as in moon','t as in top','Dog starts with the d sound.'],
 ['What sound comes last in dog?','g as in goat','d as in dog','t as in top','Dog ends with the g sound.'],
 ['What sound comes first in fan?','f as in fish','n as in nest','t as in top','Fan starts with the f sound.'],
 ['What sound comes last in fan?','n as in nest','f as in fish','t as in top','Fan ends with the n sound.'],
 ['What vowel sound is in the middle of bed?','short e as in egg','short a as in apple','short u as in up','Bed has short e in the middle.'],
 ['What vowel sound is in the middle of cup?','short u as in up','short i as in insect','short o as in octopus','Cup has short u in the middle.']
]},

{id:'r1.long-short',title:'Compare long and short vowel sounds',kidTitle:'Long or short vowels',strand:'phonological',grade:'1',icon:'🔊',tag:'vowel_sound_confusion',rows:[
 ['Which word has the long a sound as in acorn?','cake','cat','cup','Cake has the long a sound.'],
 ['Which word has the short a sound as in apple?','map','mop','mule','Map has the short a sound.'],
 ['Which word has the long e sound as in eagle?','tree','trap','truck','Tree has the long e sound.'],
 ['Which word has the short e sound as in egg?','hen','horn','home','Hen has the short e sound.'],
 ['Which word has the long i sound as in ice?','bike','book','back','Bike has the long i sound.'],
 ['Which word has the short i sound as in insect?','pin','pan','pine','Pin has the short i sound.'],
 ['Which word has the long o sound as in open?','boat','bat','bit','Boat has the long o sound.'],
 ['Which word has the short o sound as in octopus?','mop','map','moon','Mop has the short o sound.'],
 ['Which word has the long a sound as in acorn?','rain','run','red','Rain has the long a sound.'],
 ['Which word has the short e sound as in egg?','net','nut','note','Net has the short e sound.'],
 ['Which word has the long i sound as in ice?','kite','kit','cat','Kite has the long i sound.'],
 ['Which word has the short u sound as in up?','sun','sail','seen','Sun has the short u sound.']
]},
{id:'r1.syllable-join',title:'Blend spoken syllables into a word',kidTitle:'Join word beats',strand:'phonological',grade:'1',icon:'🧩',tag:'syllable_count_confusion',rows:[
 ['Put these word parts together: sun, set. What word do they make?','sunset','sunshine','supper','Sun and set make sunset.'],
 ['Put these word parts together: rain, bow. What word do they make?','rainbow','raincoat','rabbit','Rain and bow make rainbow.'],
 ['Put these word parts together: foot, ball. What word do they make?','football','footprint','flower','Foot and ball make football.'],
 ['Put these word parts together: cup, cake. What word do they make?','cupcake','cupboard','catfish','Cup and cake make cupcake.'],
 ['Put these word parts together: bath, tub. What word do they make?','bathtub','bathroom','button','Bath and tub make bathtub.'],
 ['Put these word parts together: bed, room. What word do they make?','bedroom','bedtime','balloon','Bed and room make bedroom.'],
 ['Put these word parts together: snow, man. What word do they make?','snowman','snowball','sandwich','Snow and man make snowman.'],
 ['Put these word parts together: tooth, brush. What word do they make?','toothbrush','toothpaste','turtle','Tooth and brush make toothbrush.'],
 ['Put these word parts together: pan, cake. What word do they make?','pancake','panhandle','pumpkin','Pan and cake make pancake.'],
 ['Put these word parts together: rain, coat. What word do they make?','raincoat','rainbow','rocket','Rain and coat make raincoat.'],
 ['Put these word parts together: star, fish. What word do they make?','starfish','starlight','strawberry','Star and fish make starfish.'],
 ['Put these word parts together: sand, box. What word do they make?','sandbox','sandwich','sandal','Sand and box make sandbox.']
]},

{id:'r1.sight-spell',title:'Choose spellings of high-frequency words',kidTitle:'Spell sight words',strand:'hfw',grade:'1',icon:'👀',quiet:true,tag:'sight_word_unknown',rows:spellingRows([
 ['said','sed','saed'],['what','whut','whatt'],['have','hav','hove'],['come','cum','com'],['some','sum','som'],['they','thay','theyh'],['was','waz','wasz'],['one','wun','onne'],['does','duz','doez'],['friend','frend','frind'],['could','cud','culd'],['again','agen','agaen']
], 'Look carefully at all the letters.')},
{id:'r.vowel-letter',title:'Find a vowel letter in a short word',kidTitle:'Find the vowel',strand:'phonics',grade:'K',icon:'🔤',tag:'vowel_letter_confusion',rows:[
 ['Which letter is the vowel in cat?','a','c','t','The vowel in cat is a.'],
 ['Which letter is the vowel in bed?','e','b','d','The vowel in bed is e.'],
 ['Which letter is the vowel in pig?','i','p','g','The vowel in pig is i.'],
 ['Which letter is the vowel in dog?','o','d','g','The vowel in dog is o.'],
 ['Which letter is the vowel in sun?','u','s','n','The vowel in sun is u.'],
 ['Which letter is the vowel in hat?','a','h','t','The vowel in hat is a.'],
 ['Which letter is the vowel in net?','e','n','t','The vowel in net is e.'],
 ['Which letter is the vowel in sit?','i','s','t','The vowel in sit is i.'],
 ['Which letter is the vowel in pot?','o','p','t','The vowel in pot is o.'],
 ['Which letter is the vowel in cup?','u','c','p','The vowel in cup is u.'],
 ['Which letter is the vowel in bag?','a','b','g','The vowel in bag is a.'],
 ['Which letter is the vowel in web?','e','w','b','The vowel in web is e.']
]},

{id:'r.spell-short',title:'Choose spellings of short-vowel words',kidTitle:'Short vowel spelling',strand:'phonics',grade:'K',icon:'✏️',quiet:true,tag:'vowel_sound_confusion',rows:spellingRows([
 ['cat','cet','cut'],['bag','beg','bug'],['bed','bad','bud'],['hen','han','hun'],['pig','pag','pug'],['sit','sat','sut'],['dog','dig','dug'],['pot','pit','put'],['sun','san','sin'],['cup','cap','cip'],['jam','jim','jum'],['net','nat','nit']
], 'Listen for the short vowel in the middle.')},
{id:'r1.spell-digraph',title:'Choose spellings with common consonant digraphs',kidTitle:'Spell with letter teams',strand:'phonics',grade:'1',icon:'🧩',quiet:true,tag:'digraph_confusion',rows:spellingRows([
 ['ship','sip','shup'],['shop','sop','shup'],['fish','fis','fush'],['dish','dis','dush'],['chip','cip','chup'],['chin','cin','chun'],['chop','cop','chup'],['such','suc','suchh'],['thin','tin','thun'],['thick','tick','thuck'],['path','pat','peth'],['bath','bat','beth']
], 'The two letters work together for one sound.')},
];

export const EXPANDED_READING_SKILLS: Skill[] = specs.map(s => ({id:s.id, subject:'reading',strand:s.strand,grade:s.grade,title:s.title,kidTitle:s.kidTitle,icon:s.icon,standards:['Reading topic checklist'],prereqs:[],parentTip:'Ask which sound or spelling helped with the answer.',intro:[{say:`Let's practice ${s.kidTitle.toLowerCase()}.`}],items:build(s,s.rows.slice(0,8),false)}));
export const EXPANDED_READING_MOCK: Item[] = specs.flatMap(s => build(s,s.rows.slice(8),true));
function build(s:Spec, rows:readonly Row[], mock:boolean): Item[] { return items(mock ? `${s.id}.reserved-reading` : s.id, rows.map(([say,answer,no1,no2,explain],n) => ({difficulty:(n%3+1) as Difficulty,say,visual:s.id === 'r.vowel-letter' ? {kind:'text' as const,text:say.match(/in (\w+)\?$/)![1],size:'xl' as const} : undefined,choices:[txt(answer),txt(no1,s.tag),txt(no2,s.tag)],explain,speakChoices:!s.quiet}))).map(i => ({...i,skill:s.id})); }
