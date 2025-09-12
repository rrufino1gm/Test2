
import React, { useState, useEffect, useMemo } from 'react';
import { PaymentMilestone } from '../types';

interface PaymentModalProps {
  milestone: PaymentMilestone;
  onClose: () => void;
  onSubmit: (milestoneId: number, paymentData: { amount: number; receiptFile: File | null; comments: string }) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ milestone, onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');

    const remainingAmount = useMemo(() => {
        const paidAmount = milestone.payments.reduce((sum, p) => sum + p.amount, 0);
        return milestone.totalValue - paidAmount;
    }, [milestone]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        setError('');
        const parsedAmount = parseFloat(amount.replace(',', '.'));

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Por favor, insira um valor de pagamento válido.');
            return;
        }
       
        if (parsedAmount > remainingAmount + 0.001) { // Add tolerance for floating point issues
             setError(`O valor não pode ser maior que o saldo devedor de ${formatCurrency(remainingAmount)}.`);
             return;
        }
        onSubmit(milestone.id, { amount: parsedAmount, receiptFile, comments });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 id="payment-modal-title" className="text-xl font-bold text-slate-800 mb-2">Registrar Pagamento</h2>
                    <p className="text-sm text-slate-500 mb-1">Fase: <strong className="font-semibold">{milestone.phaseName}</strong></p>
                    <p className="text-sm text-slate-500 mb-6">Saldo Devedor: <strong className="font-semibold text-red-600">{formatCurrency(remainingAmount)}</strong></p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Valor do Pagamento</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Comprovante (Opcional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Carregue um arquivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg,image/png,image/webp,.pdf" />
                                        </label>
                                        <p className="pl-1">ou arraste e solte</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, PDF até 10MB</p>
                                </div>
                            </div>
                            {receiptFile && <p className="text-sm text-slate-700 mt-2">Arquivo selecionado: {receiptFile.name}</p>}
                        </div>
                        <div>
                           <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-1">Comentários (Opcional)</label>
                           <textarea
                                id="comments"
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Adicione uma observação sobre este pagamento..."
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                     {error && <p className="text-red-600 text-sm mt-4 text-center font-semibold">{error}</p>}
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end items-center gap-3">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Registrar Pagamento</button>
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

export default PaymentModal;
