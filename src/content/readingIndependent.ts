import type { Difficulty, Item, Skill } from './types';
import { items, txt } from './helpers';
type Row = readonly [string,string,string,string,string,string];
const stories:readonly Row[] = [
 ['The Lost Cap','Nina left her cap by the pond. Her dad found it on a bench.','Where was the cap?','on a bench','in a tree','under a boat'],
 ['Rainy Day','Rain fell all morning. Leo stayed inside and built a tower.','What did Leo build?','a tower','a boat','a nest'],
 ['The Red Kite','Mia ran up the hill. She flew her red kite in the wind.','What color was the kite?','red','green','black'],
 ['The Garden','Ari planted beans. He watered them every day.','What did Ari plant?','beans','rocks','shells'],
 ['A Small Gift','Sam drew a star for his friend. His friend smiled.','What did Sam draw?','a star','a fish','a car'],
 ['The Bus','The bus stopped at the gate. Jo got on and sat by the window.','Where did Jo sit?','by the window','on the roof','under a tree'],
 ['The Picnic','Ben packed apples and bread. His family ate at the park.','Where did the family eat?','at the park','at the beach','on a bus'],
 ['The Puppy','A puppy chased a ball. Then it fell asleep on the rug.','Where did the puppy sleep?','on the rug','in a pond','on a roof'],
 ['The Scarf','Nia found a scarf on the chair. She gave it back to her sister.','Who got the scarf?','her sister','a teacher','a bird'],
 ['The Snowman','Omar rolled three snowballs. He stacked them to make a snowman.','What did Omar make?','a snowman','a sandwich','a kite'],
 ['The Book','Eva borrowed a book about frogs. She read it at home.','What was the book about?','frogs','trains','stars'],
 ['The Shell','Jay picked up a shell at the beach. He put it in his bag.','Where did Jay put the shell?','in his bag','in a cup','on a tree']
];
const facts:readonly Row[] = [
 ['Bees','Bees visit flowers. They carry pollen from flower to flower.','What do bees visit?','flowers','rocks','books'],
 ['Frogs','A frog starts life as a tadpole. It grows legs as it gets older.','What does a tadpole grow?','legs','feathers','wheels'],
 ['Trees','Roots take in water from the soil. Leaves use sunlight to help the tree make food.','What takes in water?','roots','clouds','stones'],
 ['Birds','Birds have feathers. Many birds build nests for their eggs.','What do many birds build?','nests','roads','boats'],
 ['Fish','Fish live in water. Most fish use gills to get oxygen from water.','What do most fish use to get oxygen?','gills','wings','boots'],
 ['Seeds','A seed can grow into a plant. Many seeds need water to start growing.','What can a seed grow into?','a plant','a rock','a shoe'],
 ['Rain','Water in clouds can fall as rain. Rain adds water to rivers and lakes.','What can fall from clouds?','rain','sandwiches','paper'],
 ['Day and Night','Earth turns as it travels through space. A place has daytime when it faces the sun.','When does a place have daytime?','when it faces the sun','when it faces away from the sun','when a book opens'],
 ['Ants','Ants live in groups called colonies. Many ants work together to find food.','What is a group of ants called?','a colony','a classroom','a forest'],
 ['Butterflies','A caterpillar changes as it grows. It becomes an adult butterfly.','What does the caterpillar become?','a butterfly','a frog','a fish'],
 ['Rocks','Some rocks are smooth and others are rough. Rocks come in many sizes.','How can rocks feel?','smooth or rough','only soft','only wet'],
 ['Shadows','A shadow forms when an object blocks light. The shadow appears on a surface.','What must an object block to make a shadow?','light','sound','air']
];
function build(id:string, rows:readonly Row[], mock:boolean):Item[]{return items(mock?`${id}.reserved-reading`:id,rows.map(([title,passage,question,yes,no1,no2],i)=>({difficulty:(i%3+1) as Difficulty,say:`Read the passage. ${question}`,show:question,visual:{kind:'story' as const,title,lines:[{emoji:'',text:passage}]},speakChoices:false,choices:[txt(yes),txt(no1,'detail_error'),txt(no2,'detail_error')],explain:`The passage supports: ${yes}.`}))).map(i=>({...i,skill:id}));}
const definitions = [
 {id:'r1.independent-stories',title:'Read short stories independently',kidTitle:'Read a short story',strand:'lit' as const,icon:'📗',rows:stories},
 {id:'r1.independent-facts',title:'Read short informational texts independently',kidTitle:'Read a fact page',strand:'info' as const,icon:'📘',rows:facts},
];
export const INDEPENDENT_READING_SKILLS:Skill[] = definitions.map(s=>({id:s.id,subject:'reading',strand:s.strand,grade:'1',title:s.title,kidTitle:s.kidTitle,icon:s.icon,standards:['Reading topic checklist'],prereqs:[],parentTip:'Ask which words in the passage support the answer.',intro:[{say:'Read the passage yourself, then choose an answer. You can look back at the words.'}],items:build(s.id,s.rows.slice(0,8),false)}));
export const INDEPENDENT_READING_MOCK = definitions.flatMap(s=>build(s.id,s.rows.slice(8),true));
