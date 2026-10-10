import React from 'react';
import { BookOpen, LogOut, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function MediaHeader({ onYearbook }) {
  const { logout } = useAuth();
  return <header className="media-header">
    <div className="media-header-inner">
      <button onClick={onYearbook} className="media-brand" aria-label="MICA Memories yearbook">
        <span className="media-brand-mark"><BookOpen size={21} strokeWidth={1.5}/></span>
        <span>
          <span className="media-brand-title">MICA <i>Memories</i></span>
          <span className="media-brand-sub">The class archive</span>
        </span>
      </button>
      <nav className="media-nav">
        <button onClick={onYearbook}>The yearbook <ArrowUpRight size={13} className="inline ml-1" aria-hidden="true"/></button>
        <span className="media-nav-current">Photos &amp; videos</span>
        <button onClick={() => logout()} title="Sign out" aria-label="Sign out" className="media-signout"><LogOut size={17}/></button>
      </nav>
    </div>
  </header>;
}