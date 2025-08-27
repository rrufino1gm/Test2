
import React, { useState, useEffect } from 'react';

interface GoogleDriveModalProps {
  currentPath: string;
  onClose: () => void;
  onSave: (path: string) => void;
}

const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);


const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ currentPath, onClose, onSave }) => {
    const [path, setPath] = useState(currentPath);

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

    const handleSave = () => {
        if (path.trim()) {
            onSave(path.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drive-modal-title"
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 id="drive-modal-title" className="text-xl font-bold text-slate-800 mb-2">Conectar com Google Drive</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Indique o caminho da pasta no seu Google Drive onde as fotos da obra serão armazenadas. 
                        Ex: <code>Minha Obra/Relatórios Fotográficos</code>
                    </p>
                    
                    <div>
                        <label htmlFor="drive-path" className="block text-sm font-medium text-slate-700 mb-1">Caminho da Pasta</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FolderIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                id="drive-path"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                placeholder="ex: Projeto Casa/Fotos"
                                className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-3">
                     <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Salvar Caminho
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default GoogleDriveModal;
