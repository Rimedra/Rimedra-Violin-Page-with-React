// src/utils/firestoreFunctions.js
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore yapılandırma dosyasını içe aktar

// Kullanıcıyı Firestore'a eklemek için yardımcı fonksiyon
export const addUserToFirestore = async (userId, username, email) => {
  try {
    await setDoc(doc(db, "users", userId), {
      username,
      email,
      likedSongs: [] // Beğenilen şarkılar için başlangıç değeri
    });
    console.log("Kullanıcı başarıyla Firestore veritabanına eklendi!");
  } catch (error) {
    console.error("Kullanıcı eklenirken hata oluştu:", error);
    throw error;
  }
};

// Firestore'a yeni bir şarkı eklemek için fonksiyon
export const addSongToFirestore = async (songData) => {
  try {
    await addDoc(collection(db, 'songs'), songData);
    console.log('Şarkı başarıyla eklendi:', songData);
  } catch (error) {
    console.error('Şarkı eklenirken hata oluştu:', error);
    throw error;
  }
};
