import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import YearbookHeader from '@/components/yearbook/YearbookHeader';
import YearbookFooter from '@/components/yearbook/YearbookFooter';
import PersonSearch from '@/components/yearbook/PersonSearch';
import ArchiveFeed from '@/components/yearbook/ArchiveFeed';
import SelectedTestimonies from '@/components/yearbook/SelectedTestimonies';
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
  return <div className="min-h-screen flex flex-col">
    <YearbookHeader onHome={() => setParams({})}/>
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-1">
      <section className="border-b border-border pb-8 mb-9">
        <p className="text-primary text-[10px] uppercase tracking-[0.2em] mb-4">The yearbook · Class of 2013</p>
        <h1 className="font-heading text-5xl md:text-6xl mb-4">{person ? person.name : 'The words we left for each other.'}</h1>
        <p className="text-sm text-muted-foreground mb-6">Type your name and select it below to see what you wrote and what was written for you.</p>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <PersonSearch people={people} onSelect={select} placeholder="Type your name…"/>
          {person && <button onClick={() => setParams({})} className="text-sm text-primary underline text-left">Show all testimonies</button>}
        </div>
        {isLoading && <p className="text-xs text-muted-foreground mt-3">Loading names…</p>}
        {isError && <p role="alert" className="text-sm text-destructive mt-3">Names couldn’t load. <button onClick={() => refetch()} className="underline">Try again</button></p>}
      </section>
      {person ? <SelectedTestimonies key={person.id} person={person} member={member} people={people} onSelect={select}/> : <ArchiveFeed people={people} onSelect={select}/>}
    </main>
    <YearbookFooter/>
  </div>;
}