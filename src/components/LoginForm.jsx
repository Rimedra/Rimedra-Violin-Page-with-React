// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginForm = ({ onClose }) => {
  const [loginValue, setLoginValue] = useState(''); // Kullanıcı adı veya e-posta durumu
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    let email = loginValue;

    try {
      // Eğer giriş değeri bir e-posta değilse, kullanıcı adı olarak kabul et ve Firestore'dan e-posta al
      if (!loginValue.includes('@')) {
        // Firestore'da `users` koleksiyonundan `username` ile eşleşen e-posta adresini bul
        const q = query(collection(db, 'users'), where('username', '==', loginValue));
        const userDocs = await getDocs(q);

        // Kullanıcı adı ile eşleşen belge bulunamadıysa hata ver
        if (userDocs.empty) {
          setError('Geçersiz kullanıcı adı veya şifre.');
          return;
        }

        // İlk belgeyi al ve e-posta adresini çek
        email = userDocs.docs[0].data().email;
      }

      // E-posta ve şifre ile kimlik doğrulama yap
      await setPersistence(auth, browserLocalPersistence); // Kalıcı oturum ayarı
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Modal'ı kapat
    } catch (err) {
      setError('Geçersiz kullanıcı adı veya şifre.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Giriş Yap</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Kullanıcı Adı veya Email Giriş */}
        <input
          type="text"
          placeholder="Kullanıcı Adı veya Email"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          required
          className=" text-black px-3 py-2 border rounded"
        />
        {/* Şifre Giriş */}
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className=" text-black px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-orange-500 text-white py-2 rounded">
          Giriş Yap
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
