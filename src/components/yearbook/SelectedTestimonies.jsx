import React from 'react';
import { Loader2 } from 'lucide-react';
import useProfileComments from '@/components/yearbook/useProfileComments';
import TestimonySection from '@/components/yearbook/TestimonySection';
import DeleteCommentDialog from '@/components/yearbook/DeleteCommentDialog';
import { sessionOrder } from '@/components/yearbook/sessionOrder';
export default function SelectedTestimonies({ person, member, people, onSelect }) {
  const { data, isLoading, isError, refetch, remove, pending, setPending, busy, actionError } = useProfileComments(person, member);
  if (isLoading) return <p className="flex items-center gap-2 py-12 text-muted-foreground"><Loader2 size={18} className="animate-spin"/> Finding your testimonies…</p>;
  if (isError) return <div role="alert"><p>These memories couldn’t load.</p><button onClick={() => refetch()} className="text-primary underline mt-3">Try again</button></div>;
  const props = { member, people, onSelect, onDelete: remove, busy };
  return <>
    {actionError && !pending && <p role="alert" className="text-destructive mb-5">{actionError}</p>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <TestimonySection title="Written for you" direction="received" comments={sessionOrder(data?.received || [])} {...props}/>
      <TestimonySection title="Written by you" direction="written" comments={sessionOrder(data?.written || [])} {...props}/>
    </div>
    <DeleteCommentDialog comment={pending} onClose={() => setPending(null)} onConfirm={() => remove(pending, true)} busy={!!busy} error={actionError}/>
  </>;
}