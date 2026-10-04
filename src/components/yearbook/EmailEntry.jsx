import React, { useState } from 'react';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
export default function EmailEntry({ onEnter }) {
  const [email,setEmail]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const normalized=email.trim().toLowerCase();
      const people=await base44.entities.Person.filter({email:normalized,is_batch_member:true});
      if(!people.length) { setError('We couldn’t match that email to the batch. Use your original micamail.in address. Some classmates’ emails are missing from the spreadsheet and need to be added by the yearbook owner.'); return; }
      localStorage.setItem('mica-yearbook-email',normalized); onEnter(people[0]);
    } catch { setError('We couldn’t open the yearbook. Please try again.'); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="max-w-md mt-9">
    <label htmlFor="yearbook-email" className="block text-xs font-medium mb-3">Your college email, your little corner of MICA.</label>
    <div className="flex items-center bg-card border border-border rounded-md p-1.5 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/60"><Mail size={17} className="ml-3 text-muted-foreground shrink-0"/><input id="yearbook-email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@micamail.in" className="w-full min-w-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/60"/><button disabled={busy} className="bg-primary text-primary-foreground rounded px-4 py-3.5 flex items-center gap-2 text-xs font-medium whitespace-nowrap hover:bg-primary/90 disabled:opacity-60">{busy?<Loader2 size={16} className="animate-spin"/>:<>Let me in <ArrowRight size={15}/></>}</button></div>
    {error&&<p role="alert" className="text-destructive text-xs leading-relaxed mt-3">{error}</p>}
    <p className="text-xs text-muted-foreground mt-3">No password. Just the email you used back then.</p>
    <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-4 max-w-sm">An archive built on trust: email addresses aren’t verified. Anyone who knows a listed email can enter as that person.</p>
  </form>;
}