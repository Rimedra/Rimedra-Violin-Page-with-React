import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaInfoCircle } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const AdminPage = () => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [tür, setTür] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [genres, setGenres] = useState([]);
  const [photos, setPhotos] = useState(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [level, setLevel] = useState('Baslangic');
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSongId, setEditingSongId] = useState(null);
  const [isGenreInfoVisible, setIsGenreInfoVisible] = useState(false);

  const genreSuggestions = [
    'Yöresel Türküler', 'Pop', 'Rock', 'Folk', 'Balkan Müziği',
    'Jazz', 'Soundtrack', 'Film Müziği', 'Anime Müzikleri'
  ];

  // Tür ekleme fonksiyonu
  const addGenre = () => {
    if (tür.trim() && !genres.includes(tür.trim())) {
      setGenres([...genres, tür.trim()]);
      setTür('');
    }
  };

  // Enter tuşuna basıldığında tür ekleme
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGenre();
    }
  };

  // Türü kaldırma fonksiyonu
  const removeGenre = (index) => {
    setGenres(genres.filter((_, i) => i !== index));
  };

  // Fotoğraf URL ekleme fonksiyonu
  const addPhotoField = () => {
    setPhotos([...photos, '']);
  };

  const handlePhotoChange = (index, value) => {
    const updatedPhotos = photos.map((photo, i) => (i === index ? value : photo));
    setPhotos(updatedPhotos);
  };

  const removePhotoField = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  // Şarkı ekleme fonksiyonu
  const handleAddSong = async (e) => {
    e.preventDefault();
    if (currentUser) {
      try {
        await addDoc(collection(db, 'songs'), {
          title,
          tür: genres,
          lyrics: lyrics || null,
          photos: photos.filter((url) => url.trim() !== ''),
          video: videoUrl ? videoUrl : null,
          level,
        });
        alert('Şarkı başarıyla eklendi!');
        resetForm();
        fetchSongs();
      } catch (error) {
        console.error('Şarkı eklenirken hata oluştu:', error);
        alert('Şarkı eklenirken bir hata oluştu!');
      }
    }
  };

  // Şarkı düzenleme fonksiyonu
  const handleEditSong = async (e) => {
    e.preventDefault();
    if (currentUser && editingSongId) {
      try {
        await updateDoc(doc(db, 'songs', editingSongId), {
          title,
          tür: genres,
          lyrics: lyrics || null,
          photos: photos.filter((url) => url.trim() !== ''),
          video: videoUrl ? videoUrl : null,
          level,
        });
        alert('Şarkı başarıyla güncellendi!');
        resetForm();
        setIsEditing(false);
        setEditingSongId(null);
        fetchSongs();
      } catch (error) {
        console.error('Şarkı düzenlenirken hata oluştu:', error);
        alert('Şarkı düzenlenirken bir hata oluştu!');
      }
    }
  };

  // Şarkı silme fonksiyonu
  const handleDeleteSong = async (id) => {
    try {
      await deleteDoc(doc(db, 'songs', id));
      alert('Şarkı başarıyla silindi!');
      fetchSongs();
    } catch (error) {
      console.error('Şarkı silinirken hata oluştu:', error);
      alert('Şarkı silinirken bir hata oluştu!');
    }
  };

  const resetForm = () => {
    setTitle('');
    setLyrics('');
    setGenres([]);
    setPhotos(['']);
    setVideoUrl('');
    setLevel('Baslangic');
  };

  const handleEditClick = (song) => {
    setTitle(song.title);
    setGenres(Array.isArray(song.tür) ? song.tür : []);
    setLyrics(song.lyrics || '');
    setPhotos(song.photos || ['']);
    setVideoUrl(song.video || '');
    setLevel(song.level || 'Baslangic');
    setIsEditing(true);
    setEditingSongId(song.id);
  };

  const fetchSongs = async () => {
    const querySnapshot = await getDocs(collection(db, 'songs'));
    const songsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSongs(songsList);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white text-black rounded-md max-w-lg mx-auto mt-12 w-full">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Şarkı Düzenleme Paneli' : 'Şarkı Ekleme Paneli'}
      </h2>
      <form onSubmit={isEditing ? handleEditSong : handleAddSong} className="flex flex-col gap-4">
        {/* Şarkı Başlığı */}
        <input
          type="text"
          placeholder="Şarkı Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-3 py-2 border rounded"
        />

        {/* Seviye Seçimi */}
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 border rounded">
          <option value="Baslangic">Başlangıç</option>
          <option value="Kolay">Kolay</option>
          <option value="Normal">Normal</option>
          <option value="Zor">Zor</option>
        </select>

        {/* Şarkı Sözleri (Opsiyonel) */}
        <textarea
          placeholder="Şarkı Sözleri (Opsiyonel)"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="px-3 py-2 border rounded"
        ></textarea>

        {/* Tür Seçimi */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tür (Örnek: Pop, Rock)"
              value={tür}
              onChange={(e) => setTür(e.target.value)}
              onKeyDown={handleKeyPress}
              className="px-3 py-2 border rounded flex-grow"
            />
            <button type="button" onClick={addGenre} className="px-3 py-2 bg-blue-500 text-white rounded">
              Ekle
            </button>
            <FaInfoCircle
              onClick={() => setIsGenreInfoVisible(!isGenreInfoVisible)}
              className="text-blue-500 cursor-pointer"
            />
          </div>

          {/* Örnek Türler ve Eklenen Türler */}
          {isGenreInfoVisible && (
            <div className="absolute top-12 right-0 bg-gray-200 text-black p-4 rounded-lg shadow-md w-60 z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Örnek Türler</span>
                <AiOutlineClose onClick={() => setIsGenreInfoVisible(false)} className="cursor-pointer" />
              </div>
              <ul>
                {genreSuggestions.map((genre, index) => (
                  <li key={index} className="text-sm py-1">
                    {genre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eklenen Türler */}
          <div className="flex flex-wrap gap-2 mt-2">
            {genres.map((genre, index) => (
              <span key={index} className="bg-orange-100 text-orange-600 py-1 px-2 rounded-full flex items-center">
                {genre}
                <AiOutlineClose className="ml-2 cursor-pointer" onClick={() => removeGenre(index)} />
              </span>
            ))}
          </div>
        </div>

        {/* Fotoğraf ve Video URL'leri */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="font-semibold">Fotoğraf URL'leri:</label>
          {photos.map((photo, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                placeholder={`Fotoğraf URL'si ${index + 1}`}
                value={photo}
                onChange={(e) => handlePhotoChange(index, e.target.value)}
                required
                className="px-3 py-2 border rounded flex-grow"
              />
              {index > 0 && (
                <button type="button" onClick={() => removePhotoField(index)} className="bg-red-500 text-white px-2 py-1 rounded">X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPhotoField} className="bg-blue-500 text-white py-2 px-4 rounded">+ Fotoğraf Ekle</button>
        </div>

        <input
          type="url"
          placeholder="Video URL'si (Opsiyonel)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="px-3 py-2 border rounded"
        />

        <button type="submit" className="bg-orange-500 text-white py-2 rounded">
          {isEditing ? 'Şarkıyı Güncelle' : 'Şarkıyı Ekle'}
        </button>
      </form>

      {/* Şarkı Listesi ve Silme/Düzenleme Butonları */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Şarkı Listesi</h3>
        <input
          type="text"
          placeholder="Şarkı Ara"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-full mb-4"
        />
        <ul className="max-h-64 overflow-y-auto">
          {filteredSongs.map((song) => (
            <li key={song.id} className="flex justify-between items-center py-2 border-b">
              <span>{song.title}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditClick(song)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Düzenle
                </button>
                <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;
