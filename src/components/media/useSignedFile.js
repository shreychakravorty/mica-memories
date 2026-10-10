import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Private archive files are stored without a public URL, so each one is opened
// through a short-lived signed link that respects the app's permissions.
export default function useSignedFile(fileUri, expiresIn = 3600) {
  const { data } = useQuery({
    queryKey: ['media-signed-file', fileUri, expiresIn],
    enabled: !!fileUri,
    staleTime: Math.max(60, expiresIn - 300) * 1000,
    retry: false,
    queryFn: async () => {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn });
      return signed_url;
    },
  });
  return data || null;
}