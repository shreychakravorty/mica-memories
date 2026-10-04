import React from 'react';
import { Sparkles } from 'lucide-react';
import EmailEntry from '@/components/yearbook/EmailEntry';
import YearbookCover from '@/components/yearbook/YearbookCover';
export default function Welcome({ onEnter }) {
  return <main className="mx-auto max-w-7xl w-full px-6 md:px-12 pt-12 lg:pt-16 pb-12">
    <div className="grid lg:grid-cols-[1.1fr_1fr] items-center gap-12 lg:gap-20">
      <section className="py-2 lg:py-8"><div className="inline-flex items-center gap-2.5 text-primary text-[10px] font-medium tracking-[0.2em] uppercase mb-7"><span className="w-7 h-px bg-primary"/> The years pass. The stories stay.</div>
        <h1 className="font-display text-[64px] sm:text-[80px] xl:text-[92px] leading-[0.96] tracking-[-0.04em]">Some things<br/>stay <span className="italic text-primary">with us.</span></h1>
        <p className="text-muted-foreground text-sm md:text-base leading-7 mt-7 max-w-[400px]">The late-night conversations. The familiar faces.<br className="hidden sm:block"/> The words we left for each other.<br/>Welcome back to your MICA yearbook.</p>
        <EmailEntry onEnter={onEnter}/>
      </section>
      <YearbookCover/>
    </div>
    <p className="flex items-center gap-2 text-[10px] text-muted-foreground mt-7"><Sparkles size={12} strokeWidth={1.3}/> The original 2013 archive. Same words, a new home.</p>
  </main>;
}