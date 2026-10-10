import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import useSignedFile from '@/components/media/useSignedFile';

export default function AlbumDialog({ album, onClose, onSaved }) {
  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [cover, setCover] = useState(album?.cover_file_uri || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const coverUrl = useSignedFile(cover);

  async function pickCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setCover(file_uri);
    } catch {
      setError('That cover image could not be uploaded.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!title.trim()) { setError('Give the album a title.'); return; }
    setBusy(true); setError('');
    try {
      const values = { title: title.trim(), description: description.trim(), cover_file_uri: cover };
      if (album) await base44.entities.Album.update(album.id, values);
      else await base44.entities.Album.create({ ...values, order: Date.now() });
      onSaved();
    } catch {
      setError('The album could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="media-archive sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{album ? 'Edit album' : 'New photo album'}</DialogTitle>
        <DialogDescription>Albums keep a set of photos together, like a folder in the yearbook.</DialogDescription>
      </DialogHeader>
      <div className="media-formgrid">
        <label className="media-field">Album title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Farewell night, 2013" autoFocus/>
        </label>
        <label className="media-field">A line about it
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="The last evening we all stood in the same courtyard."/>
        </label>
        <div className="media-field">Cover photo
          <div className="flex items-center gap-4">
            <span className="w-24 h-16 rounded-md border border-border overflow-hidden grid place-items-center bg-secondary/60 text-muted-foreground">
              {coverUrl ? <Image src={coverUrl} alt="Album cover" className="w-full h-full"/> : <ImageIcon size={18}/>}
            </span>
            <label className="media-uploader">
              <Upload size={14}/> {cover ? 'Change cover' : 'Upload cover'}
              <input type="file" accept="image/*" onChange={pickCover} disabled={busy}/>
            </label>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={save} disabled={busy}>{busy && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}{album ? 'Save changes' : 'Create album'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}