import type { Belt, Gear, GearLevel, GearSolution, Motion } from './types';
/** Tooth count determines radius. Coordinates and radii share board units. */
export const radius = (teeth:number) => teeth * 2;
export function solve(level:GearLevel, placed:Record<string,string>, belts:readonly Belt[] = []):GearSolution {
  const gears:Gear[]=[level.motor,...level.goals,...Object.entries(placed).map(([pieceId,pegId])=>({pegId,teeth:level.inventory.find(p=>p.id===pieceId)!.teeth}))];
  const pegs=new Map(level.pegs.map(p=>[p.id,p]));
  const edges=new Map<string,{to:string; sign:1|-1}[]>(gears.map(g=>[g.pegId,[]]));
  const connect=(a:string,b:string,sign:1|-1)=>{edges.get(a)!.push({to:b,sign});edges.get(b)!.push({to:a,sign});};
  for(let i=0;i<gears.length;i++) for(let j=i+1;j<gears.length;j++) {
    const a=pegs.get(gears[i].pegId)!,b=pegs.get(gears[j].pegId)!;
    if(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-radius(gears[i].teeth)-radius(gears[j].teeth))<1) connect(a.id,b.id,-1);
  }
  for(const belt of belts) if(edges.has(belt.a)&&edges.has(belt.b)) connect(belt.a,belt.b,1);
  const byPeg=new Map(gears.map(g=>[g.pegId,g]));
  const motion:Record<string,Motion>={[level.motor.pegId]:{direction:1,rpm:24}};
  const jammed=new Set<string>(), queue=[level.motor.pegId];
  while(queue.length){ const from=queue.shift()!, a=motion[from];
    for(const edge of edges.get(from)!) {
      const direction=(a.direction*edge.sign) as 1|-1;
      const rpm=a.rpm*byPeg.get(from)!.teeth/byPeg.get(edge.to)!.teeth;
      if(!motion[edge.to]) { motion[edge.to]={direction,rpm}; queue.push(edge.to); }
      else if(motion[edge.to].direction!==direction || Math.abs(motion[edge.to].rpm-rpm)>1e-6){jammed.add(from);jammed.add(edge.to);}
    }
  }
  return {motion,jammed:[...jammed],complete:jammed.size===0&&level.goals.every(g=>!!motion[g.pegId])};
}
