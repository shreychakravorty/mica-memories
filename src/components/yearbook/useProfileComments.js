import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useProfileComments(person,member) {
  const client=useQueryClient(); const [pending,setPending]=useState(null); const [busy,setBusy]=useState(''); const [error,setError]=useState('');
  const query=useQuery({queryKey:['yearbook-comments',person.id],queryFn:async()=>{
    const [received,written]=await Promise.all([base44.entities.Comment.filter({recipient_name:person.name},'timestamp',1000),person.email?base44.entities.Comment.filter({author_email:person.email},'timestamp',1000):Promise.resolve([])]);
    return {received,written};
  }});
  async function remove(comment,permanent=false) {
    if(comment.author_email!==member.email&&comment.recipient_name!==member.name) {setError('Only the author or recipient can remove this testimony.');return;}
    if(comment.is_deleted&&!permanent){setError('');setPending(comment);return;}
    setBusy(comment.id);setError('');
    try {
      if(permanent)await base44.entities.Comment.delete(comment.id); else await base44.entities.Comment.update(comment.id,{is_deleted:true});
      client.setQueriesData({queryKey:['yearbook-comments']},old=>old?Object.fromEntries(Object.entries(old).map(([key,list])=>[key,permanent?list.filter(c=>c.id!==comment.id):list.map(c=>c.id===comment.id?{...c,is_deleted:true}:c)])):old);
      setPending(null); await client.invalidateQueries({queryKey:['yearbook-comments']});
    } catch {setError('The change couldn’t be saved. Please try again.');} finally {setBusy('');}
  }
  return {...query,remove,pending,setPending,busy,actionError:error};
}