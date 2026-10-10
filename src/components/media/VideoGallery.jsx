import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Film, Settings, X } from 'lucide-react';
import VideoCard from '@/components/media/VideoCard';

const CATEGORIES = [
  { value: 'all', label: 'Everything' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'music', label: 'Music' },
];

export default function VideoGallery({ isAdmin, onManage }) {
  const [category, setCategory] = useState('all');
  const [playing, setPlaying] = useState(null);
  const [playUrl, setPlayUrl] = useState('');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const { data: videos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['media-videos', category],
    queryFn: async () => {
      const { items } = await base44.entities.VideoItem.filter(category === 'all' ? {} : { category }, { sort: 'order', limit: 100 });
      return items;
    },
  });

  async function watch(video) {
    setError('');
    if (video.source === 'link') {
      window.open(video.external_url, '_blank', 'noopener');
      return;
    }
    setPlaying(video); setPlayUrl(''); setBusyId(video.id);
    try {
      const response = await base44.functions.invoke('jellyfinMedia', { action: 'play', itemId: video.jellyfin_item_id });
      if (response.data?.error) throw new Error(response.data.error);
      setPlayUrl(response.data.url);
      base44.analytics.track({ eventName: 'archive_video_play', properties: { category: video.category } });
    } catch {
      setError('This video could not be started. The Jellyfin server may be offline.');
      setPlaying(null);
    } finally {
      setBusyId('');
    }
  }

  return <section>
    <div className="media-sectionhead">
      <div>
        <h2>Films & performances</h2>
        <p>Theatre productions and music videos from our years at MICA, streamed from the class Jellyfin server.</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="media-count">{isLoading ? '…' : `${videos.length} ${videos.length === 1 ? 'film' : 'films'}`}</span>
        {isAdmin && <button className="media-action is-quiet" onClick={onManage}><Settings size={14}/> Manage videos</button>}
      </div>
    </div>

    <div className="media-pills" style={{ marginBottom: 26 }} role="group" aria-label="Filter videos">
      {CATEGORIES.map((option) => <button key={option.value} className="media-pill" aria-pressed={category === option.value}
        onClick={() => setCategory(option.value)}>{option.label}</button>)}
    </div>

    {playing && <div className="media-player">
      <div className="media-playerhead">
        <h3>{playing.title}</h3>
        <button className="media-action is-quiet" onClick={() => { setPlaying(null); setPlayUrl(''); }}><X size={13}/> Close</button>
      </div>
      {playUrl
        ? <video src={playUrl} controls autoPlay playsInline/>
        : <div className="media-playerbody"><Loader2 size={16} className="animate-spin inline mr-2"/> Preparing the film…</div>}
      {playing.description && <div className="media-playerbody">{playing.description}</div>}
    </div>}

    {error && <div className="media-alert" role="alert">{error}</div>}
    {isLoading && <p className="media-status"><Loader2 size={18} className="animate-spin"/> Loading the film reel…</p>}
    {isError && <div className="media-alert" role="alert">The video archive could not be opened. <button onClick={() => refetch()} style={{ textDecoration: 'underline' }}>Try again</button></div>}
    {!isLoading && !isError && !videos.length && <div className="media-empty">
      <Film size={26} strokeWidth={1.2}/>
      <h3>No films here yet</h3>
      <p>{isAdmin ? 'Connect your Jellyfin server and add the theatre and music videos to the archive.' : 'The class films are still being uploaded. Check back soon.'}</p>
    </div>}
    {!!videos.length && <div className="media-videogrid">
      {videos.map((video) => <VideoCard key={video.id} video={video} busy={busyId === video.id} onWatch={watch}/>)}
    </div>}
  </section>;
}