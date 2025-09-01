
import React, { useState, useMemo } from 'react';
import { PaymentMilestone, MilestoneStatus } from '../types';

interface PaymentItemProps {
    milestone: PaymentMilestone;
    isAdminMode: boolean;
    onAddPayment: () => void;
}

const statusStyles: Record<MilestoneStatus, { bg: string; text: string; ring: string }> = {
  [MilestoneStatus.Pending]: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-300' },
  [MilestoneStatus.PartiallyPaid]: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-400' },
  [MilestoneStatus.Paid]: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' },
};

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            // If the date is invalid, return the original string
            return isoString;
        }
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        console.error("Failed to format date:", isoString, e);
        return isoString; // Fallback to raw string
    }
};

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const PaymentItem: React.FC<PaymentItemProps> = ({ milestone, isAdminMode, onAddPayment }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const paidAmount = useMemo(() => milestone.payments.reduce((sum, p) => sum + p.amount, 0), [milestone.payments]);
    const remainingAmount = milestone.totalValue - paidAmount;
    const style = statusStyles[milestone.status];
    
    const renderAdminActions = () => {
        if (milestone.status !== MilestoneStatus.Paid) {
            return (
                <button onClick={onAddPayment} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Adicionar Pagamento</button>
            );
        }
        return null;
    };

    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{milestone.phaseName}</p>
                    <p className="text-sm text-slate-500 mt-1">{milestone.condition}</p>
                    <div className="mt-2">
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(milestone.totalValue)}</p>
                      <p className="text-sm text-slate-500 mt-1">
                          <span className="font-semibold text-green-600">{formatCurrency(paidAmount)}</span> pagos
                      </p>
                      {remainingAmount > 0.009 && <p className="text-xs text-red-600 font-medium">Faltam {formatCurrency(remainingAmount)}</p>}
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>{milestone.status}</span>
                    <div className="mt-2">{isAdminMode && renderAdminActions()}</div>
                </div>
            </div>
            {milestone.payments.length > 0 && (
                <div className="mt-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="flex items-center text-sm text-blue-600 hover:underline">
                        <span>Ver Detalhes</span>
                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                         <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-4 animate-fade-in-slow">
                            <h4 className="font-semibold text-slate-700">Histórico de Pagamentos</h4>
                            <ul className="space-y-4">
                                {milestone.payments.map(payment => (
                                    <li key={payment.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                                        <p>
                                            <strong className="font-medium text-slate-600">Valor:</strong>
                                            <span className="text-slate-800">&nbsp;{formatCurrency(payment.amount)}</span>
                                        </p>
                                        <p>
                                            <strong className="font-medium text-slate-600">Data:</strong>
                                            <span className="text-slate-800">&nbsp;{formatDate(payment.date)}</span>
                                        </p>
                                        {payment.comments && (
                                            <p className="whitespace-pre-wrap">
                                                <strong className="font-medium text-slate-600">Comentários:</strong>
                                                <span className="text-slate-800">&nbsp;{payment.comments}</span>
                                            </p>
                                        )}
                                        {payment.receiptUrl && (
                                            <div className="mt-2">
                                                <strong className="font-medium text-slate-600 block mb-1">Recibo:</strong>
                                                <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={payment.receiptUrl} alt="Recibo de pagamento" className="max-w-xs rounded-md border" />
                                                </a>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 1000px; }
                }
                .animate-fade-in-slow {
                    overflow: hidden;
                    animation: fade-in-slow 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PaymentItem;
