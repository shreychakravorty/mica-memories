import React from 'react';
import { Heart } from 'lucide-react';
export default function YearbookFooter() {
  return <footer className="border-t border-border/80 mx-6 md:mx-12 mt-auto"><div className="max-w-6xl mx-auto py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] tracking-wide text-muted-foreground"><span>MICA, Ahmedabad · Class of 2013</span><span className="flex items-center gap-1.5">Kept with <Heart size={11} className="text-primary"/> for the people who made it home.</span><span className="font-mono">EST. 2011 / REMEMBERED ALWAYS</span></div></footer>;
}