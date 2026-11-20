import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Utensils, ChefHat, Bike, ShieldAlert, PhoneCall } from 'lucide-react';

export default function Shell({ children }) {
  const { currentUser, establishments, logout, syncError, clearSyncError } = useApp();

  const currentEst = currentUser ? establishments.find(
    e => String(e.codigo).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase()
  ) : null;
  const nombreEstablecimiento = currentEst ? (currentEst.nombre || currentEst.name) : currentUser?.codigoEstablecimiento;

  // El nombre del local también aparece en la pestaña del navegador
  useEffect(() => {
    if (nombreEstablecimiento) document.title = `${nombreEstablecimiento} · GastroSync`;
  }, [nombreEstablecimiento]);

  if (!currentUser) return children;

  const getRoleBadge = () => {
    switch (currentUser.rol) {
      case 'Gerente':
        return { label: 'Panel Gerencial', icon: ShieldAlert, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'Mesero':
        return { label: 'Terminal Mesero', icon: Utensils, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'Cocina':
        return { label: 'Pantalla Cocina', icon: ChefHat, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'Domiciliario':
        return { label: 'Módulo Domicilios', icon: Bike, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CallCenter':
      case 'Call Center':
        return { label: 'Recepción Domicilios', icon: PhoneCall, color: 'bg-orange-100 text-orange-800 border-orange-200' };
      default:
        return { label: currentUser.rol, icon: Utensils, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const badge = getRoleBadge();
  const IconComponent = badge.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white shadow-lg px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-900 text-lg shadow-md">
              GS
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Gastro<span className="text-amber-400">Sync</span></h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${badge.color}`}>
            <IconComponent className="w-4 h-4" />
            <span>{currentUser.nombreUsuario} ({badge.label})</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600 px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-500 to-amber-400 border-b-4 border-amber-600 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center gap-4">
          {currentEst?.logo && (
            <img
              src={currentEst.logo}
              alt=""
              onError={e => { e.currentTarget.style.display = 'none'; }}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
            />
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-900/80">Está trabajando en el local</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight truncate">{nombreEstablecimiento}</h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-950/80">
              Código: <span className="font-mono font-black">{currentUser.codigoEstablecimiento}</span>
              {currentEst?.direccion ? ` · ${currentEst.direccion}` : ''}
            </p>
          </div>
        </div>
      </div>

      {syncError && (
        <div className="bg-red-600 text-white text-xs font-semibold px-6 py-2 flex justify-between items-center">
          <span>⚠️ No se pudo guardar en la base de datos: {syncError}. Revise la conexión a internet.</span>
          <button onClick={clearSyncError} className="underline ml-4">Cerrar</button>
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}