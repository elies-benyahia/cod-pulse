import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDateRelative } from '../utils/format';
import styles from './ArticleCard.module.css';

const ArticleCard = memo(function ArticleCard({ article, variant = 'default' }) {
  return (
    <article className={`${styles.card} ${styles[`card--${variant}`]}`}>
      <Link to={`/article/${article.slug}`} className={styles.link}>
        {article.imageUrl && (
          <div className={styles.imageWrap} aria-hidden="true">
            <img
              src={article.imageUrl}
              alt={article.title}
              className={styles.image}
              loading="lazy"
            />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={`cat-tag cat-tag--${article.category}`}>
              {article.category === 'warzone' ? 'WARZONE' : 'CDL'}
            </span>
            <time
              dateTime={article.publishedAt}
              className="date-label"
            >
              {formatDateRelative(article.publishedAt)}
            </time>
          </div>
          <h2 className={styles.title}>{article.title}</h2>
          {article.summary && (
            <p className={styles.summary}>{article.summary}</p>
          )}
          {article.sourceName && (
            <span className={styles.source}>— {article.sourceName}</span>
          )}
        </div>
      </Link>
    </article>
  );
});

export default ArticleCard;
