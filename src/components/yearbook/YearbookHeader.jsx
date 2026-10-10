import React from 'react';
import { BookOpen, LogOut, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function YearbookHeader({ member, onHome, onDirectory, onLogout, view }) {
  return <header className="border-b border-border/80">
    <div className="mx-auto max-w-7xl px-6 md:px-12 h-24 flex items-center justify-between gap-4">
      <button onClick={onHome} className="flex items-center gap-3 text-left" aria-label="MICA Memories home"><span className="w-11 h-11 border border-primary/30 rounded-full flex items-center justify-center text-primary"><BookOpen size={21} strokeWidth={1.5}/></span><span><span className="block font-heading text-2xl tracking-tight">MICA <i>Memories</i></span><span className="block text-[9px] tracking-[0.27em] uppercase text-muted-foreground mt-1">The yearbook · Class of 2013</span></span></button>
      {member ? <nav className="flex items-center gap-3 md:gap-7 text-sm"><button onClick={onHome} className={view==='profile'?'text-primary':'text-muted-foreground'}>My page</button><button onClick={onDirectory} className={view==='directory'?'text-primary':'text-muted-foreground'}>The batch <ArrowUpRight className="inline ml-1 hidden sm:inline" size={13}/></button><Link to="/media" className="text-muted-foreground hover:text-foreground">Photos &amp; videos</Link><button onClick={onLogout} title="Leave yearbook" aria-label="Leave yearbook" className="border-l pl-3 md:pl-6 text-muted-foreground hover:text-foreground"><LogOut size={17}/></button></nav> : <span className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary"/> A little time capsule. A lot of us.</span>}
    </div>
  </header>;
}