// =============================================================================
// Consolidated API hooks
// =============================================================================

// --- useArticles / useArticle ------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { ALL_TEAMS } from '../data/teamsData';

export const useArticles = ({ category, page = 1, limit = 10, tag } = {}) => {
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (category) params.category = category;
      if (tag) params.tag = tag;
      const { data } = await api.get('/articles', { params });
      setArticles(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [category, page, limit, tag]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  return { articles, meta, loading, error, refetch: fetchArticles };
};

export const useArticle = (slug) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api.get(`/articles/${slug}`)
      .then(({ data }) => setArticle(data))
      .catch(err => setError(err.response?.status === 404 ? '404' : 'error'))
      .finally(() => setLoading(false));
  }, [slug]);

  return { article, loading, error };
};

// --- useInView ---------------------------------------------------------------

export function useInView({ threshold = 0.12, once = true, rootMargin = '0px' } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, visible];
}

// --- useLive -----------------------------------------------------------------

const _LIVE_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const _POLL_INTERVAL_LIVE = 60_000;

const _CHANNELS_FROM_TEAMS = [];
for (const team of ALL_TEAMS) {
  for (const player of (team.roster || [])) {
    const handle = player.twitch || player.gamertag;
    if (handle && !_CHANNELS_FROM_TEAMS.includes(handle)) {
      _CHANNELS_FROM_TEAMS.push(handle);
    }
  }
}

const _EXTRA_CHANNELS = [
  'swagg', 'cloakzy', 'symfuhny', 'huskerrs', 'Tommey',
  'JoeWo', 'Jukeyz', 'Swofty', 'Booya', 'Viss', 'Dysmo', 'Rated',
];

export const LIVE_CHANNELS = [...new Set([..._CHANNELS_FROM_TEAMS, ..._EXTRA_CHANNELS])];

export function useLive() {
  const [streams, setStreams]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLive = useCallback(async () => {
    try {
      const channels = LIVE_CHANNELS.join(',');
      const res = await fetch(`${_LIVE_API_BASE}/live?channels=${channels}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStreams(data.streams || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, _POLL_INTERVAL_LIVE);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const liveCount = streams.filter(s => s.isLive).length;

  return { streams, loading, error, lastUpdated, liveCount, refresh: fetchLive };
}

// --- useRanked ---------------------------------------------------------------

const _RANKED_API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const _POLL_INTERVAL_RANKED = 5 * 60 * 1000; // 5 min

export function useRanked(mode = 'warzone') {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const timerRef = useRef(null);

  const fetchRanked = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${_RANKED_API}/ranked/${mode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchRanked();
    timerRef.current = setInterval(fetchRanked, _POLL_INTERVAL_RANKED);
    return () => clearInterval(timerRef.current);
  }, [fetchRanked]);

  return { entries: data?.entries || [], meta: data, loading, error, refresh: fetchRanked, lastRefresh };
}

// --- useWeaponImages ---------------------------------------------------------

const _WEAPONS_API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useWeaponImages(game = 'warzone-bo7') {
  const [imageMap, setImageMap] = useState({});

  useEffect(() => {
    fetch(`${_WEAPONS_API}/weapons?game=${game}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.data) return;
        const map = {};
        for (const w of data.data) {
          if (!w.imageUrl) continue;
          // by name lowercase
          map[w.name.toLowerCase()] = w.imageUrl;
          // by slug as-is  (e.g. "ak-27")
          map[w.slug] = w.imageUrl;
          // by slug without hyphens (e.g. "ak27") — matches static IDs
          map[w.slug.replace(/-/g, '')] = w.imageUrl;
          // by name without spaces/hyphens lowercase (e.g. "ak27", "carbon57")
          map[w.name.toLowerCase().replace(/[\s-]/g, '')] = w.imageUrl;
        }
        setImageMap(map);
      })
      .catch(() => {});
  }, [game]);

  return imageMap;
}
