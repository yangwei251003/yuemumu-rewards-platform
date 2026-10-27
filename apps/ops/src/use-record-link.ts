import {useEffect,useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
/** Select only a record already returned by the existing authorized API. Never performs a write. */
export function useRecordLink<T extends {id:string}>(items:T[],select:(record:T)=>void){
 const [params]=useSearchParams();const id=params.get('record');const handled=useRef<string|null>(null);
 useEffect(()=>{if(!id){handled.current=null;return;}if(handled.current===id)return;const record=items.find(r=>r.id===id);if(record){handled.current=id;select(record);}},[id,items]);
}
