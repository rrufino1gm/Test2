
import React, { useState, useEffect } from 'react';

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const CORRECT_PIN = '4321';

interface PinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ onClose, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

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

    const handleVerify = () => {
        if (pin === CORRECT_PIN) {
            onSuccess();
        } else {
            setError('PIN incorreto. Tente novamente.');
            setPin(''); // Clear input on error
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and max 4 digits
        if (/^\d*$/.test(value) && value.length <= 4) {
            setPin(value);
            setError('');
        }
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-modal-title"
        >
            <div 
                className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-block bg-slate-100 p-3 rounded-full mb-3">
                           <LockIcon className="w-8 h-8 text-slate-500" />
                        </div>
                        <h2 id="pin-modal-title" className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
                        <p className="text-sm text-slate-500">Insira o PIN para ver a aba Financeiro.</p>
                    </div>
                    
                    <div>
                        <label htmlFor="pin-input" className="sr-only">PIN</label>
                        <input
                            type="password" // Use password type to obscure PIN
                            id="pin-input"
                            value={pin}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            placeholder="••••"
                            maxLength={4}
                            className={`w-full p-3 text-center text-2xl tracking-[1em] border rounded-md focus:ring-2 focus:border-blue-500 transition-all ${error ? 'border-red-500 ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            autoFocus
                        />
                         {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
                     <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleVerify}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Verificar
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

export default PinModal;
