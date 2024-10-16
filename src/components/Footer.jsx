// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-orange-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
         

          {/* Social Media Icons */}
          <div className="flex gap-6 text-2xl mx-auto">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
              <FaTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
              <FaYoutube />
            </a>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="text-center mt-4 text-sm">
          <p>© 2024 Rimedra Violin. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
