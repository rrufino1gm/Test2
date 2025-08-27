
import React, { useState, useMemo, useCallback } from 'react';
import { Phase, Task, TaskStatus, Photo, LogEntry } from './types';
import { INITIAL_PROJECT_PHASES } from './constants';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PhaseAccordion from './components/PhaseAccordion';
import PhotoModal from './components/PhotoModal';
import GoogleDriveModal from './components/GoogleDriveModal';
import AdminLoginModal from './components/AdminLoginModal';
import ActivityLog from './components/ActivityLog';

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>('Acompanhamento de Obra');
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PROJECT_PHASES);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [driveFolderPath, setDriveFolderPath] = useState<string>('Minha Obra/Fotos');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);


  const totalTasks = useMemo(() => phases.reduce((acc, phase) => acc + phase.tasks.length, 0), [phases]);
  const completedTasks = useMemo(() => phases.flatMap(p => p.tasks).filter(t => t.status === TaskStatus.Completed).length, [phases]);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const addLog = useCallback((message: string) => {
    const newLog: LogEntry = {
        id: self.crypto.randomUUID(),
        timestamp: new Date().toLocaleString('pt-BR'),
        message,
    };
    setLogs(currentLogs => [newLog, ...currentLogs]);
  }, []);

  const handleProjectNameChange = useCallback((newName: string) => {
    if (newName !== projectName) {
        addLog(`Nome do projeto alterado para: "${newName}"`);
        setProjectName(newName);
    }
  }, [projectName, addLog]);

  const updateTask = useCallback((taskId: number, updates: Partial<Task>) => {
    setPhases(currentPhases =>
      currentPhases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }))
    );
  }, []);
  
  const handleToggleComplete = useCallback((taskId: number) => {
    const task = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === TaskStatus.Completed ? TaskStatus.InProgress : TaskStatus.Completed;
    updateTask(taskId, { 
      status: newStatus, 
      lastUpdated: new Date().toLocaleString('pt-BR') 
    });
    addLog(`Tarefa "${task.name}" marcada como ${newStatus}.`);
  }, [phases, updateTask, addLog]);

  const handlePhotoUpload = useCallback((taskId: number, files: FileList) => {
    const currentTask = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (!currentTask) return;

    const newPhotos: Photo[] = Array.from(files).map(file => ({
      id: self.crypto.randomUUID(),
      url: URL.createObjectURL(file),
      comment: ''
    }));

    updateTask(taskId, {
      images: [...currentTask.images, ...newPhotos],
      status: TaskStatus.InProgress,
      lastUpdated: new Date().toLocaleString('pt-BR'),
    });
    addLog(`${files.length} foto(s) adicionada(s) à tarefa "${currentTask.name}".`);
  }, [updateTask, phases, addLog]);
  
  const handleDeletePhoto = useCallback((taskId: number, photoId: string) => {
      const task = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
      if (!task) return;
      
      const updatedImages = task.images.filter(p => p.id !== photoId);
      updateTask(taskId, { images: updatedImages });
      addLog(`Foto removida da tarefa "${task.name}".`);
  }, [phases, updateTask, addLog]);

  const handleUpdatePhotoComment = useCallback((photoId: string, comment: string) => {
      if(!currentTaskId) return;

      const task = phases.flatMap(p => p.tasks).find(t => t.id === currentTaskId);
      if (!task) return;

      const updatedImages = task.images.map(p => p.id === photoId ? {...p, comment} : p);
      updateTask(currentTaskId, { images: updatedImages });
      
      if(viewingPhoto?.id === photoId) {
        setViewingPhoto(prev => prev ? {...prev, comment} : null);
      }
      addLog(`Comentário em foto da tarefa "${task.name}" atualizado.`);
  }, [currentTaskId, phases, updateTask, viewingPhoto, addLog]);

  const handleViewImage = useCallback((photo: Photo, taskId: number) => {
    setViewingPhoto(photo);
    setCurrentTaskId(taskId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewingPhoto(null);
    setCurrentTaskId(null);
  }, []);

  const handleUpdatePhaseDate = useCallback((phaseId: number, newDate: string) => {
    setPhases(currentPhases => {
        const phaseToUpdate = currentPhases.find(p => p.id === phaseId);
        if (phaseToUpdate && phaseToUpdate.deliveryDate !== newDate) {
            addLog(`Data de entrega da fase "${phaseToUpdate.name}" alterada para ${newDate}.`);
            return currentPhases.map(phase => 
                phase.id === phaseId ? { ...phase, deliveryDate: newDate } : phase
            );
        }
        return currentPhases;
    });
  }, [addLog]);
  
  const handleSaveDrivePath = useCallback((path: string) => {
    setDriveFolderPath(path);
    setIsDriveModalOpen(false);
    addLog(`Caminho do Google Drive atualizado para: "${path}"`);
    console.log('Google Drive path saved:', path);
  }, [addLog]);

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    setIsLoginModalOpen(false);
    addLog('Modo Administrador ativado.');
  };

  const handleDeleteLog = useCallback((logId: string) => {
    setLogs(currentLogs => currentLogs.filter(log => log.id !== logId));
  }, []);


  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        isAdminMode={isAdminMode}
        onAdminModeToggle={handleAdminToggle}
        onConnectDrive={() => setIsDriveModalOpen(true)}
      />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Progresso Geral da Obra</h2>
          <p className="text-slate-500 mb-4">Acompanhe a evolução do projeto em tempo real.</p>
          <ProgressBar progress={overallProgress} />
        </div>
        
        <ActivityLog 
            logs={logs}
            isAdminMode={isAdminMode}
            onDeleteLog={handleDeleteLog}
        />
        
        <div className="space-y-4">
          {phases.map((phase) => (
            <PhaseAccordion
              key={phase.id}
              phase={phase}
              onToggleComplete={handleToggleComplete}
              onPhotoUpload={handlePhotoUpload}
              onViewImage={handleViewImage}
              onDeletePhoto={handleDeletePhoto}
              onUpdateDate={handleUpdatePhaseDate}
              isAdminMode={isAdminMode}
            />
          ))}
        </div>
      </main>
      {viewingPhoto && (
        <PhotoModal 
          photo={viewingPhoto} 
          onClose={handleCloseModal}
          onCommentChange={handleUpdatePhotoComment}
        />
      )}
      {isDriveModalOpen && (
        <GoogleDriveModal 
            currentPath={driveFolderPath}
            onClose={() => setIsDriveModalOpen(false)}
            onSave={handleSaveDrivePath}
        />
      )}
      {isLoginModalOpen && (
        <AdminLoginModal 
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default App;
