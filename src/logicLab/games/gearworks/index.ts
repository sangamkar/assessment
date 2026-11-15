import raw from './levels.json';
import type { DifficultyTier, GameDescriptor } from '../../core/types';
import { GearWorks } from './module';
export const GEAR_WORKS:GameDescriptor={id:'gearworks',title:'GearWorks',levels:raw.map(level=>({id:level.id,title:level.title,tier:level.tier as DifficultyTier,data:level})),create:()=>new GearWorks()};
