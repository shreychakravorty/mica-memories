import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import useSignedFile from '@/components/media/useSignedFile';

export default function PhotoLightbox({ photos, index, onClose, onIndexChange }) {
  const photo = photos[index];
  const url = useSignedFile(photo?.file_uri);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && index < photos.length - 1) onIndexChange(index + 1);
      if (event.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) return null;

  return <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={photo.title || 'Archive photo'}>
    <button className="media-lightbox-close" onClick={onClose} aria-label="Close photo"><X size={20}/></button>
    {index > 0 && <button className="media-lightbox-nav is-prev" onClick={() => onIndexChange(index - 1)} aria-label="Previous photo"><ChevronLeft size={22}/></button>}
    {index < photos.length - 1 && <button className="media-lightbox-nav is-next" onClick={() => onIndexChange(index + 1)} aria-label="Next photo"><ChevronRight size={22}/></button>}
    <figure className="media-lightbox-figure">
      {url
        ? <Image src={url} alt={photo.title || 'Archive photo'} fittingType="fit" className="media-lightbox-image"/>
        : <div className="media-lightbox-loading">Opening photo…</div>}
      {(photo.title || photo.caption) && <figcaption><strong>{photo.title}</strong>{photo.caption && <span>{photo.caption}</span>}</figcaption>}
    </figure>
  </div>;
}