import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { Modal, Button } from './ui';
import { formatCurrency } from '../utils/helpers';
import Receipt from './Receipt';
import { HandCoins, QrCode } from 'lucide-react';

const TIP_PERCENTS = [5, 10, 15];

export default function PaymentModal({ isOpen, onClose, targetItem, type }) {
  const { currentUser, paymentConfig, processPayment, orders, establishments } = useApp();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [leavesTip, setLeavesTip] = useState(false);
  const [tipInput, setTipInput] = useState('');
  const [completedReceipt, setCompletedReceipt] = useState(null);

  if (!isOpen || !targetItem) return null;

  const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

  // Solo los métodos de pago del local actual
  const localConfigs = paymentConfig.filter(c => sameCode(c.codigoEstablecimiento, currentUser.codigoEstablecimiento));
  const metodo = selectedMethod || localConfigs.find(c => c.habilitado)?.tipo || 'efectivo';
  const activeConfig = localConfigs.find(c => c.tipo === metodo);
  const establishment = establishments.find(e => sameCode(e.codigo, currentUser.codigoEstablecimiento));

  let currentItems = [];
  let calculatedTotal = 0;
  let mesaOrders = [];

  if (type === 'mesa') {
    mesaOrders = orders.filter(
      o => sameCode(o.codigoEstablecimiento, targetItem.codigoEstablecimiento) &&
           Number(o.mesaNumero) === Number(targetItem.numero) &&
           o.estado !== 'pagado' && o.estado !== 'cancelado'
    );
    currentItems = mesaOrders.flatMap(o => o.items || []);
  } else {
    currentItems = targetItem.items || [];
  }
  calculatedTotal = currentItems.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
  if (calculatedTotal === 0 && targetItem.total) calculatedTotal = Number(targetItem.total);

  // El mesero que abrió la mesa es quien recibe la propina
  const meseroAtendio = type === 'mesa'
    ? ([...mesaOrders].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))[0]?.creadoPor || currentUser.nombreUsuario)
    : null;

  const propina = type === 'mesa' && leavesTip ? Math.max(0, Math.round(Number(tipInput) || 0)) : 0;
  const totalACobrar = calculatedTotal + propina;

  const hasUndeliveredOrders = type === 'mesa' && mesaOrders.some(o => o.estado !== 'entregado');

  const resetAndClose = () => {
    setCompletedReceipt(null);
    setSelectedMethod(null);
    setLeavesTip(false);
    setTipInput('');
    onClose();
  };

  const handlePay = () => {
    if (hasUndeliveredOrders) {
      alert('⚠️ Acción no permitida: No se puede cobrar la cuenta porque hay pedidos que aún no han sido marcados como "Entregados" al cliente.');
      return;
    }
    if (calculatedTotal <= 0) {
      alert('⚠️ El monto a cobrar no puede ser $0.');
      return;
    }
    if (leavesTip && propina <= 0) {
      alert('Indique cuánta propina deja el cliente, o desmarque la propina.');
      return;
    }

    const receipt = processPayment({
      targetId: targetItem.id,
      tipoTarget: type,
      metodo,
      monto: calculatedTotal,
      items: currentItems,
      propina,
      meseroPropina: meseroAtendio
    });
    setCompletedReceipt(receipt);
  };

  if (completedReceipt) {
    return (
      <Modal isOpen={isOpen} onClose={resetAndClose} title="Pago Exitoso">
        <Receipt order={completedReceipt} onClose={resetAndClose} />
      </Modal>
    );
  }

  const qrValue = `${activeConfig?.cuentaBancariaCifrada || establishment?.nombre || 'Pago'} | Monto: ${totalACobrar} COP`;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={`Registrar Pago (${type === 'mesa' ? `Mesa #${targetItem.numero}` : 'Domicilio'})`}>
      <div className="space-y-4">
        {hasUndeliveredOrders && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium">
            🚫 <strong>Cobro Bloqueado:</strong> Para poder cobrar esta mesa, todos los platos deben haber sido preparados por cocina y <u>entregados físicamente al cliente</u> (botón Entregado).
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase">Detalle de Ítems en Cuenta:</label>
          <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {currentItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center">No hay ítems registrados en esta cuenta.</p>
            ) : (
              currentItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-bold">{formatCurrency((item.precio || 0) * (item.cantidad || 0))}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase">¿Cómo va a pagar el cliente?</label>
          <div className="grid grid-cols-2 gap-3">
            {localConfigs.map(cfg => (
              <button
                key={cfg.id}
                disabled={!cfg.habilitado}
                onClick={() => setSelectedMethod(cfg.tipo)}
                className={`p-3 rounded-2xl border font-bold text-xs capitalize transition-all ${metodo === cfg.tipo ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'} ${!cfg.habilitado ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {cfg.tipo}
                {!cfg.habilitado && <span className="block text-[10px] text-red-500 mt-1">No habilitado</span>}
              </button>
            ))}
          </div>
        </div>

        {type === 'mesa' && (
          <div className="space-y-2 bg-amber-50/60 border border-amber-200 rounded-2xl p-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={leavesTip}
                onChange={e => { setLeavesTip(e.target.checked); if (!e.target.checked) setTipInput(''); }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900 flex items-center"><HandCoins className="w-4 h-4 mr-1" /> El cliente deja propina</span>
            </label>

            {leavesTip && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {TIP_PERCENTS.map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipInput(String(Math.round(calculatedTotal * pct / 100)))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                    >
                      {pct}% ({formatCurrency(Math.round(calculatedTotal * pct / 100))})
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="Valor de la propina (COP)"
                  value={tipInput}
                  onChange={e => setTipInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-700">La propina queda a nombre de <strong>{meseroAtendio}</strong> y le llega al gerente.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex justify-between text-xs text-slate-500"><span>Consumo</span><span>{formatCurrency(calculatedTotal)}</span></div>
          {propina > 0 && <div className="flex justify-between text-xs text-amber-700"><span>Propina</span><span>{formatCurrency(propina)}</span></div>}
          <div className="flex justify-between items-end pt-1">
            <span className="text-xs font-bold text-slate-600">Total a cobrar</span>
            <span className="text-2xl font-black text-emerald-600">{formatCurrency(totalACobrar)}</span>
          </div>
        </div>

        {metodo === 'transferencia' && (
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center space-y-2 bg-white">
            <p className="text-xs font-bold text-slate-700 flex items-center"><QrCode className="w-4 h-4 mr-1 text-amber-600" /> Muéstrele este QR al cliente para que transfiera {formatCurrency(totalACobrar)}</p>
            {activeConfig?.qrImagen ? (
              <img src={activeConfig.qrImagen} alt="QR de pago del local" className="w-44 h-44 object-contain rounded-xl border border-slate-200" />
            ) : (
              <>
                <div className="p-2 bg-white border border-slate-200 rounded-xl">
                  <QRCodeSVG value={qrValue} size={160} />
                </div>
                <p className="text-[10px] text-slate-400 text-center max-w-xs">
                  QR de demostración con los datos de la cuenta. Para usar el QR real de su banco, el gerente lo sube en Gerencia → Métodos de Pago.
                </p>
              </>
            )}
            {activeConfig?.cuentaBancariaCifrada && <p className="text-xs font-semibold text-slate-600">{activeConfig.cuentaBancariaCifrada}</p>}
          </div>
        )}

        <div className="pt-2 flex space-x-2">
          <Button onClick={resetAndClose} variant="outline" className="w-1/2 py-3 text-xs">
            Cancelar
          </Button>
          <Button
            disabled={hasUndeliveredOrders}
            onClick={handlePay}
            variant="primary"
            className="w-1/2 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            {metodo === 'transferencia' ? 'Transferencia recibida' : 'Confirmar cobro'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
