
import React, { useRef } from 'react';
import { Task, TaskStatus, Photo } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onPhotoUpload: (files: FileList) => void;
  onViewImage: (photo: Photo) => void;
  onDeletePhoto: (photoId: string) => void;
  isAdminMode: boolean;
}

const statusStyles: Record<TaskStatus, { bg: string; text: string; ring: string }> = {
  [TaskStatus.Pending]: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-300' },
  [TaskStatus.InProgress]: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-400' },
  [TaskStatus.Completed]: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' },
};

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onPhotoUpload, onViewImage, onDeletePhoto, isAdminMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const style = statusStyles[task.status];
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onPhotoUpload(event.target.files);
    }
  };

  const isCompleted = task.status === TaskStatus.Completed;

  return (
    <div className={`p-4 flex flex-col gap-4 transition-colors duration-300 ${isCompleted ? 'bg-green-50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-4 flex-1 w-full">
          <button
              onClick={onToggleComplete}
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-slate-300 hover:border-green-500'}`}
          >
              <CheckIcon className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className={`font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>{task.status}</span>
              {task.lastUpdated && <span className="text-xs text-slate-400">Atualizado em: {task.lastUpdated}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              disabled={isCompleted}
          />
          <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompleted}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
              <CameraIcon className="w-4 h-4" />
              <span>{task.images.length > 0 ? 'Adicionar' : 'Anexar'}<span className="hidden sm:inline">&nbsp;Fotos</span></span>
          </button>
        </div>
      </div>
      
      {task.images.length > 0 && (
          <div className="pl-0 sm:pl-11 flex flex-wrap gap-3">
            {task.images.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Preview da tarefa"
                  className="w-20 h-20 object-cover rounded-md cursor-pointer ring-2 ring-offset-2 ring-slate-200 group-hover:ring-blue-500 transition-all"
                  onClick={() => onViewImage(photo)}
                />
                {isAdminMode && (
                  <button 
                    onClick={() => onDeletePhoto(photo.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remover foto"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default TaskItem;
