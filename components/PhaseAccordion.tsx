import React, { useState, useMemo, useEffect } from 'react';
import { Phase, TaskStatus, Photo } from '../types';
import TaskItem from './TaskItem';
import ProgressBar from './ProgressBar';

interface PhaseAccordionProps {
  phase: Phase;
  isAdminMode: boolean;
  onToggleComplete: (taskId: number) => void;
  onPhotoUpload: (taskId: number, files: FileList) => void;
  onViewImage: (photo: Photo, taskId: number) => void;
  onDeletePhoto: (taskId: number, photoId: string) => void;
  onUpdateDate: (phaseId: number, newDate: string) => void;
}

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const PhaseAccordion: React.FC<PhaseAccordionProps> = ({ phase, onToggleComplete, onPhotoUpload, onViewImage, onDeletePhoto, isAdminMode, onUpdateDate }) => {
  const [isOpen, setIsOpen] = useState(phase.id === 1);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(phase.deliveryDate);

  const phaseProgress = useMemo(() => {
    const totalTasks = phase.tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = phase.tasks.filter(t => t.status === TaskStatus.Completed).length;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [phase.tasks]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryDate(e.target.value);
  }
  
  const handleDateSave = () => {
    // Basic validation could be added here
    const [day, month, year] = deliveryDate.split('/');
    if(deliveryDate.length === 10 && day && month && year) {
        onUpdateDate(phase.id, deliveryDate);
    } else {
        // Revert if format is wrong
        setDeliveryDate(phase.deliveryDate);
    }
    setIsEditingDate(false);
  }

  // Effect to update local state if prop changes
  useEffect(() => {
    setDeliveryDate(phase.deliveryDate);
  }, [phase.deliveryDate]);


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-slate-700">{phase.name}</h3>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Entrega Prevista: </span>
            {isEditingDate && isAdminMode ? (
                 <input 
                    type="text" 
                    value={deliveryDate}
                    onChange={handleDateChange}
                    onBlur={handleDateSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateSave()}
                    onClick={(e) => e.stopPropagation()} // prevent accordion from closing
                    className="font-bold p-1 -m-1 rounded bg-slate-100 border-slate-300 border focus:outline-blue-500"
                    autoFocus
                 />
            ): (
                <strong className="font-bold">{deliveryDate}</strong>
            )}

            {isAdminMode && !isEditingDate && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditingDate(true); }}
                    className="text-slate-400 hover:text-blue-600"
                    aria-label="Editar data"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
            )}
          </div>
          <div className="mt-3 pr-4">
             <ProgressBar progress={phaseProgress} />
          </div>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-slate-200 divide-y divide-slate-200">
          {phase.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={() => onToggleComplete(task.id)}
              onPhotoUpload={(files) => onPhotoUpload(task.id, files)}
              onViewImage={(photo) => onViewImage(photo, task.id)}
              onDeletePhoto={(photoId) => onDeletePhoto(task.id, photoId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseAccordion;
