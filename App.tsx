
import React, { useState, useMemo, useCallback } from 'react';
import { Phase, Task, TaskStatus, Photo } from './types';
import { INITIAL_PROJECT_PHASES } from './constants';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PhaseAccordion from './components/PhaseAccordion';
import PhotoModal from './components/PhotoModal';
import FeatureNotice from './components/FeatureNotice';
import GoogleDriveModal from './components/GoogleDriveModal';

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>('Acompanhamento de Obra');
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PROJECT_PHASES);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [driveFolderPath, setDriveFolderPath] = useState<string>('Minha Obra/Fotos');


  const totalTasks = useMemo(() => phases.reduce((acc, phase) => acc + phase.tasks.length, 0), [phases]);
  const completedTasks = useMemo(() => phases.flatMap(p => p.tasks).filter(t => t.status === TaskStatus.Completed).length, [phases]);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
  }, [phases, updateTask]);

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
  }, [updateTask, phases]);
  
  const handleDeletePhoto = useCallback((taskId: number, photoId: string) => {
      const task = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
      if (!task) return;
      
      const updatedImages = task.images.filter(p => p.id !== photoId);
      updateTask(taskId, { images: updatedImages });
  }, [phases, updateTask]);

  const handleUpdatePhotoComment = useCallback((photoId: string, comment: string) => {
      if(!currentTaskId) return;

      const task = phases.flatMap(p => p.tasks).find(t => t.id === currentTaskId);
      if (!task) return;

      const updatedImages = task.images.map(p => p.id === photoId ? {...p, comment} : p);
      updateTask(currentTaskId, { images: updatedImages });
      
      if(viewingPhoto?.id === photoId) {
        setViewingPhoto(prev => prev ? {...prev, comment} : null);
      }
  }, [currentTaskId, phases, updateTask, viewingPhoto]);

  const handleViewImage = useCallback((photo: Photo, taskId: number) => {
    setViewingPhoto(photo);
    setCurrentTaskId(taskId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewingPhoto(null);
    setCurrentTaskId(null);
  }, []);

  const handleUpdatePhaseDate = useCallback((phaseId: number, newDate: string) => {
    setPhases(currentPhases => 
      currentPhases.map(phase => 
        phase.id === phaseId ? { ...phase, deliveryDate: newDate } : phase
      )
    );
  }, []);
  
  const handleSaveDrivePath = useCallback((path: string) => {
    setDriveFolderPath(path);
    setIsDriveModalOpen(false);
    // In a real app, you'd save this to a server/config
    console.log('Google Drive path saved:', path);
  }, []);


  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        projectName={projectName}
        onProjectNameChange={setProjectName}
        isAdminMode={isAdminMode}
        onAdminModeToggle={() => setIsAdminMode(!isAdminMode)}
        onConnectDrive={() => setIsDriveModalOpen(true)}
      />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <FeatureNotice />
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Progresso Geral da Obra</h2>
          <p className="text-slate-500 mb-4">Acompanhe a evolução do projeto em tempo real.</p>
          <ProgressBar progress={overallProgress} />
        </div>
        
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
    </div>
  );
};

export default App;
