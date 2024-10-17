import React, { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Modal from './Modal'; // Şifre sıfırlama için modal

const LoginForm = ({ onClose }) => {
  const [loginValue, setLoginValue] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false); // Şifre sıfırlama modal durumu

  const handleSubmit = async (e) => {
    e.preventDefault();
    let email = loginValue;

    try {
      if (!loginValue.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', loginValue));
        const userDocs = await getDocs(q);

        if (userDocs.empty) {
          setError('Geçersiz kullanıcı adı veya şifre.');
          return;
        }
        email = userDocs.docs[0].data().email;
      }

      await setPersistence(auth, browserLocalPersistence); 
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError('Geçersiz kullanıcı adı veya şifre.');
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      setIsResetOpen(false);
    } catch (error) {
      setError('Geçerli bir e-posta girin.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Giriş Yap</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Kullanıcı Adı veya Email"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          required
          className="text-black px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="text-black px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-orange-500 text-white py-2 rounded">
          Giriş Yap
        </button>
      </form>

      {/* Şifremi Unuttum Linki */}
      <p className="text-blue-500 cursor-pointer mt-2" onClick={() => setIsResetOpen(true)}>
        Şifremi Unuttum
      </p>

      {/* Şifre Sıfırlama Modal */}
      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)}>
        <PasswordResetForm onReset={handlePasswordReset} />
      </Modal>
    </div>
  );
};

const PasswordResetForm = ({ onReset }) => {
  const [resetEmail, setResetEmail] = useState('');

  const handleResetSubmit = (e) => {
    e.preventDefault();
    onReset(resetEmail);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Şifre Sıfırlama</h2>
      <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email adresinizi girin"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
          className="text-black px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-orange-500 text-white py-2 rounded">
          Sıfırlama Bağlantısını Gönder
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
