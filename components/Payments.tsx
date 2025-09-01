import React, { useMemo } from 'react';
import { PaymentMilestone, MilestoneStatus } from '../types';
import PaymentItem from './PaymentItem';

interface PaymentsProps {
    milestones: PaymentMilestone[];
    isAdminMode: boolean;
    onAddPayment: (milestone: PaymentMilestone) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const Payments: React.FC<PaymentsProps> = ({ milestones, isAdminMode, onAddPayment }) => {
    const { total, paid, remaining, progress } = useMemo(() => {
        const total = milestones.reduce((sum, m) => sum + m.totalValue, 0);
        const paid = milestones.flatMap(m => m.payments).reduce((sum, p) => sum + p.amount, 0);
        const remaining = total - paid;
        const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
        return { total, paid, remaining, progress };
    }, [milestones]);
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Resumo Financeiro</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-slate-500">Valor Total</p>
                        <p className="text-2xl font-semibold text-slate-800">{formatCurrency(total)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Pago</p>
                        <p className="text-2xl font-semibold text-green-600">{formatCurrency(paid)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Saldo Devedor</p>
                        <p className="text-2xl font-semibold text-red-600">{formatCurrency(remaining)}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-500">Progresso do Pagamento</span>
                        <span className="text-sm font-bold text-blue-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                 <div className="divide-y divide-slate-200">
                    {milestones.map(milestone => (
                        <PaymentItem 
                            key={milestone.id}
                            milestone={milestone}
                            isAdminMode={isAdminMode}
                            onAddPayment={() => onAddPayment(milestone)}
                        />
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default Payments;
