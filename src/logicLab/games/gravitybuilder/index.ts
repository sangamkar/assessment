import raw from './levels.json';
import type {DifficultyTier,GameDescriptor} from '../../core/types';
import {GravityBuilder} from './module';
export const GRAVITY_BUILDER:GameDescriptor={id:'gravitybuilder',title:'GravityBuilder',levels:raw.map(l=>({id:l.id,title:l.title,tier:l.tier as DifficultyTier,data:l})),create:()=>new GravityBuilder()};
