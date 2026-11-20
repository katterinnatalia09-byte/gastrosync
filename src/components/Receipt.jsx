import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { useApp } from '../context/AppContext';

export default function Receipt({ order, onClose }) {
  const { establishments, currentUser } = useApp();

  if (!order) return null;

  const codigoLocal = order.codigoEstablecimiento || currentUser?.codigoEstablecimiento || 'GS-DEMO';
  const foundEst = establishments?.find(
    e => String(e.codigo).toUpperCase() === String(codigoLocal).toUpperCase()
  );
  const nombreEstablecimiento = foundEst ? (foundEst.nombre || foundEst.name) : 'Restaurante GastroSync';

  let itemsList = order.items || [];
  let totalMonto = Number(order.monto || order.total || 0);
  const propina = Number(order.propina || 0);

  if (totalMonto === 0 && itemsList.length > 0) {
    totalMonto = itemsList.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
  }

  const metodoPagoStr = (order.metodoPago || 'Efectivo').toUpperCase();
  const tipoOrdenStr = (order.tipoTarget || order.tipo || 'Mesa').toUpperCase();

  return (
    <div className="bg-white p-6 rounded-2xl max-w-sm mx-auto shadow-xl border border-slate-200 text-slate-800 font-sans">
      <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
        <h3 className="font-black text-lg text-slate-900 leading-tight">{nombreEstablecimiento}</h3>
        <p className="text-xs font-bold text-amber-600">Comprobante de Pago Oficial</p>
        <p className="text-[11px] text-slate-400">Local ID: {codigoLocal}</p>
      </div>

      <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500">Orden / Transacción ID:</span>
          <span className="font-mono font-bold text-slate-700">#{String(order.id || Date.now()).slice(-6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tipo de Servicio:</span>
          <span className="font-semibold uppercase text-slate-700">{tipoOrdenStr}</span>
        </div>
        {order.mesaNumero && (
          <div className="flex justify-between">
            <span className="text-slate-500">Ubicación:</span>
            <span className="font-bold text-slate-700">Mesa #{order.mesaNumero}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Fecha y Hora:</span>
          <span className="text-slate-600">{new Date(order.fechaHora || Date.now()).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Método de Pago:</span>
          <span className="font-bold uppercase text-emerald-600">{metodoPagoStr}</span>
        </div>
      </div>

      <div className="py-4 space-y-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detalle de Ítems:</p>
        {itemsList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Pago registrado por cuenta general.</p>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {itemsList.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs items-center bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-700 font-medium">{item.cantidad}x {item.nombre}</span>
                <span className="font-bold text-slate-900">{formatCurrency((item.precio || 0) * (item.cantidad || 0))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t-2 border-slate-200 space-y-1 mb-6">
        {propina > 0 && (
          <>
            <div className="flex justify-between text-xs text-slate-500"><span>Consumo</span><span>{formatCurrency(totalMonto)}</span></div>
            <div className="flex justify-between text-xs text-amber-700"><span>Propina{order.propinaMesero ? ` (${order.propinaMesero})` : ''}</span><span>{formatCurrency(propina)}</span></div>
          </>
        )}
        <div className="flex justify-between items-center">
          <span className="font-black text-sm text-slate-900">Total Pagado:</span>
          <span className="text-xl font-black text-emerald-600">{formatCurrency(totalMonto + propina)}</span>
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-[10px] text-slate-400">
          {metodoPagoStr === 'EFECTIVO' 
            ? 'Transacción en efectivo recibida y procesada en caja.' 
            : 'Pago electrónico validado correctamente.'}
        </p>
        <button 
          onClick={onClose} 
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Cerrar Recibo
        </button>
      </div>
    </div>
  );
}