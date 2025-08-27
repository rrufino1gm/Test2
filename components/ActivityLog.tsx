import React, { useState } from 'react';
import { LogEntry } from '../types';

interface ActivityLogProps {
  logs: LogEntry[];
  isAdminMode: boolean;
  onDeleteLog: (logId: string) => void;
}

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.19-9.51L1 10"/></svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);


const ActivityLog: React.FC<ActivityLogProps> = ({ logs, isAdminMode, onDeleteLog }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-8">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="activity-log-content"
      >
        <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-slate-600"/>
            <h3 className="text-xl font-semibold text-slate-700">Registro de Atividades</h3>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div 
        id="activity-log-content"
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="border-t border-slate-200 p-4 overflow-y-auto max-h-[450px]">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma atividade registrada ainda.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-slate-800 text-sm">{log.message}</p>
                    <p className="text-slate-400 text-xs mt-1">{log.timestamp}</p>
                  </div>
                  {isAdminMode && (
                    <button 
                      onClick={() => onDeleteLog(log.id)}
                      className="text-slate-400 hover:text-red-500 p-1 -m-1"
                      aria-label="Remover log"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
