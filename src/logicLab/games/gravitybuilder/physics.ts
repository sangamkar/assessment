import type {GravityLevel, PhysicsState, PieceKind} from './types';
export const FIXED_DT=1/60;
const R=6, GRAVITY=120, MAX_FRAMES=600;
export function begin(level:GravityLevel):PhysicsState{return {...level.spawn,frame:0,gateOpen:false,finished:false,success:false,trail:[]};}
/** Fixed step, no wall-clock or random input. Coordinates and velocities use CSS-independent board units. */
export function step(level:GravityLevel,placed:Record<string,string>,state:PhysicsState):PhysicsState {
 if(state.finished)return state;
 let {x,y,vx,vy,gateOpen}=state;const dt=FIXED_DT;
 const pieces=Object.entries(placed).map(([id,z])=>({piece:level.inventory.find(p=>p.id===id)!,zone:level.zones.find(p=>p.id===z)!}));
 for(const {piece,zone} of pieces) if(piece.kind==='fan'&&Math.abs(x-zone.x)<35&&y<zone.y&&y>zone.y-90){vx+=45*dt;vy-=145*dt;}
 vy+=GRAVITY*dt;const oldX=x;x+=vx*dt;y+=vy*dt;
 for(const {piece,zone} of pieces){
  if(piece.kind==='switch-gate'){
   if(Math.abs(x-(zone.x-35))<14 && Math.abs(y-(level.floor-R))<12)gateOpen=true;
  }
  if(piece.kind==='trampoline'&&Math.abs(x-zone.x)<28&&y+R>=zone.y&&y+R<=zone.y+Math.max(8,Math.abs(vy*dt)+2)&&vy>0){y=zone.y-R;vy=-Math.max(100,Math.abs(vy)*1.15);vx+=60;}
  if(piece.kind==='ramp-left'||piece.kind==='ramp-right'){
   const slope=piece.kind==='ramp-right'?0.5:-0.5;
   if(Math.abs(x-zone.x)<=40){const surface=zone.y+slope*(x-zone.x);const previousY=y-vy*dt;
    if(previousY+R<=surface+3&&y+R>=surface&&vy>0){y=surface-R;const n=Math.sqrt(1+slope*slope),nx=slope/n,ny=-1/n,vn=vx*nx+vy*ny;if(vn<0){vx-=vn*nx;vy-=vn*ny;}}
   }
  }
 }
 if(level.gateX!==undefined&&!gateOpen&&oldX<level.gateX-R&&x>=level.gateX-R&&y>level.floor-70){x=level.gateX-R;vx=-Math.abs(vx)*0.15;}
 if(y+R>level.floor){y=level.floor-R;vy=0;vx*=0.99;}
 const frame=state.frame+1,success=Math.hypot(x-level.goal.x,y-level.goal.y)<=level.goal.r+R;
 const finished=success||frame>=MAX_FRAMES||x< -20||x>380||y>260;
 const trail=frame%3===0?[...state.trail,{x,y}]:state.trail;
 return {x,y,vx,vy,gateOpen,frame,finished,success,trail};
}
export function simulate(level:GravityLevel,placed:Record<string,string>):PhysicsState {let s=begin(level);while(!s.finished)s=step(level,placed,s);return s;}
export function accepts(kind:PieceKind,zone:{accept:PieceKind[]}):boolean{return zone.accept.includes(kind);}
