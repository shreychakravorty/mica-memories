import React from 'react';
import { Image } from '@/components/ui/image';
export default function OchreHero({ person }) {
  return <section className="folio-hero">
    <Image className="folio-heroimg" src="https://media.base44.com/images/public/6ac1a6d5393990fdbc0753b4/3a7d4cd76_image.png" alt="MICA’s brick courtyard shaded by green trees"/>
    <div className="folio-herocopy"><p className="folio-eyebrow">The yearbook · Class of 2013</p>
      <h1>{person ? person.name : 'The words we left for each other.'}</h1>
      <p>Type your name and select it below to see what you wrote and what was written for you.</p>
    </div>
  </section>;
}