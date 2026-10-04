import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CommentCard from '@/components/yearbook/CommentCard';
export default function ArchiveFeed({ people, onSelect }) {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['yearbook-archive'], initialPageParam: 0,
    queryFn: ({ pageParam }) => base44.entities.Comment.filter({ is_deleted: false }, 'timestamp', 60, pageParam),
    getNextPageParam: (last, pages) => last.length === 60 ? pages.length * 60 : undefined,
  });
  const comments = data?.pages.flat() || [];
  return <section aria-labelledby="all-testimonies">
    <h2 id="all-testimonies" className="font-heading text-4xl mb-6">All testimonies</h2>
    {isLoading ? <p className="flex items-center gap-2 text-muted-foreground py-10"><Loader2 size={18} className="animate-spin"/> Opening the yearbook…</p> : isError ? <div role="alert"><p>These memories couldn’t load.</p><button onClick={() => refetch()} className="text-primary underline mt-3">Try again</button></div> : <>
      {!comments.length && <p className="text-muted-foreground">No testimonies are available.</p>}
      <div className="folio-gallery">{comments.map(comment => <CommentCard key={comment.id} comment={comment} direction="all" member={null} people={people} onSelect={onSelect}/>)}</div>
      {hasNextPage && <button disabled={isFetchingNextPage} onClick={() => fetchNextPage()} className="border border-border rounded px-6 py-3 text-sm text-primary mx-auto flex items-center gap-2 disabled:opacity-60">{isFetchingNextPage && <Loader2 size={16} className="animate-spin"/>}Show more testimonies</button>}
    </>}
  </section>;
}