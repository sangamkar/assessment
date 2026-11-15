import type { GameDescriptor, MiniGameModule, Hint } from './types';
import { ProgressStore } from './progress';
export class GameSession {
  game:MiniGameModule|null=null; gameId='';levelId='';hintsUsed=0; saveWarning=''; private unsubscribe?:()=>void;
  constructor(readonly games:readonly GameDescriptor[],readonly progress:ProgressStore){}
  start(gameId:string,levelId:string):MiniGameModule {
    const descriptor=this.games.find(g=>g.id===gameId),level=descriptor?.levels.find(l=>l.id===levelId);
    if(!descriptor||!level)throw new Error('Unknown game or level.');
    const next=descriptor.create(); next.loadLevel(level.data);
    this.unsubscribe?.();this.game=next;this.gameId=gameId;this.levelId=levelId;this.hintsUsed=0;this.saveWarning='';
    this.unsubscribe=next.onComplete(result=>{if(!this.progress.save(gameId,levelId,this.hintsUsed,result))this.saveWarning='Progress could not be saved on this device.';});
    return next;
  }
  hint(tier:1|2):Hint|null {const hint=this.game?.getHint(tier)??null;if(hint)this.hintsUsed++;return hint;}
  reset():void {this.hintsUsed=0;this.game?.reset();}
  dispose():void {this.unsubscribe?.();this.unsubscribe=undefined;this.game=null;}
}
