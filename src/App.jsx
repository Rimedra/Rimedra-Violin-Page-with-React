import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext'; // useAuth ile çekiyoruz

// Dinamik yüklenen bileşenler
const Hero = React.lazy(() => import('./components/Hero'));
const Header = React.lazy(() => import('./components/Header'));
const LevelButtons = React.lazy(() => import('./components/LevelButton'));
const SongDetail = React.lazy(() => import('./components/SongDetail'));
const LevelsLayout = React.lazy(() => import('./components/LevelsLayout'));
const MyNotes = React.lazy(() => import('./components/MyNotes'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));

// Admin sayfasına korumalı yönlendirme (Protected Route)
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />; // Admin değilse anasayfaya yönlendir
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <main className="min-h-screen flex flex-col bg-gradient-to-r from-orange-600 to-orange-800 text-white text-sm sm:text-base">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Header />
            <Routes>
              <Route path="/" element={<Hero />} />

              {/* Levels Layout */}
              <Route path="/levels" element={<LevelsLayout />}>
                <Route path="song/:id" element={<SongDetail />} />
                <Route index element={<LevelButtons />} />
              </Route>

              {/* Direkt şarkı sayfası */}
              <Route path="/song/:id" element={<SongDetail />} />

              {/* MyNotes route */}
              <Route path="/mynotes" element={<MyNotes />} />

              {/* Admin route - Korumalı yönlendirme */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </React.Suspense>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
