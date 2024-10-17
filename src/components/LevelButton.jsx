import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const LevelButtons = () => {
  const [level, setLevel] = useState('Baslangic'); // Default level
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;
  const { currentUser } = useAuth();
  const [likedSongIds, setLikedSongIds] = useState([]);
  const [allSongs, setAllSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const songsCollection = collection(db, 'songs');
      const songsSnapshot = await getDocs(songsCollection);
      const songsList = songsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllSongs(songsList);
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setLikedSongIds(userDoc.data().likedSongs || []);
        }
      } else {
        setLikedSongIds([]);
      }
    };
    fetchLikedSongs();
  }, [currentUser]);

  const handleButtonClick = (selectedLevel) => {
    setLevel(selectedLevel);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredSongs = allSongs.filter((song) => song.level === level);
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const indexOfLastSong = currentPage * itemsPerPage;
  const indexOfFirstSong = indexOfLastSong - itemsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);

  const toggleLike = async (songId) => {
    if (!currentUser) {
      alert('Şarkıyı beğenmek için üye olmanız gerekiyor.');
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);

    if (likedSongIds.includes(songId)) {
      await updateDoc(userDocRef, {
        likedSongs: arrayRemove(songId),
      });
      setLikedSongIds(likedSongIds.filter((id) => id !== songId));
    } else {
      await updateDoc(userDocRef, {
        likedSongs: arrayUnion(songId),
      });
      setLikedSongIds([...likedSongIds, songId]);
    }
  };

  return (
    <div className="flex flex-col items-center rounded-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-6 mt-4">
  {['Baslangic', 'Kolay', 'Normal', 'Zor'].map((lvl) => (
    <button
      key={lvl}
      className={`levelButton ${
        level === lvl ? 'opacity-75 ring ring-yellow-300' : ''
      }`}
      onClick={() => handleButtonClick(lvl)}
    >
      {lvl}
    </button>
  ))}
</div>




      {level && (
        <div className="mt-8 w-full max-w-3xl">
          <h2 className="text-xl font-bold text-orange-600 mb-4">{level} Seviye Parçalar:</h2>
          <ul className="divide-y divide-orange-300">
            {currentSongs.map((item) => (
              <li key={item.id} className="py-2 hover:bg-orange-100 flex justify-between items-center">
                <Link to={`/levels/song/${item.id}`} className="text-orange-600 hover:underline">
                  <strong>{item.title}</strong> - {Array.isArray(item.tür) ? item.tür.join(', ') : item.tür}, Zorluk: {item.level}
                </Link>
                <button onClick={() => toggleLike(item.id)} className="text-red-500 focus:outline-none">
                  {likedSongIds.includes(item.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col md:flex-row items-center justify-between mt-4">
            <div className="flex space-x-2 mb-2 md:mb-0">
              <button
                onClick={handlePrevPage}
                className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={currentPage === 1}
              >
                Önceki
              </button>
              <button
                onClick={handleNextPage}
                className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ${
                  indexOfLastSong >= filteredSongs.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={indexOfLastSong >= filteredSongs.length}
              >
                Sonraki
              </button>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageClick(number)}
                  className={`py-2 px-4 rounded ${
                    currentPage === number ? 'bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-700 text-white'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelButtons;
