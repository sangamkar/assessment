export type Teeth = 8 | 12 | 16;
export interface Peg { id:string; x:number; y:number }
export interface Gear { pegId:string; teeth:Teeth; direction?:1|-1 }
export interface Belt { id:string; a:string; b:string; maxSpan?:number }
export interface Piece { id:string; teeth:Teeth }
export interface GearLevel { id:string; title:string; lesson?:string; pegs:Peg[]; motor:Gear; goals:Gear[]; inventory:Piece[]; belts:Belt[]; solution:{pieceId:string;pegId:string}[] }
export interface Motion { direction:1|-1; rpm:number }
export interface GearSolution { motion:Record<string,Motion>; jammed:string[]; complete:boolean }
export interface GearState { level:GearLevel; placed:Record<string,string>; belts:Belt[]; solution:GearSolution; complete:boolean }
