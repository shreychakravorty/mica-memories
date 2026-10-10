import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Images, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import useSignedFile from '@/components/media/useSignedFile';
import AlbumDialog from '@/components/media/AlbumDialog';
import AlbumView from '@/components/media/AlbumView';

function AlbumCard({ album, isAdmin, onOpen, onEdit, onDelete }) {
  const url = useSignedFile(album.cover_file_uri);
  return <article className="media-albumcard">
    <button onClick={onOpen} style={{ display: 'block', width: '100%', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
      <span className="media-albumcover">
        {url ? <Image src={url} alt={album.title}/> : <span className="media-albumcover-empty"><Images size={26} strokeWidth={1.2}/></span>}
      </span>
      <span className="media-albummeta">
        <h3>{album.title}</h3>
        {album.description && <p>{album.description}</p>}
        <span className="media-albumtag">Open album</span>
      </span>
    </button>
    {isAdmin && <div className="media-adminrow">
      <button className="media-iconbutton" onClick={onEdit}><Pencil size={12}/> Edit</button>
      <button className="media-iconbutton is-danger" onClick={onDelete}><Trash2 size={12}/> Delete</button>
    </div>}
  </article>;
}

export default function PhotoGallery({ isAdmin }) {
  const client = useQueryClient();
  const [openId, setOpenId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState('');

  const { data: albums = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['media-albums'],
    queryFn: async () => {
      const { items } = await base44.entities.Album.filter({}, { sort: 'order', limit: 100 });
      return items;
    },
  });

  const open = albums.find((album) => album.id === openId) || null;

  async function removeAlbum(album) {
    if (!window.confirm(`Delete “${album.title}” and all of its photos? This cannot be undone.`)) return;
    setError('');
    try {
      await base44.entities.Photo.deleteMany({ album_id: album.id });
      await base44.entities.Album.delete(album.id);
      client.invalidateQueries({ queryKey: ['media-albums'] });
      client.invalidateQueries({ queryKey: ['media-photos', album.id] });
    } catch {
      setError('That album could not be deleted.');
    }
  }

  if (open) return <>
    <AlbumView album={open} isAdmin={isAdmin} onBack={() => setOpenId(null)} onEdit={() => setDialog(open)}/>
    {dialog && <AlbumDialog album={dialog === 'new' ? null : dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); refetch(); }}/>}
  </>;

  return <section>
    <div className="media-sectionhead">
      <div>
        <h2>Photo albums</h2>
        <p>Snapshots from the years we shared: festivals, corridors, farewell night and everything between.</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="media-count">{isLoading ? '…' : `${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}</span>
        {isAdmin && <button className="media-action" onClick={() => setDialog('new')}><Plus size={14}/> New album</button>}
      </div>
    </div>
    {error && <div className="media-alert" role="alert">{error}</div>}
    {isLoading && <p className="media-status"><Loader2 size={18} className="animate-spin"/> Opening the photo archive…</p>}
    {isError && <div className="media-alert" role="alert">The photo archive could not be opened. <button onClick={() => refetch()} style={{ textDecoration: 'underline' }}>Try again</button></div>}
    {!isLoading && !isError && !albums.length && <div className="media-empty">
      <Images size={26} strokeWidth={1.2}/>
      <h3>No albums yet</h3>
      <p>{isAdmin ? 'Create your first album and start adding photos from your computer.' : 'The batch photos are still being gathered. Check back soon.'}</p>
    </div>}
    {!!albums.length && <div className="media-albumgrid">
      {albums.map((album) => <AlbumCard key={album.id} album={album} isAdmin={isAdmin}
        onOpen={() => setOpenId(album.id)} onEdit={() => setDialog(album)} onDelete={() => removeAlbum(album)}/>)}
    </div>}
    {dialog && <AlbumDialog album={dialog === 'new' ? null : dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); refetch(); }}/>}
  </section>;
}