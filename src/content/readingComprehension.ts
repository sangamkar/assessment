import type { Difficulty, Item, Skill } from './types';
import {items, txt} from './helpers';
type Row = readonly [string,string,string,string,string];
type Spec = {id:string; title:string; kidTitle:string; strand:'lit'|'info'|'vocab'; grade:'K'|'1'; icon:string; rows:readonly Row[]; quiet?:boolean};
const specs:Spec[] = [
{id:'r.story-order', title:'Order events and predict what happens next', kidTitle:'Story order', strand:'lit',grade:'K',icon:'📚',rows:[
 ['First Jay put on socks. Next he put on shoes. What did Jay put on first?','socks','shoes','a hat','Jay put on socks before shoes.'],
 ['First Mia washed an apple. Next she ate it. What happened after Mia washed the apple?','she ate it','she planted it','she drew it','Mia ate the apple after washing it.'],
 ['First a seed was planted. Next it grew leaves. What happened first?','the seed was planted','leaves grew','a bird sang','The seed was planted first.'],
 ['First Ben opened his book. Then he read it. What did Ben do last?','read the book','opened the book','painted the book','Ben read it after opening it.'],
 ['A ball rolled toward a puddle. What might happen next?','the ball gets wet','the puddle turns into a tree','the ball becomes a bird','A ball entering a puddle could get wet.'],
 ['A child puts ice in a warm room. What might happen next?','the ice melts','the ice grows feathers','the room becomes a fish','Ice can melt in a warm room.'],
 ['First Ada drew a picture. Next she colored it. What happened before coloring?','she drew it','she mailed it','she erased it','Ada drew the picture before coloring it.'],
 ['First the bell rang. Then the children left class. What happened last?','the children left','the bell rang','the school was built','The children left after the bell rang.'],
 ['First Ravi poured water into a pot. Then he watered a plant. What happened first?','he filled the pot','he watered the plant','he picked an apple','Ravi filled the pot before watering.'],
 ['First Kim folded paper. Next she drew a star on it. What did she do last?','drew a star','folded paper','baked bread','Kim drew a star after folding the paper.'],
 ['A child drops a spoon into water. What might happen next?','the spoon gets wet','the spoon turns into a bird','the water turns to paper','A spoon in water gets wet.'],
 ['A child opens an umbrella as rain begins. What might happen next?','the umbrella helps keep rain off','the umbrella makes the sun disappear','the rain turns to toys','An umbrella can block rain.']
]},
{id:'r1.narrator', title:'Identify the narrator and point of view',kidTitle:'Who tells it?',strand:'lit',grade:'1',icon:'💬',rows:[
 ['Listen: I am Mira. I lost my hat. Who is telling the story?','Mira','the hat','a dog','Mira says I am Mira.'],
 ['Listen: I am Ben. My kite is red. Who is telling the story?','Ben','the kite','a teacher','Ben tells about his kite.'],
 ['Listen: I am Tara. I feed my fish. Who is telling the story?','Tara','the fish','a cat','Tara tells about feeding her fish.'],
 ['Listen: I am Ravi. My bike is blue. Who is telling the story?','Ravi','the bike','a tree','Ravi tells about his bike.'],
 ['Listen: I am Ana. I planted a seed. Who is telling the story?','Ana','the seed','a cloud','Ana says she planted the seed.'],
 ['Listen: I am Leo. I found a shell. Who is telling the story?','Leo','the shell','a bee','Leo tells about finding the shell.'],
 ['Listen: I am Sam. I baked bread. Who is telling the story?','Sam','the bread','a bird','Sam says he baked bread.'],
 ['Listen: I am Nia. My dog ran home. Who is telling the story?','Nia','the dog','a bus','Nia tells about her dog.'],
 ['Listen: I am Zoe. I painted a star. Who is telling the story?','Zoe','the star','a frog','Zoe says she painted the star.'],
 ['Listen: I am Max. My boat is small. Who is telling the story?','Max','the boat','a whale','Max tells about his boat.'],
 ['Listen: I am Eva. I read a poem. Who is telling the story?','Eva','the poem','a mouse','Eva says she read the poem.'],
 ['Listen: I am Eli. I see a rainbow. Who is telling the story?','Eli','the rainbow','a lion','Eli tells what he sees.']
]},
{id:'r1.text-features',title:'Use book parts and text features',kidTitle:'Book clues',strand:'info',grade:'1',icon:'📖',rows:[
 ['Where can you find the title of a book?','on its cover','inside a shoe','under a chair','A cover can show a book title.'],
 ['A table of contents lists chapters and page numbers. What can it help you find?','where a chapter begins','the weather outside','a lost sock','The contents list helps locate a chapter.'],
 ['A caption is words beside a picture. What can a caption do?','explain the picture','turn the page','change the weather','A caption can explain a picture.'],
 ['A heading names a section. What does it help you find?','what the section is about','who owns a pencil','the time of day','A heading tells the section topic.'],
 ['An index lists topics and page numbers. What can it help you find?','pages about a topic','the size of a desk','a song to sing','An index helps locate topics in a book.'],
 ['A diagram labels the parts of a plant. What does a label tell you?','the name of a part','the price of lunch','the day of the week','A label can name a part.'],
 ['A glossary explains words in a book. What can you look up there?','a word meaning','a bus route','a birthday','A glossary explains word meanings.'],
 ['A picture shows a butterfly. Its caption says wings help it fly. What do the words explain?','the picture','a recipe','a map of the moon','A caption can give information about a picture.'],
 ['A book cover says Ocean Animals. What is Ocean Animals likely to be?','the title','a page number','a shoe size','The title can be printed on the cover.'],
 ['A contents page says Birds begins on page six. Where should you look?','page six','page one hundred','the back of a chair','The contents page gives page six.'],
 ['A diagram has an arrow to the root and the word root. What is root?','a label','the title of a song','a question','The word names the part the arrow points to.'],
 ['A glossary says habitat means a place an animal lives. What does habitat mean here?','a place an animal lives','a kind of shoe','a number','The glossary gives the meaning.']
]},
{id:'r1.cause-effect',title:'Identify causes, effects and comparisons in text',kidTitle:'Why and what happened',strand:'info',grade:'1',icon:'🔍',rows:[
 ['Rain fell, so the path became wet. What made the path wet?','rain','sunshine','a book','Rain caused the wet path.'],
 ['The sun warmed the ice, so it melted. What happened because of the warmth?','the ice melted','a tree grew overnight','the sun turned blue','Warmth caused the ice to melt.'],
 ['A plant had no water, so its leaves drooped. Why did the leaves droop?','it had no water','it wore a hat','it read a story','The text says the plant had no water.'],
 ['The bell rang, so the class lined up. What happened after the bell?','the class lined up','the bell grew legs','the school flew away','The class lined up after the bell.'],
 ['A frog and a duck can both swim. What is the same?','both can swim','both have feathers','both live only in trees','The sentence says both swim.'],
 ['A cat has fur. A bird has feathers. How are they different?','one has fur and one has feathers','both have wheels','both are plants','The text names different coverings.'],
 ['The wind blew the paper away. What caused the paper to move?','wind','a book','a shoe','The wind blew the paper.'],
 ['Nia watered the dry soil. What did she add to the soil?','water','sandwiches','stars','Nia added water.'],
 ['A rabbit has fur and a fish has scales. Which has scales?','fish','rabbit','both','The sentence says the fish has scales.'],
 ['The glass fell and broke. What happened after the fall?','the glass broke','the glass became a cloud','the glass grew','The glass broke when it fell.'],
 ['A bee and a butterfly both have wings. What do both have?','wings','boots','shells','The sentence says both have wings.'],
 ['Snow fell, so the road was covered in snow. What covered the road?','snow','leaves','sand','The falling snow covered the road.']
]},
{id:'r1.word-context',title:'Use context clues and word relationships',kidTitle:'Word meaning clues',strand:'vocab',grade:'1',icon:'💡',rows:[
 ['The tiny mouse fit in a small hole. What does tiny mean?','small','huge','loud','The clue small tells us tiny means small.'],
 ['The chilly water made Kim shiver. What does chilly mean?','cold','hot','sweet','Shivering in water is a clue that chilly means cold.'],
 ['Mira was delighted and smiled with joy. What does delighted mean?','very happy','very sleepy','very muddy','Smiled with joy is a clue to happy.'],
 ['The enormous whale was very big. What does enormous mean?','very big','very tiny','very quiet','Very big explains enormous.'],
 ['The path was damp, or a little wet. What does damp mean?','a little wet','very dry','very noisy','The words a little wet explain damp.'],
 ['The puppy was silent and made no sound. What does silent mean?','quiet','hungry','heavy','Made no sound explains silent.'],
 ['The basket was empty; nothing was inside. What does empty mean?','nothing inside','full to the top','painted red','Nothing inside explains empty.'],
 ['The speedy rabbit ran very fast. What does speedy mean?','fast','slow','small','Ran very fast explains speedy.'],
 ['The child was exhausted and needed sleep. What does exhausted mean?','very tired','very hungry','very tall','Needing sleep is a clue to being very tired.'],
 ['The rock was smooth, with no rough bumps. What does smooth mean?','not rough','very loud','very hot','No rough bumps explains smooth.'],
 ['The trail was narrow, not wide. What does narrow mean?','not wide','very long','very noisy','Not wide explains narrow.'],
 ['A worker will repair, or fix, the gate. What does repair mean?','fix','hide','lose','The word fix explains repair.']
]},

{id:'r1.author-purpose',title:'Identify why a text was written',kidTitle:'Why was it written?',strand:'info',grade:'1',icon:'✍️',rows:[
 ['A page gives facts about how bees gather nectar. Why was it written?','to teach about bees','to sell a bicycle','to tell the time','The page gives facts, so it teaches.'],
 ['A sign says please keep the park clean. What does the sign ask people to do?','keep the park clean','buy a pet','close the library','The sign asks people to keep the park clean.'],
 ['A page explains how to plant a seed. Why was it written?','to give instructions','to make a thunderstorm','to describe a birthday cake','The page gives steps for planting.'],
 ['A story tells about a talking squirrel on an adventure. What is one purpose?','to entertain with a story','to give a bus schedule','to label a plant','The adventure is a story for readers to enjoy.'],
 ['A page gives facts about whales and where they live. Why was it written?','to teach about whales','to sell a hat','to show a recipe','The page gives facts about whales.'],
 ['A recipe lists steps to make soup. Why was it written?','to show how to make soup','to name the planets','to tell a joke','A recipe gives instructions.'],
 ['A sign says return books here. What does it tell people?','where to put returned books','where to find a pet','how to plant a tree','The sign gives a location for returned books.'],
 ['A story describes a dragon looking for a friend. What is one purpose?','to entertain with a story','to show train times','to list animal facts','A story about a dragon can entertain.'],
 ['A page explains how frogs grow. Why was it written?','to teach about frogs','to sell a car','to list a lunch menu','It gives information about frogs.'],
 ['A sign says wash your hands. What does it ask people to do?','wash their hands','paint a wall','sing a song','The sign asks people to wash their hands.'],
 ['A page lists steps for folding a paper boat. Why was it written?','to give instructions','to tell a scary story','to give the date','The page explains steps to follow.'],
 ['A story tells about a mouse exploring the moon. What is one purpose?','to entertain with a story','to explain a real bus route','to label a tree','The imaginary adventure can entertain.']
]},
{id:'r1.lesson',title:'Identify a simple story lesson',kidTitle:'Story lessons',strand:'lit',grade:'1',icon:'💭',rows:[
 ['Lina shared her crayons so her friend could draw too. What lesson fits?','sharing can help a friend','never draw a picture','crayons can fly','Lina helped by sharing.'],
 ['A turtle kept practicing and learned to swim better. What lesson fits?','practice can help you improve','never try again','water is made of paper','The turtle improved by practicing.'],
 ['A child returned a lost toy to its owner. What lesson fits?','return things that are not yours','hide every toy','toys grow on trees','The child returned what belonged to someone else.'],
 ['A child asked for help with a heavy box. Together they moved it. What lesson fits?','working together can help','boxes can talk','never ask for help','The children moved it together.'],
 ['Mina spilled water and wiped it up. What lesson fits?','take care of a mess you make','water is always dry','never use a cup','Mina cleaned up her spill.'],
 ['A boy listened while his friend explained the rules. Then they played together. What lesson fits?','listening can help friends play together','rules are made of sand','never play with friends','Listening helped them play.'],
 ['A girl tried a hard puzzle again and solved it. What lesson fits?','keep trying when something is hard','puzzles are food','always give up','Trying again helped her solve it.'],
 ['A child thanked a neighbor for help. What lesson fits?','show thanks when someone helps','neighbors are clouds','never speak to anyone','The child thanked the helpful neighbor.'],
 ['Two friends took turns on a swing so both could play. What lesson fits?','taking turns can be fair','swings are fish','only one person should play','Taking turns let both friends play.'],
 ['A child found a mistake and fixed it. What lesson fits?','mistakes can be corrected','mistakes are animals','never look again','The child corrected the mistake.'],
 ['A girl held the door for a neighbor carrying boxes. What lesson fits?','small acts can help others','doors can sing','boxes grow leaves','Holding the door helped the neighbor.'],
 ['A team planned together and built a tower. What lesson fits?','working together can help','towers are made of rain','never make a plan','The team planned and built together.']
]},

{id:'r1.homophones',title:'Choose a homophone that fits a sentence',kidTitle:'Same sound words',strand:'vocab',grade:'1',icon:'👂',quiet:true,rows:[
 ['Choose the word for the blank. We sailed on the blank.','sea','see','say','Sea means a large body of salt water.'],
 ['Choose the word for the blank. I can blank the bird with my eyes.','see','sea','say','See means to look with your eyes.'],
 ['Choose the word for the blank. The blank shines in the sky.','sun','son','soon','Sun names the star in our sky.'],
 ['Choose the word for the blank. The parents have a blank and a daughter.','son','sun','soon','Son names a male child.'],
 ['Choose the word for the blank. Please blank your name on the paper.','write','right','white','Write means to put words on paper.'],
 ['Choose the word for the blank. Turn blank at the next street, not left.','right','write','white','Right can name the direction opposite left.'],
 ['Choose the word for the blank. A bird flew over blank heads.','our','hour','are','Our means belonging to us.'],
 ['Choose the word for the blank. Sixty minutes make one blank.','hour','our','are','An hour is sixty minutes.'],
 ['Choose the word for the blank. I ate a juicy blank.','pear','pair','peer','A pear is a fruit.'],
 ['Choose the word for the blank. I have a blank of matching socks.','pair','pear','peer','A pair is a set of two.'],
 ['Choose the word for the blank. The rabbit has a fluffy blank.','tail','tale','tell','A tail is a part of an animal.'],
 ['Choose the word for the blank. Grandpa told a funny blank.','tale','tail','tell','A tale is a story.']
]},
];
function build(s:Spec,rows:readonly Row[],mock:boolean):Item[]{return items(mock?`${s.id}.reserved-reading`:s.id,rows.map(([say,answer,no1,no2,explain],i)=>({difficulty:(i%3+1) as Difficulty,say,choices:[txt(answer),txt(no1,'reading_clue_confusion'),txt(no2,'reading_clue_confusion')],explain,speakChoices:!s.quiet}))).map(item=>({...item,skill:s.id}));}
export const COMPREHENSION_SKILLS:Skill[]=specs.map(s=>({id:s.id,subject:'reading',strand:s.strand,grade:s.grade,title:s.title,kidTitle:s.kidTitle,icon:s.icon,standards:['Reading topic checklist'],prereqs:[],parentTip:'Ask which words or clues support the answer.',intro:[{say:`Let's practice ${s.kidTitle.toLowerCase()}.`}],items:build(s,s.rows.slice(0,8),false)}));
export const COMPREHENSION_MOCK=specs.flatMap(s=>build(s,s.rows.slice(8),true));
