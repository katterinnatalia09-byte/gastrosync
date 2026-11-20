import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { Mail, Phone, HandCoins, Bike } from 'lucide-react';

const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

const ROL_LABEL = { Mesero: 'Mesero', Cocina: 'Cocina', CallCenter: 'Call Center', Domiciliario: 'Domiciliario', Gerente: 'Gerente' };

export function Avatar({ emp, className = 'w-10 h-10 text-sm' }) {
  const nombre = emp.nombreCompleto || emp.nombreUsuario || '?';
  const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return emp.foto ? (
    <img src={emp.foto} alt={nombre} className={`${className} rounded-full object-cover border-2 border-white shadow-sm shrink-0`} />
  ) : (
    <div className={`${className} rounded-full bg-amber-200 text-amber-900 font-black flex items-center justify-center border-2 border-white shadow-sm shrink-0`}>{iniciales}</div>
  );
}

// Credencial (carnet) del empleado, con foto, datos de contacto y lo que ha ganado en propinas
export default function EmployeeCredential({ emp }) {
  const { establishments, transactions, getPendingTips, getPendingFees } = useApp();
  const est = establishments.find(e => sameCode(e.codigo, emp.codigoEstablecimiento));

  const propinasPendientes = getPendingTips(emp.nombreUsuario).reduce((acc, t) => acc + Number(t.propina), 0);
  const propinasTotales = transactions
    .filter(t => sameCode(t.codigoEstablecimiento, emp.codigoEstablecimiento) && t.propinaMesero === emp.nombreUsuario)
    .reduce((acc, t) => acc + Number(t.propina || 0), 0);
  const esDomi = emp.rol === 'Domiciliario';
  const viajesPend = getPendingFees(emp.nombreUsuario);
  const domiciliosPend = viajesPend.reduce((acc, t) => acc + Number(t.costoDomicilio), 0);

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      <div className="bg-gradient-to-br from-amber-500 to-amber-400 px-4 pt-4 pb-14 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900/80">Credencial de empleado</p>
        <p className="text-sm font-black text-slate-900 leading-tight mt-0.5">{est?.nombre || emp.codigoEstablecimiento}</p>
      </div>

      <div className="-mt-12 flex justify-center">
        <Avatar emp={emp} className="w-24 h-24 text-3xl" />
      </div>

      <div className="px-5 pb-5 pt-2 text-center space-y-3">
        <div>
          <h4 className="text-lg font-black text-slate-900 leading-tight">{emp.nombreCompleto || emp.nombreUsuario}</h4>
          <p className="text-[11px] text-slate-500">Usuario: <span className="font-mono font-bold">{emp.nombreUsuario}</span></p>
          <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            {ROL_LABEL[emp.rol] || emp.rol}
          </span>
        </div>

        <div className="space-y-1.5 text-left text-xs text-slate-700 bg-slate-50 rounded-2xl p-3 border border-slate-100">
          <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-amber-600 shrink-0" /><span className="truncate">{emp.correo || 'Correo no registrado'}</span></p>
          <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-amber-600 shrink-0" />{emp.telefono || 'Teléfono no registrado'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5">
            <p className="text-[10px] font-bold uppercase text-amber-800 flex items-center"><HandCoins className="w-3 h-3 mr-1" /> Propinas por pagar</p>
            <p className="text-sm font-black text-amber-700">{formatCurrency(propinasPendientes)}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-500">Propinas ganadas en total</p>
            <p className="text-sm font-black text-slate-800">{formatCurrency(propinasTotales)}</p>
          </div>
          {esDomi && (
            <div className="col-span-2 bg-indigo-50 border border-indigo-200 rounded-2xl p-2.5">
              <p className="text-[10px] font-bold uppercase text-indigo-800 flex items-center"><Bike className="w-3 h-3 mr-1" /> Domicilios por pagar ({viajesPend.length} viajes)</p>
              <p className="text-sm font-black text-indigo-700">{formatCurrency(domiciliosPend)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
