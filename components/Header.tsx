
import React, { useState, useRef, useEffect } from 'react';

const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <line x1="9" y1="4" x2="9" y2="20"></line>
        <line x1="15" y1="4" x2="15" y2="20"></line>
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
    </svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const DriveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><g><path d="M22.053 13.316l-1.008-5.644-6.353-6.353-5.644-1.008-6.048 10.999 4.084 7.702 14.969-5.7z"></path><path d="M8.285 20.315l14.969-5.699-2.91-4.832-14.073 5.429z"></path><path d="M7.039 8.441l-2.955 5.371 14.073-5.429 2.014-3.805z"></path></g></svg>
);


interface HeaderProps {
    projectName: string;
    onProjectNameChange: (newName: string) => void;
    isAdminMode: boolean;
    onAdminModeToggle: () => void;
    onConnectDrive: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onProjectNameChange, isAdminMode, onAdminModeToggle, onConnectDrive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
        inputRef.current?.focus();
        inputRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  const handleBlur = () => {
    setIsEditing(false);
    onProjectNameChange(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setName(projectName);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-full text-white">
                <BuildingIcon className="w-8 h-8"/>
            </div>
            <div>
                {isEditing && isAdminMode ? (
                     <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="text-2xl sm:text-3xl font-bold text-slate-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                     />
                ) : (
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{projectName}</h1>
                        {isAdminMode && (
                            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-blue-600">
                                <EditIcon />
                            </button>
                        )}
                    </div>
                )}
                <p className="text-slate-500 text-sm">Relatório diário de progresso da construção</p>
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          {isAdminMode && (
            <button onClick={onConnectDrive} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-300 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100">
                <DriveIcon className="w-4 h-4 text-green-500" />
                <span className="hidden md:inline">Google Drive</span>
            </button>
          )}
          <label htmlFor="admin-toggle" className="text-sm font-medium text-slate-600 whitespace-nowrap">Modo Admin</label>
          <button 
            role="switch"
            aria-checked={isAdminMode}
            id="admin-toggle"
            onClick={onAdminModeToggle} 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isAdminMode ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
