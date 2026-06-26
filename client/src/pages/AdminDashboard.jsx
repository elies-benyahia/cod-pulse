import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useArticles } from '../hooks/api';
import MetaTags from '../components/MetaTags';
import api from '../utils/api';
import { formatDate } from '../utils/format';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [syncInfo, setSyncInfo] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    api.get('/articles/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/scraper/status').then(r => setSyncInfo(r.data)).catch(() => {});
  }, []);

  const triggerScrape = async () => {
    setSyncing(true);
    try {
      await api.post('/scraper/trigger');
      const r = await api.get('/scraper/status');
      setSyncInfo(r.data);
      const s = await api.get('/articles/stats');
      setStats(s.data);
    } catch (err) {
      console.error('Scrape failed', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <MetaTags title="Admin Dashboard" description="" />
      <div className={styles.layout}>
        {/* Sidebar admin */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogo}>ADMIN</span>
            <span className={styles.sidebarUser}>{user?.email}</span>
          </div>
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${view === 'dashboard' ? styles.navActive : ''}`}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`${styles.navItem} ${view === 'articles' ? styles.navActive : ''}`}
              onClick={() => setView('articles')}
            >
              Articles
            </button>
            <button
              className={`${styles.navItem} ${view === 'create' ? styles.navActive : ''}`}
              onClick={() => setView('create')}
            >
              + Nouvel article
            </button>
          </nav>
          <button className={styles.logoutBtn} onClick={logout}>
            Déconnexion
          </button>
        </aside>

        {/* Contenu */}
        <main className={styles.main}>
          {view === 'dashboard' && (
            <DashboardView stats={stats} syncInfo={syncInfo} syncing={syncing} onSync={triggerScrape} />
          )}
          {view === 'articles' && <ArticlesView />}
          {view === 'create' && <CreateArticleView onCreated={() => setView('articles')} />}
        </main>
      </div>
    </>
  );
}

function DashboardView({ stats, syncInfo, syncing, onSync }) {
  return (
    <div className={styles.dashView}>
      <h1 className={styles.dashTitle}>DASHBOARD</h1>

      {/* Stats */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats?.total ?? '—'}</span>
          <span className={styles.statLabel}>TOTAL ARTICLES</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.statWZ}`}>{stats?.warzone ?? '—'}</span>
          <span className={styles.statLabel}>WARZONE</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.statCDL}`}>{stats?.cdl ?? '—'}</span>
          <span className={styles.statLabel}>CDL</span>
        </div>
      </div>

      {/* Scraper status */}
      <div className={styles.scraperBox}>
        <div className={styles.scraperHeader}>
          <h2 className={styles.scraperTitle}>SCRAPER</h2>
          <button
            className={styles.syncBtn}
            onClick={onSync}
            disabled={syncing}
          >
            {syncing ? 'SCRAPING...' : 'LANCER MAINTENANT'}
          </button>
        </div>
        {syncInfo && (
          <>
            <div className={styles.scraperRow}>
              <span className={styles.scraperKey}>Dernière synchro</span>
              <span className={styles.scraperVal}>
                {syncInfo.lastSyncAt ? formatDate(syncInfo.lastSyncAt) : 'Jamais'}
              </span>
            </div>
            <div className={styles.scraperRow}>
              <span className={styles.scraperKey}>Articles sauvés</span>
              <span className={styles.scraperVal}>{syncInfo.lastSyncCount ?? 0}</span>
            </div>
            {syncInfo.lastSyncErrors?.length > 0 && (
              <div className={styles.scraperErrors}>
                <span className={styles.scraperKey}>Erreurs :</span>
                {syncInfo.lastSyncErrors.map((e, i) => (
                  <p key={i} className={styles.scraperError}>{e}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ArticlesView() {
  const [page, setPage] = useState(1);
  const { articles, meta, loading, refetch } = useArticles({ page, limit: 15 });

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${id}`);
      refetch();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className={styles.articlesView}>
      <h1 className={styles.dashTitle}>ARTICLES</h1>
      {loading ? <p className={styles.loadingText}>Chargement...</p> : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Cat.</th>
              <th>Source</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id}>
                <td>
                  <Link to={`/article/${a.slug}`} className={styles.articleLink} target="_blank">
                    {a.title.substring(0, 70)}{a.title.length > 70 ? '…' : ''}
                  </Link>
                </td>
                <td>
                  <span className={`cat-tag cat-tag--${a.category}`}>{a.category}</span>
                </td>
                <td className={styles.sourceCell}>{a.sourceName || '—'}</td>
                <td className={styles.dateCell}>
                  {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(a.id)}
                    aria-label={`Supprimer : ${a.title}`}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {meta && meta.totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          <span>{page} / {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>→</button>
        </div>
      )}
    </div>
  );
}

function CreateArticleView({ onCreated }) {
  const [form, setForm] = useState({
    title: '', category: 'warzone', summary: '', content: '',
    imageUrl: '', sourceUrl: '', sourceName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/articles', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className={styles.createView}>
      <h1 className={styles.dashTitle}>NOUVEL ARTICLE</h1>
      <form onSubmit={handleSubmit} className={styles.createForm}>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>TITRE *</label>
          <input className={styles.formInput} value={form.title} onChange={set('title')} required />
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>CATÉGORIE *</label>
          <select className={styles.formInput} value={form.category} onChange={set('category')}>
            <option value="warzone">Warzone</option>
            <option value="cdl">CDL</option>
          </select>
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>RÉSUMÉ</label>
          <textarea className={styles.formInput} value={form.summary} onChange={set('summary')} rows={3} />
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>CONTENU</label>
          <textarea className={styles.formInput} value={form.content} onChange={set('content')} rows={8} />
        </div>
        <div className={styles.formRow2}>
          <div>
            <label className={styles.formLabel}>IMAGE URL</label>
            <input className={styles.formInput} value={form.imageUrl} onChange={set('imageUrl')} type="url" />
          </div>
          <div>
            <label className={styles.formLabel}>SOURCE NOM</label>
            <input className={styles.formInput} value={form.sourceName} onChange={set('sourceName')} />
          </div>
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>SOURCE URL</label>
          <input className={styles.formInput} value={form.sourceUrl} onChange={set('sourceUrl')} type="url" />
        </div>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <button type="submit" className={styles.createBtn} disabled={loading}>
          {loading ? 'CRÉATION...' : 'PUBLIER'}
        </button>
      </form>
    </div>
  );
}
