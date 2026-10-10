import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Upload, Trash2, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import useSignedFile from '@/components/media/useSignedFile';
import PhotoLightbox from '@/components/media/PhotoLightbox';

function PhotoTile({ photo, isAdmin, onOpen, onDelete, busy }) {
  const url = useSignedFile(photo.file_uri);
  return <figure className="media-phototile" onClick={onOpen} role="button" tabIndex={0}
    onKeyDown={(event) => { if (event.key === 'Enter') onOpen(); }} aria-label={photo.title || 'Open photo'}>
    {url ? <Image src={url} alt={photo.title || 'Archive photo'}/> : <div style={{ height: 180 }}/>}
    {(photo.title || photo.caption) && <figcaption>{photo.title && <strong>{photo.title}</strong>}{photo.caption}</figcaption>}
    {isAdmin && <button className="media-photodelete" disabled={busy} aria-label="Remove photo"
      onClick={(event) => { event.stopPropagation(); onDelete(); }}>
      {busy ? <Loader2 size={13} className="animate-spin"/> : <Trash2 size={13}/>}
    </button>}
  </figure>;
}

export default function AlbumView({ album, isAdmin, onBack, onEdit }) {
  const client = useQueryClient();
  const [extraPages, setExtraPages] = useState([]);
  const [busyId, setBusyId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(-1);

  const { data: firstPage, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['media-photos', album.id],
    queryFn: () => base44.entities.Photo.filter({ album_id: album.id }, { sort: 'order', limit: 60 }),
  });

  const loaded = [firstPage, ...extraPages].filter(Boolean);
  const photos = loaded.flatMap((page) => page?.items || []);
  const lastPage = loaded[loaded.length - 1];
  const hasMore = !!lastPage?.has_more;

  async function loadMore() {
    if (!lastPage?.next_cursor) return;
    const page = await base44.entities.Photo.filter({ album_id: album.id }, { sort: 'order', limit: 60, cursor: lastPage.next_cursor });
    setExtraPages((current) => [...current, page]);
  }

  async function refreshPhotos() {
    setExtraPages([]);
    await refetch();
  }

  async function addPhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setUploading(true); setError('');
    try {
      const start = photos.length;
      const records = [];
      for (let index = 0; index < files.length; index += 1) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: files[index] });
        records.push({ album_id: album.id, file_uri, title: files[index].name.replace(/\.[^.]+$/, ''), order: start + index });
      }
      await base44.entities.Photo.bulkCreate(records);
      if (!album.cover_file_uri && records[0]) await base44.entities.Album.update(album.id, { cover_file_uri: records[0].file_uri });
      await refreshPhotos();
      client.invalidateQueries({ queryKey: ['media-albums'] });
    } catch {
      setError('Those photos could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo) {
    setBusyId(photo.id); setError('');
    try {
      await base44.entities.Photo.delete(photo.id);
      await refreshPhotos();
      client.invalidateQueries({ queryKey: ['media-albums'] });
    } catch {
      setError('That photo could not be removed.');
    } finally {
      setBusyId('');
    }
  }

  return <section>
    <button onClick={onBack} className="media-action is-quiet" style={{ marginBottom: 22 }}><ArrowLeft size={14}/> All albums</button>
    <div className="media-sectionhead">
      <div>
        <h2>{album.title}</h2>
        {album.description && <p>{album.description}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="media-count">{isLoading ? '…' : `${photos.length}${hasMore ? '+' : ''} photos`}</span>
        {isAdmin && <>
          <button className="media-action is-quiet" onClick={onEdit}><Pencil size={13}/> Edit album</button>
          <label className="media-action">
            {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>} {uploading ? 'Uploading…' : 'Add photos'}
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addPhotos} disabled={uploading}/>
          </label>
        </>}
      </div>
    </div>
    {error && <div className="media-alert" role="alert">{error}</div>}
    {isLoading && <p className="media-status"><Loader2 size={18} className="animate-spin"/> Opening the album…</p>}
    {isError && <div className="media-alert" role="alert">This album could not be opened. <button onClick={() => refetch()} style={{ textDecoration: 'underline' }}>Try again</button></div>}
    {!isLoading && !isError && !photos.length && <div className="media-empty">
      <Upload size={26} strokeWidth={1.2}/>
      <h3>This album is empty</h3>
      <p>{isAdmin ? 'Add the first photos from your computer and they will appear here for the batch.' : 'Photos are still being gathered for this album.'}</p>
    </div>}
    {!!photos.length && <div className="media-photogrid">
      {photos.map((photo, index) => <PhotoTile key={photo.id} photo={photo} isAdmin={isAdmin}
        busy={busyId === photo.id} onOpen={() => setLightbox(index)} onDelete={() => removePhoto(photo)}/>)}
    </div>}
    {hasMore && <div className="text-center mt-8">
      <button className="media-action" onClick={loadMore} disabled={isFetching}>{isFetching ? <Loader2 size={14} className="animate-spin"/> : null} Show more photos</button>
    </div>}
    {lightbox >= 0 && <PhotoLightbox photos={photos} index={lightbox} onClose={() => setLightbox(-1)} onIndexChange={setLightbox}/>}
  </section>;
}