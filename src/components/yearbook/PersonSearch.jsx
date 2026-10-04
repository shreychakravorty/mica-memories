import React, { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
export default function PersonSearch({ people, onSelect, placeholder='Find a familiar name…' }) {
  const [value,setValue]=useState('');
  const [focused,setFocused]=useState(false);
  const matches=value.trim()?people.filter(p=>p.name.toLowerCase().includes(value.trim().toLowerCase())):[];
  return <div className="relative w-full sm:w-72"><div className="flex items-center gap-2.5 border border-border rounded bg-card px-3"><Search size={16} className="text-muted-foreground"/><input aria-label="Find a batchmate" placeholder={focused ? '' : placeholder} value={value} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setValue('');}} className="w-full py-3 bg-transparent text-xs outline-none"/></div>
    {value.trim()&&<div className="absolute z-30 top-full mt-1 w-full rounded border border-border bg-card shadow-lg max-h-80 overflow-y-auto">{matches.length?matches.map(p=><button key={p.id} onClick={()=>{onSelect(p);setValue('');}} className="flex w-full text-left items-center justify-between p-3 text-sm hover:bg-secondary">{p.name}<ArrowUpRight size={13}/></button>):<p className="p-4 text-xs text-muted-foreground">No names found. Try a first name.</p>}</div>}
  </div>;
}