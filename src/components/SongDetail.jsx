import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const SongDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [song, setSong] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [showMore, setShowMore] = useState(false); // Şarkı sözleri için state

  // Firestore'dan şarkı verisini çekme
  useEffect(() => {
    const fetchSong = async () => {
      const songDoc = await getDoc(doc(db, 'songs', id));
      if (songDoc.exists()) {
        setSong(songDoc.data());
      }
    };
    fetchSong();
  }, [id]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setLikedSongs(userDoc.data().likedSongs || []);
        }
      }
    };
    fetchLikedSongs();
  }, [currentUser]);

  const toggleLike = async () => {
    if (!currentUser) {
      alert('Şarkıyı beğenmek için üye olmanız gerekiyor.');
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);

    if (likedSongs.includes(id)) {
      await updateDoc(userDocRef, {
        likedSongs: arrayRemove(id),
      });
      setLikedSongs(likedSongs.filter((songId) => songId !== id));
    } else {
      await updateDoc(userDocRef, {
        likedSongs: arrayUnion(id),
      });
      setLikedSongs([...likedSongs, id]);
    }
  };

  if (!song) {
    return <div className="text-red-500">Şarkı bulunamadı.</div>;
  }

  const handlePhotoClick = (photo) => {
    setCurrentPhoto(photo);
    setIsZoomed(true);
  };

  const handleZoomClose = () => {
    setIsZoomed(false);
    setCurrentPhoto(null);
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg text-black">
      {/* Başlık ve Kalp Butonu */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-600">{song.title}</h2>
        <button onClick={toggleLike} className="text-red-500 focus:outline-none">
          {likedSongs.includes(id) ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
        </button>
      </div>

      <div className="mt-6">
        {/* Fotoğraf ve Video Alanı */}
        {song.photos && song.photos.length === 1 && song.video ? (
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <img
              src={song.photos[0]}
              alt="Nota Fotoğrafı"
              className="object-contain max-w-full max-h-[950px] cursor-pointer border border-gray-300 shadow-lg md:w-1/2 mx-auto"
              onClick={() => handlePhotoClick(song.photos[0])}
            />
            <iframe
              src={song.video}
              className="w-full h-auto aspect-video border border-gray-300 shadow-lg md:w-1/2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Eğitim Videosu"
            />
          </div>
        ) : song.photos && song.photos.length === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
            {song.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Nota ${index + 1}`}
                className="object-contain max-w-full max-h-[950px] cursor-pointer border border-gray-300 shadow-lg mx-auto"
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
          </div>
        ) : song.photos && song.photos.length === 3 && song.video ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
            {song.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Nota ${index + 1}`}
                className="object-contain max-w-full max-h-[950px] cursor-pointer border border-gray-300 shadow-lg mx-auto"
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
            <iframe
              src={song.video}
              className="w-full aspect-video border border-gray-300 shadow-lg md:col-span-2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Eğitim Videosu"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 items-center justify-center">
            {song.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Nota ${index + 1}`}
                className="cursor-pointer max-w-full max-h-[950px] mx-auto object-contain border border-gray-300 shadow-lg"
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
            {song.video && (
              <iframe
                src={song.video}
                className="col-span-full md:col-span-1 w-full aspect-video border border-gray-300 shadow-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Eğitim Videosu"
              />
            )}
          </div>
        )}
      </div>

      {/* Şarkı Sözleri ve İndirme Bağlantıları */}
      {song.lyrics && (
        <div className="mt-6 bg-orange-50 p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold text-orange-700">Şarkı Sözleri</h3>
          <p className="whitespace-pre-wrap">
            {/* Şarkı sözlerinin gösterilmesi */}
            {showMore
              ? song.lyrics // Tüm sözleri göster
              : song.lyrics
                  .split('\n') // Satırları bölme
                  .slice(0, 9) // İlk 9 satırı al
                  .join('\n')}
          </p>
          {/* Devamını göster butonu */}
          {song.lyrics.split('\n').length > 9 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="mt-2 text-blue-500 hover:underline focus:outline-none"
            >
              {showMore ? 'Daha Az Göster' : 'Devamını Göster'}
            </button>
          )}
        </div>
      )}

      {/* İndirme Linkleri */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold">Nota İndirme Bağlantıları:</h3>
        {song.photos.map((photo, index) => (
          <a
            key={index}
            href={photo}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-500 hover:underline"
          >
            Nota {index + 1}
          </a>
        ))}
      </div>

      {/* Zoom Ekranı */}
      {isZoomed && currentPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={handleZoomClose}>
          <img src={currentPhoto} alt="Zoomed Nota" className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain p-4" />
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={handleZoomClose}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default SongDetail;
