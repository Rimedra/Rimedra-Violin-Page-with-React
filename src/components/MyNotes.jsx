import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const MyNotes = () => {
  const { currentUser } = useAuth();
  const [likedSongIds, setLikedSongIds] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);

    // Listen for changes in the user's likedSongs array
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikedSongIds(data.likedSongs || []);
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  // Fetch full song details for liked songs
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (likedSongIds.length > 0) {
        const songsCollection = collection(db, 'songs');
        const songsSnapshot = await getDocs(songsCollection);
        const songsList = songsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((song) => likedSongIds.includes(song.id));
        setLikedSongs(songsList);
      } else {
        setLikedSongs([]);
      }
    };

    fetchLikedSongs();
  }, [likedSongIds]);

  // Remove song from favorites
  const removeFromFavorites = async (songId) => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        likedSongs: arrayRemove(songId),
      });
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center text-center max-w-[1000px] w-full mx-auto p-4 mb-20">
      <h1 className="text-3xl font-bold text-yellow-200 mb-6">Notalarım</h1>
      {likedSongs.length === 0 ? (
        <p className="text-white">Henüz bir şarkı beğenmediniz.</p>
      ) : (
        <table className="min-w-full bg-white text-black rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="py-3 px-4">Adı</th>
              <th className="py-3 px-4">Tür</th>
              <th className="py-3 px-4">Zorluk</th>
              <th className="py-3 px-4">Kaldır</th>
            </tr>
          </thead>
          <tbody>
            {likedSongs.map((song) => (
              <tr key={song.id} className="hover:bg-orange-100 cursor-pointer">
                <td className="py-3 px-4">
                  <Link to={`/levels/song/${song.id}`} className="text-orange-600 hover:underline">
                    {song.title}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  {/* Türleri virgülle ayırarak gösterme */}
                  {Array.isArray(song.tür) ? song.tür.join(', ') : song.tür}
                </td>
                <td className="py-3 px-4">{song.level}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => removeFromFavorites(song.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Kaldır
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyNotes;
