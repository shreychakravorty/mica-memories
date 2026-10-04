import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import YearbookHeader from '@/components/yearbook/YearbookHeader';
import YearbookFooter from '@/components/yearbook/YearbookFooter';
import PersonSearch from '@/components/yearbook/PersonSearch';
import ArchiveFeed from '@/components/yearbook/ArchiveFeed';
import SelectedTestimonies from '@/components/yearbook/SelectedTestimonies';
import OchreHero from '@/components/yearbook/OchreHero';
import '@/components/yearbook/ochre-folio.css';
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
  return <div className="ochre-folio flex flex-col">
    <YearbookHeader onHome={() => setParams({})}/>
    <main className="folio-main">
      <OchreHero person={person}/>
      <section className="folio-shelf">
        <span className="folio-searchlabel">Find</span>
        <PersonSearch people={people} onSelect={select} placeholder="Type your name…"/>
        {person ? <button onClick={() => setParams({})} className="folio-all underline">Show all testimonies</button> : <span className="folio-all">All testimonies</span>}
        {isLoading && <p className="text-xs text-muted-foreground">Loading names…</p>}
        {isError && <p role="alert" className="text-sm text-destructive">Names couldn’t load. <button onClick={() => refetch()} className="underline">Try again</button></p>}
      </section>
      <div className="folio-content">{person ? <SelectedTestimonies key={person.id} person={person} member={member} people={people} onSelect={select}/> : <ArchiveFeed people={people} onSelect={select}/>}</div>
    </main>
    <YearbookFooter/>
    <div className="folio-grain" aria-hidden="true"/>
  </div>;
}