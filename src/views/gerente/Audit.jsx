import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { FileText, Clock, XCircle, DollarSign, User } from 'lucide-react';

export default function Audit() {
  const { currentUser, transactions, orders } = useApp();

  const localTxs = transactions.filter(t => String(t.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());
  const totalIngresos = localTxs.reduce((acc, t) => acc + t.monto, 0);

  const localOrders = orders.filter(o => String(o.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());
  const cancelledOrders = localOrders.filter(o => o.estado === 'cancelado');

  return (
    <div className="space-y-6">
      {/* Tarjetas de Resumen Financiero y Operativo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Total Ingresos Registrados (sin propinas)</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Transacciones de Cobro</p>
          <p className="text-2xl font-black text-slate-900">{localTxs.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Pedidos Cancelados / Anulados</p>
          <p className="text-2xl font-black text-red-600">{cancelledOrders.length}</p>
        </div>
      </div>

      {/* SECCIÓN 1: AUDITORÍA DE PEDIDOS CANCELADOS (Con hora de creación, hora de cancelación, mesero que atendió y quién canceló) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <XCircle className="w-4 h-4 text-red-600 mr-2" /> Auditoría de Pedidos Cancelados (Control de Tiempos y Responsables)
          </h3>
          <span className="text-xs text-slate-400">Trazabilidad completa de anulación</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-red-50 text-red-900 uppercase font-bold border-b border-red-100">
              <tr>
                <th className="p-3">Orden ID</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Hora del Pedido (Creado)</th>
                <th className="p-3">Hora de Cancelación</th>
                <th className="p-3">Mesero que Atendió</th>
                <th className="p-3">Motivo / Quién Canceló</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cancelledOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 italic">No hay registros de pedidos cancelados en este establecimiento.</td>
                </tr>
              ) : (
                cancelledOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">#{ord.id.slice(-5)}</td>
                    <td className="p-3 uppercase font-semibold">
                      {ord.tipo === 'mesa' ? `Mesa #${ord.mesaNumero}` : 'Domicilio'}
                    </td>
                    <td className="p-3 text-slate-600 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500 mr-1" />
                      <span>{new Date(ord.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="p-3 text-red-600 font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-red-500 mr-1" />
                      <span>{ord.fechaHoraCancelacion ? new Date(ord.fechaHoraCancelacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/D'}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 flex items-center">
                      <User className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                      <span>{ord.creadoPor || 'Desconocido'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{ord.motivoCancelacion || 'Sin motivo'}</span>
                      <span className="block text-[10px] text-slate-400">Anulado por: {ord.canceladoPor || 'Sistema'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE TRANSACCIONES Y PAGOS EXITOSOS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <DollarSign className="w-4 h-4 text-emerald-600 mr-2" /> Historial de Transacciones Exitosas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">ID Transacción</th>
                <th className="p-3">Tipo / Destino</th>
                <th className="p-3">Método</th>
                <th className="p-3">Usuario Cobro</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3 text-right">Propina</th>
                <th className="p-3 text-right">Monto Recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localTxs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 italic">No hay transacciones de pago registradas.</td>
                </tr>
              ) : (
                localTxs.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">#{tx.id.slice(-5)}</td>
                    <td className="p-3 uppercase font-semibold">{tx.tipoTarget}</td>
                    <td className="p-3 capitalize">{tx.metodoPago}</td>
                    <td className="p-3">{tx.usuario}</td>
                    <td className="p-3 text-slate-500">{new Date(tx.fechaHora).toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-amber-600">{Number(tx.propina) > 0 ? `${formatCurrency(tx.propina)} (${tx.propinaMesero})` : '—'}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(tx.monto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}