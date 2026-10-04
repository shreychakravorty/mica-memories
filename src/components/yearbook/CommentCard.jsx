import React from 'react';
import { Trash2, Loader2, ArrowUpRight } from 'lucide-react';
import RoastableNote from '@/components/yearbook/RoastableNote';
import { contributorIdentity } from '@/components/yearbook/contributorIdentity';
export default function CommentCard({ comment, direction, member, people, onSelect, onDelete, busy }) {
  const outgoing=direction==='written';
  const identity=outgoing?{name:comment.recipient_name,person:people.find(p=>p.name===comment.recipient_name)}:contributorIdentity(comment,people);
  const {name,person}=identity; const canDelete=!!member&&(comment.author_email===member.email||comment.recipient_name===member.name);
  const date=comment.timestamp?new Date(comment.timestamp.replace(' ','T')):null;
  return <article className={`folio-brick rounded-md border p-6 sm:p-8 break-inside-avoid mb-5 ${comment.is_deleted?'border-dashed border-border bg-secondary/25 opacity-70':'bg-card border-border/70 shadow-sm shadow-foreground/[0.02]'}`}>
    <div className="flex items-start justify-between gap-3 mb-6"><div className="flex gap-3 items-center"><span className="bg-secondary/70 w-9 h-9 flex items-center justify-center rounded-full font-heading text-base text-primary">{person?name.split(' ').map(n=>n[0]).slice(0,2).join(''):name.slice(0,1).toUpperCase()}</span><div><p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{outgoing?'Written for':'A note from'}</p>{person?<button onClick={()=>onSelect(person)} className="font-heading text-xl text-left hover:text-primary">{name}<ArrowUpRight size={11} className="inline ml-1"/></button>:<p className="text-sm mt-1 break-all">{name}<span className="block text-[9px] text-muted-foreground">Original contributor username</span></p>}</div></div><span className="folio-quote" aria-hidden="true">”</span></div>
    {direction==='all'&&<p className="text-xs text-muted-foreground mb-4">Written for {people.find(p=>p.name===comment.recipient_name)?<button className="text-primary underline" onClick={()=>onSelect(people.find(p=>p.name===comment.recipient_name))}>{comment.recipient_name}</button>:comment.recipient_name}</p>}
    <RoastableNote key={comment.message} comment={comment}>
    <div className="flex flex-1 items-center justify-between gap-4"><span className="text-[9px] uppercase tracking-wider text-muted-foreground">{comment.is_deleted?'Struck out':date&&!Number.isNaN(date.getTime())?date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'The 2013 yearbook'}</span>{canDelete&&<button disabled={busy} onClick={()=>onDelete(comment)} className="folio-control flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-destructive disabled:opacity-50" aria-label={comment.is_deleted?'Permanently delete testimony':'Strike out testimony'}>{busy?<Loader2 size={12} className="animate-spin"/>:<Trash2 size={12}/>}<span>{comment.is_deleted?'Delete forever':'Strike out'}</span></button>}</div>
    </RoastableNote>
  </article>;
}