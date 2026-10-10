import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useJellyfinPoster(video) {
  const enabled = video?.source === 'jellyfin' && !!video?.jellyfin_item_id;
  const { data } = useQuery({
    queryKey: ['jellyfin-poster', video?.jellyfin_item_id],
    enabled,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('jellyfinMedia', { action: 'poster', itemId: video.jellyfin_item_id });
      return response.data?.dataUrl || null;
    },
  });
  return data || null;
}