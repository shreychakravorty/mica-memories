import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Image } from '@/components/ui/image';
import { Heart } from 'lucide-react';
import MediaHeader from '@/components/media/MediaHeader';
import PhotoGallery from '@/components/media/PhotoGallery';
import VideoGallery from '@/components/media/VideoGallery';
import JellyfinAdmin from '@/components/media/JellyfinAdmin';
import '@/components/media/media-archive.css';

const COURTYARD = 'https://media.base44.com/images/public/6ac1a6d5393990fdbc0753b4/3a7d4cd76_image.png';

export default function MediaArchive() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('photos');
  const [managing, setManaging] = useState(false);
  const isAdmin = user?.role === 'admin';

  return <div className="media-archive flex flex-col">
    <MediaHeader onYearbook={() => navigate('/')}/>
    <main className="media-main">
      <section className="media-hero">
        <Image className="media-heroimg" src={COURTYARD} alt="MICA’s brick courtyard shaded by green trees" focalPointY={0.55}/>
        <span className="media-heroshade" aria-hidden="true"/>
        <div className="media-herocopy">
          <p className="media-eyebrow">The class archive · 2013</p>
          <h1>Old photos, and the films we made</h1>
          <p className="media-intro">Albums from our years on campus, and the theatre and music videos kept on the class Jellyfin server. Open to the batch only.</p>
          <div className="media-tabs" role="tablist" aria-label="Archive sections">
            <button role="tab" aria-selected={tab === 'photos'} className="media-tab" onClick={() => setTab('photos')}>Photos</button>
            <button role="tab" aria-selected={tab === 'videos'} className="media-tab" onClick={() => setTab('videos')}>Videos</button>
          </div>
        </div>
      </section>

      <div className="media-body">
        {tab === 'photos'
          ? <PhotoGallery isAdmin={isAdmin}/>
          : <VideoGallery isAdmin={isAdmin} onManage={() => setManaging(true)}/>}
      </div>
    </main>

    <footer className="media-footer">
      <span>MICA, Ahmedabad · Class of 2013</span>
      <span className="flex items-center gap-1.5">Kept with <Heart size={11}/> for the batch.</span>
      <span>ARCHIVE · MEMBERS ONLY</span>
    </footer>

    {managing && <JellyfinAdmin onClose={() => setManaging(false)}/>}
  </div>;
}