import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { addUserToFirestore } from '../utils/firestoreFunctions'; // Firestore fonksiyonlarını içe aktarın

const SignUpForm = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Firebase Authentication ile kullanıcı oluşturma
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Yeni kullanıcıyı Firestore'a ekleyin
      await addUserToFirestore(user.uid, username, email);

      onClose(); // Modal'ı kapat
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='text-black'>
      <h2 className="text-xl font-bold mb-4 text-black">Kayıt Ol</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-3 py-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-orange-500 text-white py-2 rounded">
          Kayıt Ol
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
