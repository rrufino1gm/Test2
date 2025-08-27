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

const LOCAL_STORAGE_KEY = 'construction-tracker-data';

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>(() => loadStateFromLocalStorage()?.projectName || 'Acompanhamento de Obra');
  const [phases, setPhases] = useState<Phase[]>(() => loadStateFromLocalStorage()?.phases || INITIAL_PROJECT_PHASES);
  const [logs, setLogs] = useState<LogEntry[]>(() => loadStateFromLocalStorage()?.logs || []);
  const [driveFolderPath, setDriveFolderPath] = useState<string>(() => loadStateFromLocalStorage()?.driveFolderPath || 'Minha Obra/Fotos');

  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoUpload = useCallback(async (taskId: number, files: FileList) => {
    const currentTask = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (!currentTask) return;

    try {
        const base64Promises = Array.from(files).map(fileToBase64);
        const base64Urls = await Promise.all(base64Promises);

        const newPhotos: Photo[] = base64Urls.map(url => ({
            id: self.crypto.randomUUID(),
            url: url,
            comment: ''
        }));

        updateTask(taskId, {
            images: [...currentTask.images, ...newPhotos],
            status: TaskStatus.InProgress,
            lastUpdated: new Date().toLocaleString('pt-BR'),
        });
        addLog(`${files.length} foto(s) adicionada(s) à tarefa "${currentTask.name}".`);
    } catch (error) {
        console.error("Error converting files to base64", error);
        addLog(`Falha ao processar as fotos.`);
    }
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

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    try {
        const stateToSave = {
            projectName,
            phases,
            logs,
            driveFolderPath,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        addLog('Progresso salvo localmente no navegador.');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
        addLog('Erro ao salvar o progresso.');
        setSaveStatus('idle');
    }
  }, [projectName, phases, logs, driveFolderPath, addLog]);

  const handleReset = useCallback(() => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados salvos e reiniciar o projeto? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setProjectName('Acompanhamento de Obra');
        setPhases(INITIAL_PROJECT_PHASES);
        setLogs([]);
        setDriveFolderPath('Minha Obra/Fotos');
        addLog('Projeto reiniciado para o estado original.');
    }
  }, [addLog]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header 
        projectName={projectName}
        onProjectNameChange={handleProjectNameChange}
        isAdminMode={isAdminMode}
        onAdminModeToggle={handleAdminToggle}
        onConnectDrive={() => setIsDriveModalOpen(true)}
        onSave={handleSave}
        onReset={handleReset}
        saveStatus={saveStatus}
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