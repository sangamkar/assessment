import type { CSSProperties } from 'react';
/** Decorative overlay: positions are percentages in the containing board. */
export function TutorialHandOverlay({from,to,visible}:{from:{x:number;y:number};to?:{x:number;y:number};visible:boolean}) {
  if(!visible)return null;
  const style={'--from-x':`${from.x}%`,'--from-y':`${from.y}%`,'--to-x':`${to?.x??from.x}%`,'--to-y':`${to?.y??from.y}%`} as CSSProperties;
  return <div className="tutorial" aria-hidden="true" style={style}><span className={to?'tutorial-hand drag':'tutorial-hand tap'}>👆</span></div>;
}
