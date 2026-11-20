import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { Button, Input } from './ui';
import { Trash2 } from 'lucide-react';

export default function OrderComposer({ draftItems, onUpdateQty, onRemoveItem, onUpdateObs, onConfirmOrder, isSubmitting, hideConfirmButton = false }) {
  const total = draftItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalItemsCount = draftItems.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-md flex flex-col h-full">
      <h3 className="font-bold text-base text-slate-900 mb-3 flex justify-between items-center">
        <span>Comanda Actual</span>
        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
          {totalItemsCount} ítems{hideConfirmButton ? '' : ' (Máx. 5)'}
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1 divide-y divide-slate-100">
        {draftItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No hay productos agregados a la comanda.</p>
        ) : (
          draftItems.map(item => (
            <div key={item.id} className="pt-3 first:pt-0 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{item.nombre}</h4>
                  <p className="text-xs text-amber-600 font-semibold">{formatCurrency(item.precio * item.cantidad)}</p>
                </div>
                <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs">-</button>
                  <span className="text-xs font-bold w-6 text-center">{item.cantidad}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs">+</button>
                </div>
                <input
                  type="text"
                  placeholder="Nota (ej. sin cebolla)"
                  value={item.observacion}
                  onChange={(e) => onUpdateObs(item.id, e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-slate-600">Total Comanda:</span>
          <span className="text-lg text-slate-900">{formatCurrency(total)}</span>
        </div>
        {!hideConfirmButton && (
          <Button
            disabled={draftItems.length === 0 || totalItemsCount > 5 || isSubmitting}
            onClick={onConfirmOrder}
            variant="primary"
            className="w-full py-3 text-sm font-bold shadow-lg"
          >
            {isSubmitting ? 'Enviando a Cocina...' : 'Enviar Comanda a Cocina'}
          </Button>
        )}
      </div>
    </div>
  );
}