import React from 'react'; // React'i ekleyin
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext'; // AuthProvider ile sarmalayın

// Dinamik yüklenen bileşenler
const Hero = React.lazy(() => import('./components/Hero'));
const Header = React.lazy(() => import('./components/Header'));
const LevelButtons = React.lazy(() => import('./components/LevelButton'));
const SongDetail = React.lazy(() => import('./components/SongDetail'));
const LevelsLayout = React.lazy(() => import('./components/LevelsLayout'));
const MyNotes = React.lazy(() => import('./components/MyNotes'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));

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

              {/* /levels rotası için Layout */}
              <Route path="/levels" element={<LevelsLayout />}>
                <Route path="song/:id" element={<SongDetail />} />
                <Route index element={<LevelButtons />} />
              </Route>
              
              {/* Direkt şarkı sayfası erişimi */}
              <Route path="/song/:id" element={<SongDetail />} />

              {/* MyNotes route */}
              <Route path="/mynotes" element={<MyNotes />} />

              {/* Admin route */}
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </React.Suspense>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
