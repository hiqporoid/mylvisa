import rawCorrections from './editorial-corrections-2026-09.json';
import rawDecisions from '../../docs/internal/editorial-decisions-2026-09.json';
import type { VerifiedUniverse } from './universes';
import { normalizeAnswer } from '../lib/quiz/normalize';
export type Correction = { universeId: string; prompt?: string; category?: string; familyId?: string; scores?: Record<string,number>; aliases?: Record<string,string[]>; members?: {canonical:string;points:number;aliases:string[]}[]; source?: VerifiedUniverse['source'] };
export const corrections = rawCorrections as Record<string,Correction>;
export const decisions = rawDecisions as Record<string,{classification:'PASS'|'RESCORE'|'REWRITE'|'DEMOTE'|'RETIRE';reason:string}>;
export function editedUniverse(universe: VerifiedUniverse): VerifiedUniverse {
 const common:Record<string,string[]> = { 'Yhdistynyt kuningaskunta':['Iso-Britannia','Britannia','UK'], 'Yhdysvallat':['USA','United States'], 'Alankomaat':['Hollanti'], 'Tšekki':['Tsekki','Tšekin tasavalta'], 'Tšekkoslovakia':['Tsekkoslovakia'], 'Yhdistyneet arabiemiirikunnat':['UAE','Arabiemiirikunnat'] };
 const edit = Object.values(corrections).find(value=>value.universeId===universe.id) ?? {universeId:universe.id};
 const entities=edit.members ? edit.members.map((m,index)=>({id:universe.entities.find(e=>e.canonical===m.canonical)?.id ?? `editorial-${index}-${universe.id}`,canonical:m.canonical,aliases:m.aliases})) : universe.entities.map(e=>({...e,aliases:[...e.aliases,...(edit.aliases?.[e.canonical]??[])]}));
 const uniqueEntities=entities.map(entity=>{
  const seen=new Set([normalizeAnswer(entity.canonical)]);
  return {...entity,aliases:[...entity.aliases,...(common[entity.canonical]??[])].filter(alias=>{const key=normalizeAnswer(alias);if(seen.has(key))return false;seen.add(key);return true;})};
 });
 return {...universe,entities:uniqueEntities,expectedCount:entities.length,...(edit.source?{source:edit.source}:{}),...(edit.prompt?{description:edit.prompt,membershipBasis:edit.prompt}:{}),...(edit.members?{asOf:'2026-09-11'}:{})};
}
