
import React, { useEffect, useState } from 'react';
import { Photo } from '../types';

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onCommentChange: (photoId: string, comment: string) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onCommentChange }) => {
  const [comment, setComment] = useState(photo.comment);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    onCommentChange(photo.id, e.target.value);
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <img src={photo.url} alt="Visualização ampliada" className="object-contain w-full h-auto max-h-[75vh]" />
        <div className="p-4 bg-slate-50 border-t">
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">Comentários do Construtor:</label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Adicione um comentário sobre esta foto..."
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-2 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Fechar modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PhotoModal;
