import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './views/Auth';
import Gerente from './views/Gerente';
import Mesero from './views/Mesero';
import Cocina from './views/Cocina';
import Domiciliario from './views/Domiciliario';
import CallCenter from './views/CallCenter';
import Shell from './components/Shell';

function MainRouter() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Auth />;
  }

  const renderModuleByRole = () => {
    switch (currentUser.rol) {
      case 'Gerente':
        return <Gerente />;
      case 'Mesero':
        return <Mesero />;
      case 'Cocina':
        return <Cocina />;
      case 'Domiciliario':
        return <Domiciliario />;
      case 'CallCenter':
      case 'Call Center':
        return <CallCenter />;
      default:
        return <div className="p-8 text-center text-red-600 font-bold">Rol no autorizado o desconocido.</div>;
    }
  };

  return (
    <Shell>
      {renderModuleByRole()}
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}