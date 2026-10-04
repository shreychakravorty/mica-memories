import React, { useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
export default function RoastableNote({ comment, children }) {
  const [roast, setRoast] = useState('');
  const [roasted, setRoasted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    if (roasted) { setRoasted(false); return; }
    if (roast) { setRoasted(true); return; }
    setLoading(true); setError('');
    try {
      const { data } = await base44.functions.invoke('roastTestimony', { commentId: comment.id });
      if (!data.roast) throw new Error('No roast returned');
      setRoast(data.roast); setRoasted(true);
    } catch { setError('Couldn’t roast this note. Please try again.'); }
    finally { setLoading(false); }
  }
  return <>
    <p aria-live="polite" className={`folio-message text-[14px] leading-[1.9] whitespace-pre-wrap break-words ${comment.is_deleted ? 'line-through text-muted-foreground' : 'text-foreground/85'}`}>{roasted ? roast : comment.message}</p>
    {error && <p role="alert" className="text-xs text-destructive mt-3">{error}</p>}
    <div className="folio-foot flex items-center gap-3 mt-7 pt-4 border-t border-border/50">
      {children}
      {!comment.is_deleted && <button type="button" onClick={toggle} disabled={loading} aria-pressed={roasted} aria-label={roasted ? 'Toast: restore original note' : 'Roast this note'} className="folio-control midnight-roastbutton ml-auto shrink-0 flex items-center gap-1.5 text-[10px] text-primary hover:text-foreground disabled:opacity-60">{loading ? <Loader2 size={12} className="animate-spin"/> : <Flame size={12}/>} {loading ? 'Roasting…' : roasted ? 'Toast' : 'Roast'}</button>}
    </div>
  </>;
}