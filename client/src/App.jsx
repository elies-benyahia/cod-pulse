import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false, retry: 2 } },
});

const Home           = lazy(() => import('./pages/Home'));
const Warzone        = lazy(() => import('./pages/Warzone'));
const CDL            = lazy(() => import('./pages/CDL'));
const Article        = lazy(() => import('./pages/Article'));
const Teams          = lazy(() => import('./pages/Teams'));
const TeamDetail     = lazy(() => import('./pages/TeamDetail'));
const PlayerDetail   = lazy(() => import('./pages/PlayerDetail'));
const Quiz           = lazy(() => import('./pages/Quiz'));
const WorldMap       = lazy(() => import('./pages/WorldMap'));
const MetaWeapons    = lazy(() => import('./pages/MetaWeapons'));
const Live           = lazy(() => import('./pages/Live'));
const Ranked         = lazy(() => import('./pages/Ranked'));
const AdminLogin     = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: isAdmin ? '100vh' : undefined }}
        >
          <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>...</div>}>
            <Routes location={location}>
              <Route path="/"                  element={<Home />} />
              <Route path="/warzone"           element={<Warzone />} />
              <Route path="/cdl"               element={<CDL />} />
              <Route path="/article/:slug"     element={<Article />} />
              <Route path="/teams"             element={<Teams />} />
              <Route path="/teams/:slug"       element={<TeamDetail />} />
              <Route path="/players/:playerId" element={<PlayerDetail />} />
              <Route path="/quiz"              element={<Quiz />} />
              <Route path="/map"               element={<WorldMap />} />
              <Route path="/meta"              element={<MetaWeapons />} />
              <Route path="/live"              element={<Live />} />
              <Route path="/ranked"            element={<Ranked />} />
              <Route path="/admin/login"       element={!loading && user ? <Navigate to="/admin" replace /> : <AdminLogin />} />
              <Route path="/admin"             element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*"                  element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {!isAdmin && <Footer />}
    </>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const handleDone = useCallback(() => setReady(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {!ready && <LoadingScreen onDone={handleDone} />}
              {ready && <AppRoutes />}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0A0A0A', color: '#F2F0EB', border: '1px solid rgba(212,175,55,0.4)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' } }} />
    </QueryClientProvider>
  );
}
