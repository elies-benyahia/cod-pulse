import { useParams, Link } from 'react-router-dom';
import { useArticle, useArticles } from '../hooks/api';
import MetaTags from '../components/MetaTags';
import ArticleCard from '../components/ArticleCard';
import { formatDate } from '../utils/format';
import styles from './Article.module.css';

export default function Article() {
  const { slug } = useParams();
  const { article, loading, error } = useArticle(slug);
  const { articles: related } = useArticles({
    category: article?.category,
    limit: 3
  });

  if (loading) return <ArticleSkeleton />;

  if (error === '404') {
    return (
      <main className={styles.notFound}>
        <div className="container">
          <h1 className={styles.notFoundCode}>404</h1>
          <p className={styles.notFoundMsg}>Article introuvable.</p>
          <Link to="/" className={styles.backLink}>← Retour à l'accueil</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.notFound}>
        <div className="container">
          <p>Erreur de chargement.</p>
          <Link to="/" className={styles.backLink}>← Retour</Link>
        </div>
      </main>
    );
  }

  if (!article) return null;

  const filteredRelated = related.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <>
      <MetaTags
        title={article.title}
        description={article.summary}
        image={article.imageUrl}
      />

      <main>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
          <div className="container">
            <Link to="/">Accueil</Link>
            <span aria-hidden="true"> / </span>
            <Link to={`/${article.category}`}>
              {article.category === 'warzone' ? 'Warzone' : 'CDL'}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{article.title.substring(0, 50)}…</span>
          </div>
        </nav>

        <article className={styles.article}>
          {/* Header */}
          <header className={styles.header}>
            <div className="container">
              <div className={styles.headerMeta}>
                <span className={`cat-tag cat-tag--${article.category}`}>
                  {article.category === 'warzone' ? 'WARZONE' : 'CDL'}
                </span>
                {article.publishedAt && (
                  <time dateTime={article.publishedAt} className="date-label">
                    {formatDate(article.publishedAt)}
                  </time>
                )}
                {article.sourceName && (
                  <span className={styles.source}>
                    Source :{' '}
                    {article.sourceUrl ? (
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        {article.sourceName}
                      </a>
                    ) : article.sourceName}
                  </span>
                )}
              </div>
              <h1 className={styles.title}>{article.title}</h1>
              {article.summary && (
                <p className={styles.summary}>{article.summary}</p>
              )}
            </div>
          </header>

          {/* Image */}
          {article.imageUrl && (
            <div className={styles.imageWrap}>
              <img
                src={article.imageUrl}
                alt={article.title}
                className={styles.image}
              />
            </div>
          )}

          {/* Corps */}
          {article.content && (
            <div className={styles.body}>
              <div className="container">
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          )}
        </article>

        {/* À lire aussi */}
        {filteredRelated.length > 0 && (
          <section className={styles.related} aria-label="À lire aussi">
            <div className="container">
              <h2 className={styles.relatedTitle}>À LIRE AUSSI</h2>
              <div className={styles.relatedList}>
                {filteredRelated.map(a => (
                  <ArticleCard key={a.id} article={a} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <main>
      <div className="container">
        <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: 80, height: 20, background: 'var(--gray-800)' }} />
          <div style={{ width: '70%', height: 60, background: 'var(--gray-800)' }} />
          <div style={{ width: '90%', height: 300, background: 'var(--gray-800)', marginTop: '1rem' }} />
        </div>
      </div>
    </main>
  );
}
