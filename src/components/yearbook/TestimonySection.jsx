import React from 'react';
import CommentCard from '@/components/yearbook/CommentCard';
export default function TestimonySection({ title, comments, direction, member, people, onSelect, onDelete, busy }) {
  const active = comments.filter(c => !c.is_deleted);
  const removed = comments.filter(c => c.is_deleted);
  const card = comment => <CommentCard key={comment.id} comment={comment} direction={direction} member={member} people={people} onSelect={onSelect} onDelete={onDelete} busy={busy === comment.id}/>;
  return <section className="min-w-0" aria-label={title}>
    <h2 className="font-heading text-3xl border-b border-border pb-5 mb-6">{title}</h2>
    {active.length ? active.map(card) : <p className="text-muted-foreground text-sm border border-dashed border-border rounded p-6">No testimonies found in this section.</p>}
    {!!removed.length && <div className="mt-8"><h3 className="font-heading text-2xl mb-4">Struck-out words</h3>{removed.map(card)}</div>}
  </section>;
}