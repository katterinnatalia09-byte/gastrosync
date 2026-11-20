import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useOrderDraft } from '../hooks/useOrderDraft';
import MenuPicker from '../components/MenuPicker';
import OrderComposer from '../components/OrderComposer';
import AvailabilityBoard from '../components/AvailabilityBoard';
import PaymentModal from '../components/PaymentModal';
import { Button, Modal } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { Utensils, Bell, DollarSign, Eye, CheckCircle, PlusCircle, XCircle } from 'lucide-react';

export default function Mesero() {
  const { currentUser, tables, orders, createOrder, updateOrdersStatus, cancelTableOrder } = useApp();
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [activeTab, setActiveTab] = useState('mesas');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [viewingOccupiedTable, setViewingOccupiedTable] = useState(null);

  const localTables = tables.filter(t => String(t.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());
  const localOrders = orders.filter(o => String(o.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase() && o.tipo === 'mesa');
  const draft = useOrderDraft();

  const handleTableClick = (mesa) => {
    if (mesa.estado === 'ocupada') {
      const activeOrders = localOrders.filter(o => Number(o.mesaNumero) === Number(mesa.numero) && o.estado !== 'pagado' && o.estado !== 'cancelado');
      const allItems = activeOrders.flatMap(o => o.items || []);
      const totalAcumulado = allItems.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);

      setViewingOccupiedTable({
        mesa,
        orders: activeOrders,
        items: allItems,
        total: totalAcumulado
      });
    } else {
      setSelectedMesa(mesa);
    }
  };

  const handleConfirmOrder = () => {
    if (!selectedMesa) return alert('Por favor seleccione una mesa.');
    setIsSubmitting(true);
    try {
      createOrder({
        tipo: 'mesa',
        mesaNumero: selectedMesa.numero,
        items: draft.items
      });
      alert('¡Comanda enviada a cocina con éxito!');
      draft.clearDraft();
      setSelectedMesa(null);
      setActiveTab('mesas');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pedidos listos agrupados por mesa: una sola tarjeta y un solo botón "Entregado" por mesa
  const readyOrders = [];
  localOrders.filter(o => o.estado === 'listo').forEach(o => {
    const grupo = readyOrders.find(g => Number(g.mesaNumero) === Number(o.mesaNumero));
    if (grupo) grupo.pedidos.push(o);
    else readyOrders.push({ mesaNumero: o.mesaNumero, pedidos: [o] });
  });

  const handleMarkAsDelivered = (orderIds) => {
    updateOrdersStatus(orderIds, 'entregado');
  };

  const handleCancelTableOrder = (mesaNumero) => {
    const motivo = prompt('Ingrese el motivo de la cancelación (Ej: Cliente se retira / Error de pedido):');
    if (!motivo) return;

    cancelTableOrder(mesaNumero, motivo);
    setViewingOccupiedTable(null);
    alert('Pedido cancelado con éxito y mesa liberada.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Módulo de Mesero</h2>
          <p className="text-xs text-slate-500">Gestión de mesas, toma de pedidos y control táctil rápido.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant={activeTab === 'mesas' ? 'primary' : 'outline'} onClick={() => setActiveTab('mesas')} className="text-xs">
            Mapa de Mesas
          </Button>
          <Button variant={activeTab === 'disponibilidad' ? 'primary' : 'outline'} onClick={() => setActiveTab('disponibilidad')} className="text-xs">
            Marcar Platos Agotados
          </Button>
        </div>
      </div>

      {readyOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-amber-600 animate-bounce" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">¡Pedidos Listos en Cocina para Recoger y Entregar!</h4>
              <p className="text-xs text-amber-700">Por favor retire los platos de cocina y confirme la entrega.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {readyOrders.map(grupo => (
              <div key={grupo.mesaNumero} className="bg-white p-3 rounded-xl border border-amber-200 flex justify-between items-center shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-800">Mesa #{grupo.mesaNumero}</p>
                  <p className="text-[10px] text-slate-500">{grupo.pedidos.flatMap(o => o.items).map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}</p>
                </div>
                <Button
                  onClick={() => handleMarkAsDelivered(grupo.pedidos.map(o => o.id))}
                  variant="primary"
                  className="text-[10px] py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Entregado
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'disponibilidad' ? (
        <AvailabilityBoard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Estado de Mesas</h3>
            <div className="grid grid-cols-2 gap-3">
              {localTables.map(mesa => (
                <div
                  key={mesa.id}
                  onClick={() => handleTableClick(mesa)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-28 ${selectedMesa?.id === mesa.id ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-500/20' : mesa.estado === 'ocupada' ? 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm">Mesa #{mesa.numero}</span>
                    <span className={`w-3 h-3 rounded-full ${mesa.estado === 'ocupada' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-semibold uppercase">{mesa.estado}</span>
                    {mesa.estado === 'ocupada' ? (
                      <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded-lg font-bold flex items-center space-x-1">
                        <Eye className="w-3 h-3" /> Ver / Gestionar
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Libre</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedMesa ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Menú Disponible (Mesa #{selectedMesa.numero})</h3>
                    <button onClick={() => setSelectedMesa(null)} className="text-xs text-red-500 hover:underline">Cancelar Selección</button>
                  </div>
                  <MenuPicker onSelectItem={draft.addItem} />
                </div>
                <div>
                  <OrderComposer
                    draftItems={draft.items}
                    onUpdateQty={draft.updateQuantity}
                    onRemoveItem={draft.removeItem}
                    onUpdateObs={draft.updateObservation}
                    onConfirmOrder={handleConfirmOrder}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Seleccione una mesa libre del mapa para tomar un nuevo pedido.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(viewingOccupiedTable)}
        onClose={() => setViewingOccupiedTable(null)}
        title={`Detalle de Mesa #${viewingOccupiedTable?.mesa.numero} (Ocupada)`}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <p className="text-xs font-bold text-slate-600 uppercase">Comandas activas de la mesa:</p>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {viewingOccupiedTable?.orders.length || 0} envíos
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {viewingOccupiedTable?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs items-center">
                  <div>
                    <span className="font-bold text-slate-800">{item.cantidad}x {item.nombre}</span>
                    {item.observacion && <span className="block text-[10px] text-amber-600">Nota: {item.observacion}</span>}
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency((item.precio || 0) * (item.cantidad || 0))}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-sm">
              <span className="text-slate-700">Total Acumulado:</span>
              <span className="text-emerald-600 text-base">{formatCurrency(viewingOccupiedTable?.total || 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              onClick={() => {
                const mesaToModify = viewingOccupiedTable.mesa;
                setViewingOccupiedTable(null);
                setSelectedMesa(mesaToModify);
              }}
              variant="outline"
              className="py-3 text-[11px] font-bold border-amber-500 text-amber-700 hover:bg-amber-50 px-1"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Adicionar
            </Button>

            <Button
              onClick={() => {
                const mesaToPay = viewingOccupiedTable.mesa;
                setViewingOccupiedTable(null);
                setPaymentTarget(mesaToPay);
              }}
              variant="primary"
              className="py-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 px-1"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Cobrar
            </Button>

            <Button
              onClick={() => {
                const mesaNum = viewingOccupiedTable.mesa.numero;
                handleCancelTableOrder(mesaNum);
              }}
              variant="danger"
              className="py-3 text-[11px] font-bold bg-red-600 hover:bg-red-700 px-1"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelar
            </Button>
          </div>

          <div className="pt-1">
            <Button
              onClick={() => setViewingOccupiedTable(null)}
              variant="outline"
              className="w-full py-2 text-xs text-slate-500"
            >
              Cerrar Ventana
            </Button>
          </div>
        </div>
      </Modal>

      <PaymentModal
        isOpen={Boolean(paymentTarget)}
        onClose={() => setPaymentTarget(null)}
        targetItem={paymentTarget}
        type="mesa"
      />
    </div>
  );
}