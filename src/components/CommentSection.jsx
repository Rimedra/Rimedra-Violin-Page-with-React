import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const CommentSection = () => {
  const { currentUser, username } = useAuth(); // Kullanıcı adı ve oturum bilgisi
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const { id } = useParams(); // Şarkı ID'si

  useEffect(() => {
    if (!id) return;

    const q = query(collection(db, 'songs', id, 'comments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentList);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddComment = async () => {
    if (!currentUser) {
      alert('Yorum yapabilmek için giriş yapmalısınız.');
      return;
    }

    if (comment.trim() === '') {
      alert('Lütfen bir yorum girin.');
      return;
    }

    try {
      await addDoc(collection(db, 'songs', id, 'comments'), {
        text: comment,
        author: username || 'Anonim', // Kullanıcı adı ya da 'Anonim'
        authorId: currentUser.uid,
        createdAt: new Date(),
      });
      setComment('');
    } catch (error) {
      console.error('Yorum eklenirken hata oluştu:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'songs', id, 'comments', commentId));
    } catch (error) {
      console.error('Yorum silinirken hata oluştu:', error);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-orange-600">Şarkı Hakkındaki Yorumlar</h3>

      {currentUser ? (
        <div className="mb-4 text-black">
          <textarea
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-orange-200"
          ></textarea>
          <button
            onClick={handleAddComment}
            className="bg-orange-500 text-white py-2 px-4 rounded mt-2 hover:bg-orange-600"
          >
            Yorum Yap
          </button>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">Yorum yapabilmek için giriş yapmalısınız.</p>
      )}

      <div className="space-y-4 mt-4">
        {comments.length > 0 ? (
          comments.map((cmt) => (
            <Comment
              key={cmt.id}
              comment={cmt}
              handleDeleteComment={handleDeleteComment}
              currentUser={currentUser}
              username={username}
              songId={id}
            />
          ))
        ) : (
          <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        )}
      </div>
    </div>
  );
};

const Comment = ({ comment, handleDeleteComment, currentUser, username, songId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [reply, setReply] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'songs', songId, 'comments', comment.id, 'replies'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReplies(repliesList);
    });

    return () => unsubscribe();
  }, [songId, comment.id]);

  const handleAddReply = async () => {
    if (!currentUser) {
      alert('Yanıt verebilmek için giriş yapmalısınız.');
      return;
    }

    if (reply.trim() === '') {
      alert('Yanıt boş olamaz.');
      return;
    }

    try {
      await addDoc(collection(db, 'songs', songId, 'comments', comment.id, 'replies'), {
        text: reply,
        author: username || 'Anonim', // Yanıtlarda da kullanıcı adı kullanımı
        createdAt: new Date(),
      });
      setReply('');
      setShowReplyBox(false);
    } catch (error) {
      console.error('Yanıt eklenirken hata oluştu:', error);
    }
  };

  const handleToggleShowReplies = () => setShowAllReplies((prev) => !prev);

  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-sm">
      <p className="font-semibold text-orange-500">{comment.author}</p>
      <p className="mt-1 text-black">{comment.text}</p>
      <p className="text-gray-500 text-sm">
        {comment.createdAt && new Date(comment.createdAt.seconds * 1000).toLocaleString('tr-TR')}
      </p>

      <div className="flex items-center space-x-4 mt-2">
        {currentUser && (currentUser.uid === comment.authorId || currentUser.isAdmin) && (
          <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:underline">
            Yorumu Sil
          </button>
        )}
        <button onClick={() => setShowReplyBox((prev) => !prev)} className="text-blue-500 hover:underline">
          {showReplyBox ? 'Yanıtı Gizle' : 'Yanıtla'}
        </button>
      </div>

      {showReplyBox && (
        <div className="mb-4 text-black">
          <textarea
            rows="2"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Yanıtınızı yazın..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-orange-200"
          ></textarea>
          <button
            onClick={handleAddReply}
            className="bg-orange-500 text-white py-1 px-2 rounded mt-2 hover:bg-orange-600"
          >
            Yanıtla
          </button>
        </div>
      )}

      <div className="ml-4 mt-2">
        {visibleReplies.map((rep) => (
          <div key={rep.id} className="p-2 border-l-2 border-gray-300 mt-2">
            <p className="font-semibold text-orange-500">{rep.author}</p>
            <p className="mt-1 text-black">{rep.text}</p>
            <p className="text-gray-500 text-sm">
              {rep.createdAt && new Date(rep.createdAt.seconds * 1000).toLocaleString('tr-TR')}
            </p>
          </div>
        ))}
        {replies.length > 2 && (
          <button onClick={handleToggleShowReplies} className="text-blue-500 hover:underline mt-2">
            {showAllReplies ? 'Yanıtları Gizle' : `Yanıtları Göster (+${replies.length - 2})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
