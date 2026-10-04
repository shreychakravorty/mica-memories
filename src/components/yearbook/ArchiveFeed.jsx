import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { archiveSessionKey, sessionOrder } from '@/components/yearbook/sessionOrder';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CommentCard from '@/components/yearbook/CommentCard';
import ArchiveFilters from '@/components/yearbook/ArchiveFilters';
import useArchiveFilters from '@/components/yearbook/useArchiveFilters';
export default function ArchiveFeed({ people, onSelect }) {
  const [visibleCount, setVisibleCount] = useState(60);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['yearbook-archive', archiveSessionKey],
    queryFn: async () => {
      const comments = [];
      let offset = 0;
      while (true) {
        const page = await base44.entities.Comment.filter({ is_deleted: false }, 'id', 1000, offset);
        comments.push(...page);
        if (page.length < 1000) break;
        offset += page.length;
      }
      return sessionOrder(comments);
    },
  });
  const filters = useArchiveFilters(data, people);
  const comments = filters.filtered.slice(0, visibleCount);
  const hasNextPage = visibleCount < filters.filtered.length;
  const isFiltered = filters.writer !== 'all' || filters.recipient !== 'all';
  return <section aria-labelledby="all-testimonies">
    <div className="midnight-archivehead"><h2 id="all-testimonies" className="font-heading text-4xl mb-6">{isFiltered ? 'Filtered testimonies' : 'All testimonies'}</h2><span className="midnight-all shrink-0" aria-live="polite">{!isLoading && !isError ? `${filters.filtered.length} notes` : ''}</span></div>
    <ArchiveFilters {...filters} disabled={isLoading || isError} onWriterChange={value => { filters.setWriter(value); setVisibleCount(60); }} onRecipientChange={value => { filters.setRecipient(value); setVisibleCount(60); }}/>
    {isLoading ? <p className="flex items-center gap-2 text-muted-foreground py-10"><Loader2 size={18} className="animate-spin"/> Opening the yearbook…</p> : isError ? <div role="alert"><p>These memories couldn’t load.</p><button onClick={() => refetch()} className="text-primary underline mt-3">Try again</button></div> : <>
      {!comments.length && <p role="status" className="text-muted-foreground">{isFiltered ? 'No testimonies match these selections. Try another name or choose All.' : 'No testimonies are available.'}</p>}
      <div className="folio-gallery">{comments.map(comment => <CommentCard key={comment.id} comment={comment} direction="all" member={null} people={people} onSelect={onSelect}/>)}</div>
      {hasNextPage && <button onClick={() => setVisibleCount(count => count + 60)} className="midnight-button disabled:opacity-60">Show more testimonies</button>}
    </>}
  </section>;
}