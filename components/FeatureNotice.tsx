import React from 'react';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);


const FeatureNotice: React.FC = () => {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-sm mb-8" role="alert">
            <div className="flex">
                <div className="py-1">
                    <InfoIcon className="h-6 w-6 text-yellow-500 mr-4"/>
                </div>
                <div>
                    <p className="font-bold">Nota sobre Funcionalidades Avançadas</p>
                    <p className="text-sm">
                        Recursos como **notificações por e-mail** e **integração com Google Drive** necessitam de um servidor (backend) para funcionar.
                        Esta é uma demonstração focada na interface (frontend) e, por isso, essas funcionalidades não estão implementadas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeatureNotice;
