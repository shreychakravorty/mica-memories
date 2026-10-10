import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { loadJellyfinConfig, saveJellyfinConfig, jellyfinFetch, jellyfinJson, resolveJellyfinUserId, ticksToMinutes } from '../../shared/jellyfin.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Only the yearbook owner can manage media.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'save') {
      const url = String(body.url || '').trim().replace(/\/+$/, '');
      const apiKey = String(body.apiKey || '').trim();
      if (!/^https?:\/\/.+/i.test(url)) {
        return Response.json({ error: 'Enter the full Jellyfin address, starting with http:// or https://' }, { status: 400 });
      }
      if (!apiKey) return Response.json({ error: 'Enter your Jellyfin API key.' }, { status: 400 });
      const probe = await jellyfinFetch({ url, apiKey }, '/System/Info');
      if (!probe.ok) {
        return Response.json({ error: `Jellyfin refused the connection (status ${probe.status}). Check the address and API key.` }, { status: 400 });
      }
      const info = await probe.json().catch(() => ({}));
      await saveJellyfinConfig(base44, {
        jellyfin_url: url,
        jellyfin_api_key: apiKey,
        jellyfin_user_id: String(body.userId || '').trim()
      });
      return Response.json({ configured: true, url, serverName: info.ServerName || 'Jellyfin', version: info.Version || '' });
    }

    if (action === 'clear') {
      const existing = await base44.asServiceRole.entities.MediaSetting.list('-updated_date', 5);
      const rows = Array.isArray(existing) ? existing : existing && existing.items ? existing.items : [];
      for (const row of rows) await base44.asServiceRole.entities.MediaSetting.delete(row.id);
      return Response.json({ configured: false });
    }

    const config = await loadJellyfinConfig(base44);

    if (action === 'status') {
      if (!config) return Response.json({ configured: false });
      try {
        const info = await jellyfinJson(config, '/System/Info');
        return Response.json({ configured: true, url: config.url, serverName: info.ServerName || 'Jellyfin', version: info.Version || '' });
      } catch (error) {
        return Response.json({ configured: true, url: config.url, error: 'The saved Jellyfin server could not be reached.' });
      }
    }

    if (!config) return Response.json({ error: 'Connect your Jellyfin server first.' }, { status: 400 });

    if (action === 'libraries') {
      const userId = await resolveJellyfinUserId(config);
      const views = await jellyfinJson(config, `/Users/${userId}/Views`);
      const items = (views && views.Items) || [];
      return Response.json({
        libraries: items.map((view) => ({ id: view.Id, name: view.Name, type: view.CollectionType || '' }))
      });
    }

    if (action === 'items') {
      const libraryId = String(body.libraryId || '').trim();
      if (!/^[a-zA-Z0-9]{1,64}$/.test(libraryId)) return Response.json({ error: 'Choose a library first.' }, { status: 400 });
      const userId = await resolveJellyfinUserId(config);
      const params = new URLSearchParams({
        ParentId: libraryId,
        Recursive: 'true',
        IncludeItemTypes: 'Movie,Episode,Video,MusicVideo',
        Fields: 'RunTimeTicks,ProductionYear',
        SortBy: 'SortName',
        Limit: '300'
      });
      const result = await jellyfinJson(config, `/Users/${userId}/Items?${params.toString()}`);
      const items = (result && result.Items) || [];
      return Response.json({
        items: items.map((item) => ({
          id: item.Id,
          title: item.Name,
          year: item.ProductionYear || null,
          runtimeMinutes: ticksToMinutes(item.RunTimeTicks),
          hasPoster: !!(item.ImageTags && item.ImageTags.Primary)
        }))
      });
    }

    return Response.json({ error: 'Unknown request.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'The Jellyfin server could not be reached.' }, { status: 500 });
  }
}