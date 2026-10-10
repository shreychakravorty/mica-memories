import React from 'react';
import { Play, Loader2, Film, Music, ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';
import useJellyfinPoster from '@/components/media/useJellyfinPoster';

export default function VideoCard({ video, busy, onWatch }) {
  const poster = useJellyfinPoster(video);
  const isLink = video.source === 'link';
  const FallbackIcon = video.category === 'music' ? Music : Film;

  return <article className="media-videocard">
    <button className="media-videoframe" onClick={() => onWatch(video)} aria-label={`Play ${video.title}`}>
      {poster
        ? <Image src={poster} alt={video.title}/>
        : <span className="media-videofallback"><FallbackIcon size={30} strokeWidth={1.1}/></span>}
      <span className="media-videoplay">
        <span>{busy ? <Loader2 size={20} className="animate-spin"/> : isLink ? <ExternalLink size={20}/> : <Play size={20} style={{ marginLeft: 3 }}/>}</span>
      </span>
    </button>
    <div className="media-videometa">
      <h3>{video.title}</h3>
      {video.description && <p>{video.description}</p>}
      <div className="media-videofoot">
        <span className="media-chip">{video.category === 'music' ? 'Music' : 'Theatre'}</span>
        <span className="media-runtime">{isLink ? 'Opens elsewhere' : 'In the archive'}</span>
      </div>
    </div>
  </article>;
}