import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Trash2, PlugZap, Film, Plus } from 'lucide-react';
import JellyfinLibraryPicker from '@/components/media/JellyfinLibraryPicker';

export default function JellyfinAdmin({ onClose }) {
  const client = useQueryClient();
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState('theatre');
  const [linkBusy, setLinkBusy] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['jellyfin-status'],
    retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('jellyfinAdmin', { action: 'status' });
      return response.data || {};
    },
  });

  const videos = useQuery({
    queryKey: ['media-videos-admin'],
    queryFn: async () => {
      const { items } = await base44.entities.VideoItem.filter({}, { sort: '-order', limit: 200 });
      return items;
    },
  });

  useEffect(() => { if (statusQuery.data) setStatus(statusQuery.data); }, [statusQuery.data]);

  async function connect() {
    setBusy(true); setError('');
    try {
      const response = await base44.functions.invoke('jellyfinAdmin', { action: 'save', url, apiKey });
      if (response.data?.error) { setError(response.data.error); return; }
      setStatus(response.data);
      setApiKey('');
      client.invalidateQueries({ queryKey: ['jellyfin-libraries'] });
    } catch {
      setError('The Jellyfin server could not be reached.');
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm('Disconnect the Jellyfin server? The videos already added will stop playing.')) return;
    setBusy(true); setError('');
    try {
      await base44.functions.invoke('jellyfinAdmin', { action: 'clear' });
      setStatus({ configured: false });
      client.invalidateQueries({ queryKey: ['jellyfin-libraries'] });
      client.invalidateQueries({ queryKey: ['jellyfin-poster'] });
    } catch {
      setError('The connection could not be removed.');
    } finally {
      setBusy(false);
    }
  }

  async function addLink() {
    if (!linkTitle.trim() || !/^https?:\/\//i.test(linkUrl.trim())) {
      setError('Enter a title and a full link starting with http:// or https://');
      return;
    }
    setLinkBusy(true); setError('');
    try {
      await base44.entities.VideoItem.create({
        title: linkTitle.trim(),
        category: linkCategory,
        source: 'link',
        external_url: linkUrl.trim(),
        order: Date.now()
      });
      setLinkTitle(''); setLinkUrl('');
      client.invalidateQueries({ queryKey: ['media-videos-admin'] });
      client.invalidateQueries({ queryKey: ['media-videos'] });
    } catch {
      setError('That video could not be added.');
    } finally {
      setLinkBusy(false);
    }
  }

  async function removeVideo(video) {
    if (!window.confirm(`Remove “${video.title}” from the archive?`)) return;
    try {
      await base44.entities.VideoItem.delete(video.id);
      client.invalidateQueries({ queryKey: ['media-videos-admin'] });
      client.invalidateQueries({ queryKey: ['media-videos'] });
    } catch {
      setError('That video could not be removed.');
    }
  }

  const connected = status?.configured;

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="media-tokens sm:max-w-3xl max-h-[88vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Manage the video archive</DialogTitle>
        <DialogDescription>Point the yearbook at your Jellyfin server, then pick which films belong in the class archive.</DialogDescription>
      </DialogHeader>

      <div className="media-formgrid">
        <div className="media-notice">
          {connected
            ? <>Connected to <strong>{status.serverName || 'Jellyfin'}</strong> at <strong>{status.url}</strong>{status.version ? ` (version ${status.version})` : ''}. The address and API key stay on the server and are never sent to members' browsers.</>
            : <>Not connected yet. Add your Jellyfin address and an API key so the archive can stream the class videos. You will find API keys in Jellyfin under Dashboard → API Keys.</>}
        </div>

        <p className="media-sublabel">Jellyfin connection</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="media-field">Server address
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://jellyfin.example.com" autoComplete="off"/>
          </label>
          <label className="media-field">API key
            <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={connected ? '•••••••• (saved)' : 'Paste your Jellyfin API key'} autoComplete="off"/>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="media-action" onClick={connect} disabled={busy || !url.trim() || !apiKey.trim()}>
            {busy ? <Loader2 size={14} className="animate-spin"/> : <PlugZap size={14}/>} {connected ? 'Update connection' : 'Connect Jellyfin'}
          </button>
          {connected && <button className="media-action is-quiet" onClick={disconnect} disabled={busy}><Trash2 size={14}/> Disconnect</button>}
        </div>
        {status?.error && <div className="media-alert" role="alert">{status.error}</div>}
        {error && <div className="media-alert" role="alert">{error}</div>}

        {connected && <>
          <p className="media-sublabel" style={{ marginTop: 8 }}>Add videos from Jellyfin</p>
          <JellyfinLibraryPicker onAdded={() => {
            client.invalidateQueries({ queryKey: ['media-videos-admin'] });
            client.invalidateQueries({ queryKey: ['media-videos'] });
          }}/>
        </>}

        <p className="media-sublabel" style={{ marginTop: 8 }}>Add a video by link</p>
        <p className="media-hint">For anything that is not on Jellyfin, paste a direct video or page link and it will open in a new tab.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="media-field">Title
            <input value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} placeholder="Farewell skit, 2013"/>
          </label>
          <label className="media-field">Link
            <input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://…"/>
          </label>
          <label className="media-field">Category
            <select value={linkCategory} onChange={(event) => setLinkCategory(event.target.value)}>
              <option value="theatre">Theatre</option>
              <option value="music">Music</option>
            </select>
          </label>
        </div>
        <div>
          <button className="media-action is-quiet" onClick={addLink} disabled={linkBusy}>
            {linkBusy ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Add link
          </button>
        </div>

        <p className="media-sublabel" style={{ marginTop: 8 }}>Videos in the archive</p>
        {videos.isLoading && <p className="media-status"><Loader2 size={16} className="animate-spin"/> Loading…</p>}
        {!videos.isLoading && !videos.data?.length && <p className="media-hint">No videos have been added yet.</p>}
        {!!videos.data?.length && <div className="media-rowlist">
          {videos.data.map((video) => <div key={video.id} className="media-row">
            <Film size={14} style={{ color: '#bda16a' }} aria-hidden="true"/>
            <span>{video.title}</span>
            <small>{video.category === 'music' ? 'Music' : 'Theatre'}{video.source === 'link' ? ' · link' : ''}</small>
            <button className="media-iconbutton is-danger" onClick={() => removeVideo(video)} aria-label={`Remove ${video.title}`}><Trash2 size={12}/></button>
          </div>)}
        </div>}
      </div>
    </DialogContent>
  </Dialog>;
}