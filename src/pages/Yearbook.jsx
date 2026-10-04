import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import YearbookHeader from '@/components/yearbook/YearbookHeader';
import YearbookFooter from '@/components/yearbook/YearbookFooter';
import PersonSearch from '@/components/yearbook/PersonSearch';
import ArchiveFeed from '@/components/yearbook/ArchiveFeed';
import SelectedTestimonies from '@/components/yearbook/SelectedTestimonies';
import MidnightHero from '@/components/yearbook/MidnightHero';
import { Image } from '@/components/ui/image';
import '@/components/yearbook/midnight-premium.css';
export default function Yearbook() {
  const [member, setMember] = useState(null);
  const [params, setParams] = useSearchParams();
  const { data: people = [], isLoading, isError, refetch } = useQuery({ queryKey: ['yearbook-people'], queryFn: () => base44.entities.Person.filter({ is_batch_member: true }, 'name', 500) });
  useEffect(() => {
    const email = localStorage.getItem('mica-yearbook-email');
    if (!email) return;
    setMember(people.find(p => p.email === email || (p.email_aliases || []).includes(email)) || null);
  }, [people]);
  const person = people.find(p => p.id === params.get('person'));
  function select(p) { setParams({ person: p.id }); window.scrollTo({ top: 0, behavior: 'auto' }); }
  return <div className="midnight-premium flex flex-col">
    <YearbookHeader onHome={() => setParams({})}/>
    <main className="folio-main">
      <MidnightHero person={person}>
        <div className="midnight-searchrow">
          <span className="midnight-searchlabel">Find</span>
          <PersonSearch people={people} onSelect={select} placeholder="Type your name…"/>
        </div>
        {isLoading && <p className="text-xs mt-3">Loading names…</p>}
        {isError && <p role="alert" className="text-sm mt-3">Names couldn’t load. <button onClick={() => refetch()} className="underline">Try again</button></p>}
      </MidnightHero>
      <div className="folio-content">
        {person && <div className="midnight-archivehead"><span>{person.name}</span><button onClick={() => setParams({})} className="midnight-all midnight-navbutton">Show all testimonies</button></div>}
        {person ? <SelectedTestimonies key={person.id} person={person} member={member} people={people} onSelect={select}/> : <ArchiveFeed people={people} onSelect={select}/>}
      </div>
      <Image className="midnight-archivepic" src="https://media.base44.com/images/public/6ac1a6d5393990fdbc0753b4/4239802cc_generated_4f96d9d1.jpg" alt="Sunlit brick courtyard inspired by MICA’s campus" focalPointY={0.55}/>
    </main>
    <YearbookFooter/>
  </div>;
}