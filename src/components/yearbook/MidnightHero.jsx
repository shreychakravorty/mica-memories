import React from 'react';
import { Image } from '@/components/ui/image';
export default function MidnightHero({ person, children }) {
  return <section className="midnight-hero">
    <Image className="midnight-heroimg" src="https://media.base44.com/images/public/6ac1a6d5393990fdbc0753b4/2c9e03f76_generated_899db1bb.jpg" alt="A gold-edged yearbook against midnight blue"/>
    <div className="midnight-shade"/>
    <div className="midnight-herocopy">
      <p className="midnight-eyebrow">The yearbook · Class of 2013</p>
      <h1>{person ? person.name : 'The words we left for each other.'}</h1>
      <p className="midnight-intro">Type your name and select it below to see what you wrote and what was written for you.</p>
      {children}
    </div>
  </section>;
}