import type {GravityLevel} from './types';
/** Select the nearest available compatible zone within the magnetic radius, in board units. */
export function snapZone(level:GravityLevel,placed:Record<string,string>,pieceId:string,x:number,y:number,tolerance=38):string|null {
 const piece=level.inventory.find(p=>p.id===pieceId);if(!piece)return null;
 const occupied=new Set(Object.entries(placed).filter(([id])=>id!==pieceId).map(([,zone])=>zone));
 const candidates=level.zones.filter(z=>z.accept.includes(piece.kind)&&!occupied.has(z.id)).map(z=>({id:z.id,d:Math.hypot(z.x-x,z.y-y)})).filter(z=>z.d<=tolerance).sort((a,b)=>a.d-b.d);
 return candidates[0]?.id??null;
}
