
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Phase, Task, TaskStatus, Photo, LogEntry, PaymentMilestone, MilestoneStatus, Payment } from './types';
import { INITIAL_PROJECT_PHASES, INITIAL_PAYMENT_MILESTONES } from './constants';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PhaseAccordion from './components/PhaseAccordion';
import PhotoModal from './components/PhotoModal';
import GoogleDriveModal from './components/GoogleDriveModal';
import AdminLoginModal from './components/AdminLoginModal';
import ActivityLog from './components/ActivityLog';
import FeatureNotice from './components/FeatureNotice';
import Tabs from './components/Tabs';
import Payments from './components/Payments';
import PaymentModal from './components/PaymentModal';

type AppTab = 'progress' | 'payments';

const App: React.FC = () => {
  const [projectName, setProjectName] = useState<string>('Acompanhamento de Obra');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [paymentMilestones, setPaymentMilestones] = useState<PaymentMilestone[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [driveFolderPath, setDriveFolderPath] = useState<string>('Minha Obra/Fotos');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AppTab>('progress');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingMilestone, setPayingMilestone] = useState<PaymentMilestone | null>(null);

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/get-data', { cache: 'no-store' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
                throw new Error(errorData.error || 'Falha ao buscar os dados do projeto.');
            }
            const data = await response.json();
            setProjectName(data.projectName || 'Acompanhamento de Obra');
            setPhases(data.phases || INITIAL_PROJECT_PHASES);
            setPaymentMilestones(data.paymentMilestones || INITIAL_PAYMENT_MILESTONES);
            setLogs(data.logs || []);
            setDriveFolderPath(data.driveFolderPath || 'Minha Obra/Fotos');
        } catch (err: any) {
            setError(err.message);
            console.error(err);
            setPhases(INITIAL_PROJECT_PHASES);
            setPaymentMilestones(INITIAL_PAYMENT_MILESTONES);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);

  const addLog = useCallback((message: string) => {
    const newLog: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString('pt-BR'),
        message,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  const totalProgress = useMemo(() => {
    const allTasks = phases.flatMap(p => p.tasks);
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.Completed).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  }, [phases]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setError(null);
    try {
        const fullState = {
            projectName,
            phases,
            paymentMilestones,
            logs,
            driveFolderPath
        };
        const response = await fetch('/api/save-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullState),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
            throw new Error(errorData.error || 'Falha ao salvar o progresso.');
        }
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);

    } catch (err: any) {
        setError(err.message);
        setSaveStatus('idle');
    }
  }, [projectName, phases, paymentMilestones, logs, driveFolderPath]);
  
  const handleReset = useCallback(async () => {
    if (window.confirm("Tem certeza que deseja reiniciar todo o progresso? Esta ação não pode ser desfeita.")) {
        const initialData = {
            projectName: 'Acompanhamento de Obra',
            phases: INITIAL_PROJECT_PHASES,
            paymentMilestones: INITIAL_PAYMENT_MILESTONES,
            logs: [{
                id: crypto.randomUUID(),
                timestamp: new Date().toLocaleString('pt-BR'),
                message: 'Projeto reiniciado para o estado inicial.',
            }],
            driveFolderPath: 'Minha Obra/Fotos'
        };
        
        setSaveStatus('saving');
        setError(null);
        try {
            const response = await fetch('/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialData),
            });

            if (!response.ok) {
                throw new Error('Falha ao reiniciar o projeto.');
            }
            
            setProjectName(initialData.projectName);
            setPhases(initialData.phases);
            setPaymentMilestones(initialData.paymentMilestones);
            setLogs(initialData.logs);
            setDriveFolderPath(initialData.driveFolderPath);
            addLog('Progresso reiniciado para o estado inicial.');
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err: any) {
            setError(err.message);
            setSaveStatus('idle');
        }
    }
  }, [addLog]);

  const updateTask = useCallback((taskId: number, updateFn: (task: Task) => Task) => {
    setPhases(currentPhases =>
        currentPhases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task =>
                task.id === taskId ? updateFn(task) : task
            ),
        }))
    );
  }, []);

  const handleToggleComplete = useCallback((taskId: number) => {
    let taskName = '';
    let newStatus: TaskStatus | '' = '';

    updateTask(taskId, task => {
        taskName = task.name;
        const isCompleted = task.status === TaskStatus.Completed;
        newStatus = isCompleted ? TaskStatus.Pending : TaskStatus.Completed;
        return {
            ...task,
            status: newStatus,
            lastUpdated: new Date().toLocaleString('pt-BR'),
        };
    });
    
    if (taskName && newStatus) {
        addLog(`Tarefa "${taskName}" marcada como ${newStatus}.`);
    }
  }, [updateTask, addLog]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };
    
  const handlePhotoUpload = useCallback(async (taskId: number, files: FileList) => {
    if (!files) return;
    
    const taskName = phases.flatMap(p => p.tasks).find(t => t.id === taskId)?.name || `Tarefa ${taskId}`;

    for (const file of Array.from(files)) {
        const base64Url = await fileToBase64(file);
        const newPhoto: Photo = {
            id: crypto.randomUUID(),
            url: base64Url,
            comment: '',
        };
        updateTask(taskId, task => ({
            ...task,
            images: [...task.images, newPhoto],
        }));
    }
    addLog(`${files.length} foto(s) adicionada(s) à tarefa "${taskName}".`);
  }, [updateTask, addLog, phases]);

  const handleDeletePhoto = useCallback((taskId: number, photoId: string) => {
    updateTask(taskId, task => ({
        ...task,
        images: task.images.filter(p => p.id !== photoId),
    }));
    addLog('Foto removida da tarefa.');
  }, [updateTask, addLog]);

  const handleCommentChange = useCallback((photoId: string, comment: string) => {
    setPhases(currentPhases =>
        currentPhases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task => ({
                ...task,
                images: task.images.map(photo =>
                    photo.id === photoId ? { ...photo, comment } : photo
                ),
            })),
        }))
    );
    addLog('Comentário da foto atualizado.');
  }, [addLog]);

  const handleUpdateDate = useCallback((phaseId: number, newDate: string) => {
    const phaseName = phases.find(p => p.id === phaseId)?.name || `Fase ${phaseId}`;
    setPhases(currentPhases =>
        currentPhases.map(phase =>
            phase.id === phaseId ? { ...phase, deliveryDate: newDate } : phase
        )
    );
    addLog(`Data de entrega da fase "${phaseName}" atualizada para ${newDate}.`);
  }, [addLog, phases]);

  const handleViewImage = useCallback((photo: Photo, taskId: number) => {
    setViewingPhoto(photo);
    setCurrentTaskId(taskId);
  }, []);

  const handleAdminModeToggle = () => {
    if (isAdminMode) {
        setIsAdminMode(false);
    } else {
        setIsLoginModalOpen(true);
    }
  };
    
  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    setIsLoginModalOpen(false);
    addLog('Modo administrador ativado.');
  };
    
  const handleDrivePathSave = (newPath: string) => {
    setDriveFolderPath(newPath);
    setIsDriveModalOpen(false);
    addLog(`Caminho do Google Drive atualizado para: ${newPath}`);
  };

  const handleOpenPaymentModal = useCallback((milestone: PaymentMilestone) => {
    setPayingMilestone(milestone);
    setIsPaymentModalOpen(true);
  }, []);

  const handleAddPayment = useCallback(async (milestoneId: number, paymentData: { amount: number; receiptFile: File | null; comments: string }) => {
    const { amount, receiptFile, comments } = paymentData;

    let receiptUrl: string | undefined = undefined;
    if (receiptFile) {
        receiptUrl = await fileToBase64(receiptFile);
    }

    const newPayment: Payment = {
        id: crypto.randomUUID(),
        amount,
        comments,
        receiptUrl,
        date: new Date().toISOString(),
    };

    const milestoneName = paymentMilestones.find(m => m.id === milestoneId)?.phaseName || '';

    setPaymentMilestones(prev => 
        prev.map(m => {
            if (m.id === milestoneId) {
                const updatedPayments = [...m.payments, newPayment];
                const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
                
                let newStatus: MilestoneStatus;
                if (totalPaid >= m.totalValue) {
                    newStatus = MilestoneStatus.Paid;
                } else if (totalPaid > 0) {
                    newStatus = MilestoneStatus.PartiallyPaid;
                } else {
                    newStatus = MilestoneStatus.Pending;
                }

                return { ...m, payments: updatedPayments, status: newStatus };
            }
            return m;
        })
    );
    addLog(`Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado para "${milestoneName}".`);
    setIsPaymentModalOpen(false);
    setPayingMilestone(null);
  }, [addLog, paymentMilestones]);


  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">Carregando dados do projeto...</p>
                <p className="text-sm text-slate-500">Por favor, aguarde.</p>
            </div>
        </div>
    );
  }

  const TABS = [
    { id: 'progress', label: 'Andamento da Obra' },
    { id: 'payments', label: 'Financeiro' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
        <Header 
            projectName={projectName}
            onProjectNameChange={(name) => {
                setProjectName(name);
                addLog(`Nome do projeto alterado para "${name}".`);
            }}
            isAdminMode={isAdminMode}
            onAdminModeToggle={handleAdminModeToggle}
            onConnectDrive={() => setIsDriveModalOpen(true)}
            onSave={handleSave}
            onReset={handleReset}
            saveStatus={saveStatus}
        />

        <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
                    <p className="font-bold">Ocorreu um erro</p>
                    <p>{error}</p>
                </div>
            )}
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <Tabs tabs={TABS} activeTab={activeTab} onTabClick={(id) => setActiveTab(id as AppTab)} />
                {activeTab === 'progress' && <div className="mt-6"><ProgressBar progress={totalProgress} /></div>}
            </div>
            
            {activeTab === 'progress' && (
                <div className="space-y-6">
                    {phases.map(phase => (
                        <PhaseAccordion
                            key={phase.id}
                            phase={phase}
                            isAdminMode={isAdminMode}
                            onToggleComplete={handleToggleComplete}
                            onPhotoUpload={handlePhotoUpload}
                            onViewImage={handleViewImage}
                            onDeletePhoto={handleDeletePhoto}
                            onUpdateDate={handleUpdateDate}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'payments' && (
                <Payments 
                    milestones={paymentMilestones}
                    isAdminMode={isAdminMode}
                    onAddPayment={handleOpenPaymentModal}
                />
            )}

            <div className="mt-8">
                <ActivityLog logs={logs} isAdminMode={isAdminMode} onDeleteLog={(logId) => setLogs(logs.filter(l => l.id !== logId))} />
            </div>

            <div className="mt-8">
                <FeatureNotice />
            </div>
        </main>
        
        {viewingPhoto && currentTaskId !== null && (
            <PhotoModal 
                photo={viewingPhoto} 
                onClose={() => setViewingPhoto(null)}
                onCommentChange={handleCommentChange}
            />
        )}

        {isDriveModalOpen && (
            <GoogleDriveModal 
                currentPath={driveFolderPath}
                onClose={() => setIsDriveModalOpen(false)}
                onSave={handleDrivePathSave}
            />
        )}
        
        {isLoginModalOpen && (
            <AdminLoginModal
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        )}

        {isPaymentModalOpen && payingMilestone && (
            <PaymentModal
                milestone={payingMilestone}
                onClose={() => { setIsPaymentModalOpen(false); setPayingMilestone(null); }}
                onSubmit={handleAddPayment}
            />
        )}
    </div>
  );
};

export default App;
