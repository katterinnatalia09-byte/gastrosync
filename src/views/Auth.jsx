import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Input } from '../components/ui';
import { generateRandomCode } from '../utils/helpers';
import { Utensils, ShieldCheck, ArrowRight, Building, Lock } from 'lucide-react';

export default function Auth() {
  const { login, registerEstablishment, establishments } = useApp();
  
  // Modos: 'welcome' (pantalla inicial), 'login' (iniciar sesión), 'register' (registrar negocio)
  const [mode, setMode] = useState('welcome');
  
  // Login states
  const [codigo, setCodigo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register states
  const [regData, setRegData] = useState({
    codigo: generateRandomCode(),
    nombre: '',
    direccion: '',
    nit: '',
    telefono: '',
    correo: '',
    gerenteUsuario: 'gerente',
    gerentePassword: '',
    habeasData: false
  });

  const codigoLimpio = codigo.trim().toUpperCase();
  const localEncontrado = codigoLimpio
    ? establishments.find(e => String(e.codigo).toUpperCase() === codigoLimpio)
    : null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(codigo, usuario, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    if (!regData.habeasData) {
      setError('Debe aceptar los Términos, Condiciones y Política de Privacidad (Habeas Data) para continuar.');
      return;
    }
    try {
      registerEstablishment(regData);
      alert('¡Establecimiento registrado con éxito! Código local generado: ' + regData.codigo);
      setMode('login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 transition-all">
        
        {/* Cabecera común */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black text-slate-900 text-2xl shadow-lg mb-3">
            GS
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Gastro<span className="text-amber-600">Sync</span></h2>
          <p className="text-xs text-slate-500 mt-1">Plataforma Multiestablecimiento de Gestión Gastronómica</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        {/* MODO 1: PANTALLA DE BIENVENIDA (INICIAR SESIÓN O REGISTRARSE) */}
        {mode === 'welcome' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-center text-slate-600 mb-6">
              Seleccione una opción para continuar con el sistema operativo de su restaurante.
            </p>

            <Button
              onClick={() => { setMode('login'); setError(''); }}
              variant="primary"
              className="w-full py-3.5 text-sm font-bold shadow-lg flex items-center justify-between px-6"
            >
              <span>Iniciar Sesión en el Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => { setMode('register'); setError(''); }}
              variant="outline"
              className="w-full py-3.5 text-sm font-bold flex items-center justify-between px-6 border-slate-300 hover:bg-slate-50 text-slate-800"
            >
              <span>Registrar Nuevo Establecimiento</span>
              <Building className="w-4 h-4 text-amber-600" />
            </Button>

            <div className="pt-6 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400">Arquitectura robusta aislada por roles y código de local.</p>
            </div>
          </div>
        )}

        {/* MODO 2: FORMULARIO DE INICIO DE SESIÓN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Código del Establecimiento" placeholder="ej. GS-DEMO" value={codigo} onChange={e => setCodigo(e.target.value)} required />

            {codigoLimpio && (
              localEncontrado ? (
                <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3">
                  {localEncontrado.logo && (
                    <img src={localEncontrado.logo} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} className="w-14 h-14 rounded-xl object-cover border border-emerald-200 bg-white" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Va a ingresar a:</p>
                    <p className="text-lg font-black text-slate-900 leading-tight">{localEncontrado.nombre}</p>
                    <p className="text-[11px] text-slate-500 truncate">{localEncontrado.direccion}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">No existe ningún local con ese código.</p>
              )
            )}
            <Input label="Nombre de Usuario" placeholder="ej. mesero1" value={usuario} onChange={e => setUsuario(e.target.value)} required />
            <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

            <Button type="submit" variant="primary" className="w-full py-3.5 mt-2 shadow-lg text-sm font-bold">
              Acceder al Módulo
            </Button>

            <div className="text-center pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <button type="button" onClick={() => setMode('welcome')} className="text-slate-500 hover:underline">
                ← Volver al inicio
              </button>
              <button type="button" onClick={() => { setMode('register'); setError(''); }} className="text-amber-600 hover:underline font-bold">
                Registrar Negocio
              </button>
            </div>
          </form>
        )}

        {/* MODO 3: FORMULARIO DE REGISTRO DE ESTABLECIMIENTO */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <Input label="Nombre del Restaurante" placeholder="ej. Delicias Gourmet" value={regData.nombre} onChange={e => setRegData({...regData, nombre: e.target.value})} required />
            <Input label="Dirección" placeholder="ej. Carrera 5 # 12-45" value={regData.direccion} onChange={e => setRegData({...regData, direccion: e.target.value})} required />
            <Input label="NIT" placeholder="ej. 900123456-1" value={regData.nit} onChange={e => setRegData({...regData, nit: e.target.value})} required />
            <Input label="Teléfono" placeholder="ej. 3101234567" value={regData.telefono} onChange={e => setRegData({...regData, telefono: e.target.value})} required />
            <Input label="Correo del Gerente" placeholder="gerente@local.com" value={regData.correo} onChange={e => setRegData({...regData, correo: e.target.value})} required />
            <Input label="Contraseña del Gerente" type="password" placeholder="••••••••" value={regData.gerentePassword} onChange={e => setRegData({...regData, gerentePassword: e.target.value})} required />

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-start space-x-2">
                <input type="checkbox" id="habeas" checked={regData.habeasData} onChange={e => setRegData({...regData, habeasData: e.target.checked})} className="mt-0.5 rounded text-amber-600 focus:ring-amber-500" />
                <label htmlFor="habeas" className="cursor-pointer text-[11px]">
                  Autorizo el tratamiento de datos personales conforme a la política de Habeas Data y acepto los términos y condiciones. <strong>(Registrará fecha y hora exacta).</strong>
                </label>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 text-sm font-bold">
              Completar Registro de Negocio
            </Button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => setMode('welcome')} className="text-xs text-slate-500 hover:underline">
                ← Volver al inicio
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}