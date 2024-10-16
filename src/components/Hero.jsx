import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LevelButtons from '../components/LevelButton';

export default function Hero() {
  const [allSongs, setAllSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const { currentUser } = useAuth();
  const [likedSongIds, setLikedSongIds] = useState([]);
  const levelRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      const songsCollection = collection(db, 'songs');
      const songsSnapshot = await getDocs(songsCollection);
      const songsList = songsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllSongs(songsList);
      setPopularSongs(shuffleSongs(songsList, 10));
    };

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

    fetchSongs();
    fetchLikedSongs();
  }, [currentUser]);

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

  const shuffleSongs = (songs, count) => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleScrollToLevels = () => {
    if (levelRef.current) {
      const elementPosition = levelRef.current.getBoundingClientRect().top;
      window.scrollTo({
        top: window.pageYOffset + elementPosition - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col gap-10 items-center justify-center text-center max-w-[1000px] w-full mx-auto p-4 mb-20">
        <div className="flex flex-col gap-4">
          <p className="text-white text-sm">Tüm seviyelere uygun keman notalarıyla keman çalmaya hemen başla!</p>
          <h1 className="uppercase font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
            Rimedra<span className="text-yellow-200"> Violin</span>
          </h1>
        </div>

        <img src="https://i.pinimg.com/originals/f4/21/cd/f421cd140d55bd8ba698f1395a3772bf.gif" alt="Animasyon" className="w-full max-w-md" />

        <p className="text-md font-light text-white">
          Videolu eser eğitimleri, keman pratik çalışmalarıyla en kolay parçalardan en zor parçalara{' '}
          <span className="text-yellow-200 font-medium">kendi seviyene göre</span> birçok parça bulabilirsin.
          Yabancı, Türkçe ve Klasik birçok parçayla, keman çalmaya başla!
        </p>

        <button
          onClick={handleScrollToLevels}
          className="text-yellow-200 text-white px-8 py-4 rounded-md border-[2px] bg-transparent hover:bg-yellow-200 hover:text-orange-600 transition duration-300"
        >
          Hemen Başla
        </button>

        <div ref={levelRef} className="w-full bg-orange-100 p-4 max-w-[1000px] mx-auto rounded-md text-left overflow-hidden">
          <LevelButtons />
        </div>

        <div className="w-full max-w-4xl mt-12 overflow-x-auto">
          <h2 className="text-2xl font-bold text-yellow-200 mb-6">Rastgele Parçalar</h2>
          <table className="min-w-full bg-white text-black rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="py-3 px-4">Adı</th>
                <th className="py-3 px-4">Tür</th>
                <th className="py-3 px-4">Zorluk</th>
                <th className="py-3 px-4">Beğen</th>
              </tr>
            </thead>
            <tbody>
              {popularSongs.map((song) => (
                <tr key={song.id} className="hover:bg-orange-100">
                  <td className="py-3 px-4">
                    <Link to={`/levels/song/${song.id}`} className="text-orange-600 hover:underline">
                      {song.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{Array.isArray(song.tür) ? song.tür.join(', ') : song.tür}</td>
                  <td className="py-3 px-4">{song.level}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleLike(song.id)} className="text-red-500 focus:outline-none">
                      {likedSongIds.includes(song.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </React.Suspense>
  );
}
