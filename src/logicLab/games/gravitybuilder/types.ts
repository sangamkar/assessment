export type PieceKind='ramp-left'|'ramp-right'|'trampoline'|'fan'|'switch-gate';
export interface GravityPiece {id:string;kind:PieceKind}
export interface SnapZone {id:string;x:number;y:number;accept:PieceKind[]}
export interface GravityLevel {id:string;title:string;spawn:{x:number;y:number;vx:number;vy:number};goal:{x:number;y:number;r:number};zones:SnapZone[];inventory:GravityPiece[];solution:{pieceId:string;zoneId:string}[];floor:number;gateX?:number}
export interface Point {x:number;y:number}
export interface PhysicsState {x:number;y:number;vx:number;vy:number;frame:number;gateOpen:boolean;finished:boolean;success:boolean;trail:Point[]}
export interface GravityState {level:GravityLevel;placed:Record<string,string>;mode:'edit'|'running'|'complete';physics:PhysicsState|null;ghost:Point[]}
