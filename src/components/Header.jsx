import React, { useState, useEffect } from 'react';
import { FaUser, FaHeart, FaBars, FaMusic } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animateScroll as scroll } from 'react-scroll';


import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Modal = React.lazy(() => import('./Modal'));
import LoginForm from './LoginForm';  
import SignUpForm from './SignUpForm'; 

const Header = () => {
  const [y, setY] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isNoteAlertVisible, setIsNoteAlertVisible] = useState(false); // Notalarım uyarısı için durum
  const [isSearchAlertVisible, setIsSearchAlertVisible] = useState(false);


  const navigate = useNavigate();
  const { currentUser, username, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      const querySnapshot = await getDocs(collection(db, 'songs'));
      const songsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuggestions(songsList);
    };
    fetchSongs();
  }, []);

  const filteredSuggestions = suggestions.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Eğer arama alanı boşsa yönlendirme yapma
    if (!searchTerm.trim()) return;
  
    if (filteredSuggestions.length > 0) {
      navigate(`/levels/song/${filteredSuggestions[highlightedIndex >= 0 ? highlightedIndex : 0].id}`);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } else {
      alert('Aradığınız şarkı bulunamadı!');
    }
  };
  
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        navigate(`/levels/song/${filteredSuggestions[highlightedIndex].id}`);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    }
  };

  const handleMyNotesClick = () => {
    if (currentUser) {
      navigate('/mynotes');
    } else {
      // Kullanıcı üye değilse uyarı mesajını göster
      setIsNoteAlertVisible(true);
      setTimeout(() => setIsNoteAlertVisible(false), 2000); // 2 saniye sonra uyarıyı gizle
    }
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsWarningOpen(false);
  };

  const handleSignUpClick = () => {
    setIsSignUpOpen(true);
    setIsWarningOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (requestMessage.trim()) {
      const emailBody = encodeURIComponent(`Şarkı İsteği: ${requestMessage}`);
      window.open(`mailto:tunahan-demir36@hotmail.com?subject=Nota İsteği&body=${emailBody}`);
      setIsRequestOpen(false);
      setRequestMessage('');
      setIsRequestSent(true);
      setTimeout(() => setIsRequestSent(false), 2000);
    }
  };

  return (
    <>
      <header
        className={`sticky z-[10] top-0 duration-200 px-6 flex items-center justify-between border-b border-solid ${
          y > 0 ? 'py-4 bg-orange-600 border-orange-700' : 'py-6 bg-transparent border-transparent'
        }`}
      >
        {/* Başlık ve Logo */}
        <h1 className="font-medium flex items-center">
        <Link to="/" className="flex items-center" onClick={() => scroll.scrollToTop({ smooth: true, duration: 500 })}>
        <b className="font-bold poppins">Rimedra</b> Violin
          <img
            src="https://virtualpiano.net/wp-content/uploads/2020/08/Virtual-Violin-Virtual-Piano.png"
            alt="Violin Icon"
           className="ml-2 w-6 h-6 hidden sm:block"
          />
        </Link>


          {/* Nota İstek Butonu (Sadece md ve üstü ekranlarda görünür) */}
          <button
            onClick={() => setIsRequestOpen(true)}
            className="text-black hidden md:flex text-white hover:text-orange-400 items-center ml-4"
          >
            <FaMusic className="mr-1" />
            Nota İstek
          </button>
        </h1>

        {/* Arama Alanı */}
        <div className="relative flex-grow mx-4">
          <form onSubmit={handleSearchSubmit} className="relative flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Şarkı ara..."
              className="w-full px-4 py-2 rounded-md focus:outline-none text-black"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-md">
              Ara
            </button>

            {searchTerm && (
              <ul className="absolute top-12 left-0 w-full bg-white text-black rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                {filteredSuggestions.length === 0 ? (
                  <li className="px-4 py-2 text-gray-500">Şarkı bulunamadı.</li>
                ) : (
                  filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      onClick={() => {
                        navigate(`/levels/song/${suggestion.id}`);
                        setSearchTerm('');
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-orange-200 ${
                        index === highlightedIndex ? 'bg-orange-200' : ''
                      }`}
                    >
                      {suggestion.title}
                    </li>
                  ))
                )}
              </ul>
            )}
          </form>
        </div>

        {/* Sağ Menü */}
        <div className="flex ml-auto items-center gap-4 pr-4">
          {/* Mobile Dropdown Menü Butonu */}
          <button onClick={toggleDropdown} className="text-white hover:text-orange-400 md:hidden">
            <FaBars size={24} />
          </button>

          {/* Mobile Dropdown Menü */}
          {isDropdownOpen && (
            <div className="absolute top-16 right-4 bg-white text-black rounded shadow-lg p-4 z-20 flex flex-col items-start md:hidden">
              <button onClick={handleMyNotesClick} className="hover:bg-gray-200 w-full text-left p-2 rounded">
                <FaHeart className="inline mr-2" /> Notalarım
              </button>
              {isAdmin && (
                <Link to="/admin" className="hover:bg-gray-200 w-full text-left p-2 rounded">
                  Admin Panel
                </Link>
              )}
              <button onClick={() => setIsRequestOpen(true)} className="hover:bg-gray-200 w-full text-left p-2 rounded">
                <FaMusic className="inline mr-2" /> Nota İstek
              </button>
              {!currentUser ? (
                <>
                  <button onClick={handleLoginClick} className="hover:bg-gray-200 w-full text-left p-2 rounded">
                    <FaUser className="inline mr-2" /> Giriş Yap
                  </button>
                  <button onClick={handleSignUpClick} className="hover:bg-gray-200 w-full text-left p-2 rounded">
                    Kayıt Ol
                  </button>
                </>
              ) : (
                <button onClick={logout} className="hover:bg-red-200 w-full text-left p-2 rounded">
                  Çıkış Yap
                </button>
              )}
            </div>
          )}

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={handleMyNotesClick} className="flex items-center text-white hover:text-orange-400">
              <FaHeart size={24} />
              <p className="ml-1">Notalarım</p>
            </button>
            {isAdmin && (
              <Link to="/admin" className="text-white hover:text-orange-400">
                Admin Panel
              </Link>
            )}
            {!currentUser ? (
              <>
                <button onClick={handleLoginClick} className="duration-200 hover:text-orange-400 flex items-center">
                  <FaUser size={24} />
                  <p className="ml-1 ">Giriş Yap</p>
                </button>
                <button
  onClick={handleSignUpClick}
  className="yellowShadow group"
>
  <h4 className="relative z-10">Kayıt Ol</h4>
</button>

              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-white">Hoşgeldin, {username || currentUser.email}</span>
                <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded">
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <LoginForm onClose={() => setIsLoginOpen(false)} />
      </Modal>

      <Modal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)}>
        <SignUpForm onClose={() => setIsSignUpOpen(false)} />
      </Modal>

      <Modal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-black">Şarkı İsteği</h2>
          <form onSubmit={handleRequestSubmit}>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="İstediğiniz şarkıyı buraya yazın..."
              className="w-full h-32 p-2 border rounded focus:outline-none text-black"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded">
                Gönder
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {isRequestSent && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-lg z-50">
          İstek gönderildi!
        </div>
      )}

      {/* Notalarım Uyarı Mesajı */}
      {isNoteAlertVisible && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white py-2 px-4 rounded shadow-lg z-50">
          Notalarımı kullanmak için üye olmanız gerekmektedir!
        </div>
      )}
    </>
  );
};

export default Header;
