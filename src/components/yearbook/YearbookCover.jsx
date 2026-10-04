import React from 'react';
import { Image } from '@/components/ui/image';
import { Flower2, ArrowDownLeft } from 'lucide-react';
export default function YearbookCover() {
  return <div className="relative mx-auto w-full max-w-[440px] py-8 px-5 lg:py-12">
    <div className="absolute inset-x-7 top-12 bottom-8 bg-secondary border border-border rotate-[-5deg] rounded-sm"/>
    <figure className="relative rotate-[3deg] bg-card p-3 pb-5 shadow-xl shadow-foreground/10 border border-border/60">
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-tape/70 rotate-[-5deg] z-10"/>
      <Image src="https://media.base44.com/images/public/6ac1a6d5393990fdbc0753b4/89384b0af_generated_image.png" alt="A nostalgic illustration of red-brick college courtyards in golden afternoon light" className="w-full aspect-[4/4.5] object-cover"/>
      <figcaption className="px-3 pt-5 flex justify-between items-end"><div><p className="text-[9px] uppercase tracking-[0.23em] text-muted-foreground">Somewhere in Shela</p><p className="font-heading text-2xl mt-1 italic">Where it all began.</p></div><span className="font-mono text-[10px] text-muted-foreground pb-1">2011—13</span></figcaption>
    </figure>
    <div className="absolute -right-1 md:-right-5 top-0 w-28 h-28 rounded-full border border-primary bg-background flex flex-col items-center justify-center rotate-[13deg] text-primary shadow-sm"><span className="text-[9px] tracking-[0.18em] uppercase">Forever the</span><span className="font-heading text-4xl leading-tight">2013</span><span className="text-[9px] tracking-[0.22em] uppercase">Class of MICA</span></div>
    <div className="absolute -bottom-4 right-5 flex items-center gap-3 text-primary"><ArrowDownLeft size={27} strokeWidth={1}/><span className="font-heading italic text-xl rotate-[-5deg]">Feels like yesterday, doesn’t it?</span></div>
    <Flower2 className="absolute -bottom-2 -left-2 text-primary/60" size={44} strokeWidth={1}/>
  </div>;
}