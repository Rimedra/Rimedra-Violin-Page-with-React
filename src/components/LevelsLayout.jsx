// src/components/LevelsLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import LevelButtons from './LevelButton';
import CommentSection from './CommentSection';

const LevelsLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/*  Şarkı Detayları (Üstte) */}
      <div className="w-full p-4">
        <Outlet />
      </div>

      {/*  LevelButtons (Orta) */}
      <div className="w-full bg-orange-100 p-4 max-w-[1000px] items-center justify-center mx-auto rounded-md overflow-hidden">
        <LevelButtons />
      </div>

      {/* Yorumlar Bölümü: En Altta */}
      <div className="w-full bg-orange-50 p-4 mt-8 max-w-[1000px] items-center justify-center mx-auto rounded-md overflow-hidden">
        <CommentSection />
      </div>
    </div>
  );
};

export default LevelsLayout;
