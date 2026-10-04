import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import YearbookHeader from '@/components/yearbook/YearbookHeader';
import YearbookFooter from '@/components/yearbook/YearbookFooter';
import Welcome from '@/components/yearbook/Welcome';
import Directory from '@/components/yearbook/Directory';
import PersonProfile from '@/components/yearbook/PersonProfile';
export default function Yearbook() {
  const [member,setMember]=useState(null); const [restoring,setRestoring]=useState(!!localStorage.getItem('mica-yearbook-email'));
  const [params,setParams]=useSearchParams(); const client=useQueryClient();
  const {data:people=[],isLoading,isError}=useQuery({queryKey:['yearbook-people'],queryFn:()=>base44.entities.Person.filter({is_batch_member:true},'name',500),enabled:!!member});
  useEffect(()=>{let cancelled=false;const email=localStorage.getItem('mica-yearbook-email');if(!email)return;
    base44.entities.Person.filter({email,is_batch_member:true}).then(results=>{if(cancelled)return;if(results[0])setMember(results[0]);else localStorage.removeItem('mica-yearbook-email');}).catch(()=>{if(!cancelled)localStorage.removeItem('mica-yearbook-email');}).finally(()=>{if(!cancelled)setRestoring(false);});
    return()=>{cancelled=true;};
  },[]);
  const view=params.get('view')==='directory'?'directory':'profile';
  const person=people.find(p=>p.id===params.get('person'))||member;
  function select(p){setParams({person:p.id});window.scrollTo({top:0,behavior:'auto'});}
  function enter(p){setMember(p);select(p);}
  function leave(){localStorage.removeItem('mica-yearbook-email');setMember(null);setParams({});client.removeQueries({queryKey:['yearbook-comments']});client.removeQueries({queryKey:['yearbook-people']});}
  function directory(){setParams({view:'directory'});window.scrollTo({top:0,behavior:'auto'});}
  return <div className="min-h-screen flex flex-col">
    <YearbookHeader member={member} onHome={()=>member?select(member):setParams({})} onDirectory={directory} onLogout={leave} view={view}/>
    {restoring?<main className="flex-1 flex items-center justify-center gap-3 min-h-96 text-muted-foreground text-sm"><Loader2 className="animate-spin" size={18}/> Finding your page…</main>:!member?<Welcome onEnter={enter}/>:view==='directory'?<Directory people={people} onSelect={select} loading={isLoading} error={isError}/>:<PersonProfile key={person.id} person={person} member={member} people={people} onSelect={select} onDirectory={directory}/>}
    <YearbookFooter/>
  </div>;
}