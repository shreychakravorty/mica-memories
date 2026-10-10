import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function JellyfinLibraryPicker({ onAdded }) {
  const [libraryId, setLibraryId] = useState('');
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState('theatre');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const libraries = useQuery({
    queryKey: ['jellyfin-libraries'],
    retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('jellyfinAdmin', { action: 'libraries' });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data.libraries || [];
    },
  });

  const items = useQuery({
    queryKey: ['jellyfin-items', libraryId],
    enabled: !!libraryId,
    retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('jellyfinAdmin', { action: 'items', libraryId });
      if (response.data?.error) throw new Error(response.data.error);
      return response.data.items || [];
    },
  });

  function toggle(id) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  async function addSelected() {
    const chosen = (items.data || []).filter((item) => selected.includes(item.id));
    if (!chosen.length) { setError('Pick at least one video from the library.'); return; }
    setBusy(true); setError('');
    try {
      await base44.entities.VideoItem.bulkCreate(chosen.map((item, index) => ({
        title: item.title,
        category,
        source: 'jellyfin',
        jellyfin_item_id: item.id,
        description: item.year ? `From ${item.year}` : '',
        order: Date.now() + index,
      })));
      setSelected([]);
      onAdded();
    } catch {
      setError('Those videos could not be added to the archive.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="media-formgrid">
    <div className="flex flex-wrap items-end gap-3">
      <label className="media-field flex-1 min-w-[200px]">Jellyfin library
        <select value={libraryId} onChange={(event) => { setLibraryId(event.target.value); setSelected([]); }} disabled={libraries.isLoading}>
          <option value="">{libraries.isLoading ? 'Loading libraries…' : 'Choose a library'}</option>
          {(libraries.data || []).map((library) => <option key={library.id} value={library.id}>{library.name}</option>)}
        </select>
      </label>
      <label className="media-field">Add as
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="theatre">Theatre</option>
          <option value="music">Music</option>
        </select>
      </label>
      <button className="media-action" onClick={addSelected} disabled={busy || !selected.length}>
        {busy ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Add {selected.length || ''} to archive
      </button>
    </div>

    {libraries.isError && <div className="media-alert" role="alert">The library list could not be loaded. <button onClick={() => libraries.refetch()} style={{ textDecoration: 'underline' }}>Try again</button></div>}
    {items.isError && <div className="media-alert" role="alert">Those videos could not be listed. <button onClick={() => items.refetch()} style={{ textDecoration: 'underline' }}>Try again</button></div>}
    {error && <div className="media-alert" role="alert">{error}</div>}

    {items.isLoading && <p className="media-status"><Loader2 size={16} className="animate-spin"/> Reading the library…</p>}
    {!libraryId && !libraries.isLoading && <p className="media-hint">Choose a library above to see the videos inside it.</p>}
    {libraryId && items.data && !items.data.length && <p className="media-hint">No videos were found in this library.</p>}
    {!!items.data?.length && <>
      <div className="flex items-center justify-between">
        <p className="media-sublabel" style={{ margin: 0 }}>{items.data.length} videos found</p>
        <button className="media-action is-quiet" onClick={() => items.refetch()}><RefreshCw size={12}/> Refresh</button>
      </div>
      <div className="media-rowlist">
        {items.data.map((item) => <label key={item.id} className="media-row" style={{ cursor: 'pointer' }}>
          <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggle(item.id)} aria-label={`Select ${item.title}`}/>
          <span>{item.title}</span>
          <small>{[item.year, item.runtimeMinutes ? `${item.runtimeMinutes} min` : null].filter(Boolean).join(' · ') || '—'}</small>
        </label>)}
      </div>
    </>}
  </div>;
}