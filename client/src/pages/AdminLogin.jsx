import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MetaTags from '../components/MetaTags';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags title="Admin — Connexion" description="" />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>ADMIN</h1>
            <p className={styles.sub}>Accès restreint — authentification requise</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>EMAIL</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
                required
                aria-required="true"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>MOT DE PASSE</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                autoComplete="current-password"
                required
                aria-required="true"
              />
            </div>

            {error && (
              <p id="login-error" className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
