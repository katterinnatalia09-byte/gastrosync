import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useOrderDraft } from '../hooks/useOrderDraft';
import MenuPicker from '../components/MenuPicker';
import OrderComposer from '../components/OrderComposer';
import { Button, Modal, Input } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { PhoneCall, MapPin, PlusCircle, Bike, CheckCircle2, KeyRound, XCircle } from 'lucide-react';

export default function CallCenter() {
  const { currentUser, orders, createOrder, cancelOrder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteData, setClienteData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    metodoPago: 'efectivo'
  });
  const [costoDomicilio, setCostoDomicilio] = useState('');
  const [dejaPropina, setDejaPropina] = useState(false);
  const [propinaInput, setPropinaInput] = useState('');
  const draft = useOrderDraft();

  const localOrders = orders.filter(
    o => String(o.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase() &&
         o.tipo === 'domicilio'
  );

  const handleConfirmDomicilio = () => {
    if (!clienteData.nombre || !clienteData.telefono || !clienteData.direccion) {
      alert('Por favor complete los datos del cliente (Nombre, Teléfono y Dirección).');
      return;
    }
    if (draft.items.length === 0) {
      alert('Debe agregar al menos un producto al pedido.');
      return;
    }

    if (costoDomicilio === '' || Number(costoDomicilio) < 0) {
      alert('Indique el costo del domicilio según el destino (puede ser 0 si es gratis).');
      return;
    }
    const tarifa = Math.round(Number(costoDomicilio));

    const propina = dejaPropina ? Math.max(0, Math.round(Number(propinaInput) || 0)) : 0;
    if (dejaPropina && propina <= 0) {
      alert('Indique cuánta propina deja el cliente, o desmarque la propina.');
      return;
    }

    const codigoVerificacion = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      createOrder({
        tipo: 'domicilio',
        clienteData: { 
          ...clienteData, 
          propina,
          costoDomicilio: tarifa,
          codigoVerificacion 
        },
        items: draft.items
      });
      alert(`¡Pedido enviado a cocina!\n\n🔑 CÓDIGO DE VERIFICACIÓN PARA EL DOMICILIARIO: [ ${codigoVerificacion} ]\n(Indíqueselo al cliente o anótelo).`);
      
      draft.clearDraft();
      setClienteData({ nombre: '', telefono: '', direccion: '', metodoPago: 'efectivo' });
      setCostoDomicilio('');
      setDejaPropina(false);
      setPropinaInput('');
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelDomicilioOrder = (orderId) => {
    const motivo = prompt('Ingrese el motivo de la cancelación del domicilio (Ej: Cliente se arrepintió / Número falso):');
    if (!motivo) return;
    cancelOrder(orderId, motivo);
  };

  const estadoLabel = {
    pendiente: 'En cocina',
    listo: 'Listo - espera domiciliario',
    en_camino: 'En camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  const estadoStyle = {
    pendiente: 'bg-blue-100 text-blue-800',
    listo: 'bg-amber-100 text-amber-800',
    en_camino: 'bg-indigo-100 text-indigo-800',
    entregado: 'bg-emerald-100 text-emerald-800',
    cancelado: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <PhoneCall className="w-6 h-6 text-amber-600 mr-2" /> Módulo de Recepción y Toma de Domicilios (Call Center)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Flujo del domicilio: Call Center → Cocina → Domiciliario → Entregado. Aquí registra el pedido y le hace seguimiento.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="text-xs font-bold bg-amber-600 hover:bg-amber-700 py-3 px-4 shadow-md"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Tomar Nuevo Pedido a Domicilio
        </Button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Historial de Domicilios Registrados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">ID Orden</th>
                <th className="p-3">Cliente / Teléfono</th>
                <th className="p-3">Dirección de Destino</th>
                <th className="p-3">PIN Seg.</th>
                <th className="p-3">Método de Pago</th>
                <th className="p-3">Estado Actual</th>
                <th className="p-3 text-right">Total / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 italic">No hay pedidos a domicilio registrados todavía.</td>
                </tr>
              ) : (
                localOrders.map(ord => {
                  const c = ord.clienteData || {};
                  const tMonto = ord.items.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
                  const isActivo = ['pendiente', 'listo', 'en_camino'].includes(ord.estado);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">#{ord.id.slice(-5)}</td>
                      <td className="p-3">
                        <span className="font-bold block text-slate-900">{c.nombre || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500">{c.telefono || 'Sin teléfono'}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{c.direccion || 'Sin dirección'}</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                          {c.codigoVerificacion || '----'}
                        </span>
                      </td>
                      <td className="p-3 uppercase font-bold text-emerald-600">{c.metodoPago || 'Efectivo'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${estadoStyle[ord.estado] || 'bg-slate-100 text-slate-700'}`}>
                          {estadoLabel[ord.estado] || ord.estado}
                        </span>
                        {ord.domiciliario && <span className="block text-[10px] text-slate-400 mt-0.5">Domiciliario: {ord.domiciliario}</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-black text-slate-900">
                            {formatCurrency(tMonto)}
                            {Number(c.costoDomicilio) > 0 && <span className="block text-[10px] font-bold text-indigo-600">+ domicilio {formatCurrency(c.costoDomicilio)}</span>}
                            {Number(c.propina) > 0 && <span className="block text-[10px] font-bold text-amber-600">+ propina {formatCurrency(c.propina)}</span>}
                          </span>
                          {isActivo && (
                            <button
                              onClick={() => handleCancelDomicilioOrder(ord.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center"
                              title="Cancelar Domicilio"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADAPTADO CON ANCHO MÁXIMO GRANDE (max-w-4xl) PARA PANTALLA COMPLETA */}
      <Modal size="xl" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Pedido Telefónico a Domicilio">
        <div className="space-y-4 max-h-[82vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre del Cliente" placeholder="ej. María Gómez" value={clienteData.nombre} onChange={e => setClienteData({...clienteData, nombre: e.target.value})} required />
            <Input label="Teléfono de Contacto" placeholder="ej. 3201234567" value={clienteData.telefono} onChange={e => setClienteData({...clienteData, telefono: e.target.value})} required />
          </div>

          <Input label="Dirección de Destino" placeholder="ej. Calle 15 # 8-40 Barrio San Luis" value={clienteData.direccion} onChange={e => setClienteData({...clienteData, direccion: e.target.value})} required />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">Método de Pago:</label>
            <select
              value={clienteData.metodoPago}
              onChange={e => setClienteData({...clienteData, metodoPago: e.target.value})}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="efectivo">Efectivo (Contra Entrega)</option>
              <option value="transferencia">Transferencia Bancaria (Nequi / Daviplata)</option>
              <option value="tarjeta">Tarjeta (Datáfono en ruta)</option>
            </select>
          </div>

          <div className="space-y-1 bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3">
            <label className="block text-xs font-bold text-indigo-900 uppercase">Costo del domicilio (COP) *</label>
            <input
              type="number"
              min="0"
              placeholder="Según el destino. Ej. La Zulia: 15000"
              value={costoDomicilio}
              onChange={e => setCostoDomicilio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-indigo-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-indigo-700">Se le cobra al cliente además de los platos y es la paga del domiciliario por este viaje. Queda registrado para el gerente.</p>
          </div>

          <div className="space-y-2 bg-amber-50/60 border border-amber-200 rounded-2xl p-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dejaPropina}
                onChange={e => { setDejaPropina(e.target.checked); if (!e.target.checked) setPropinaInput(''); }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900">El cliente deja propina (es para usted, quien tomó el pedido)</span>
            </label>
            {dejaPropina && (
              <div className="flex flex-wrap items-center gap-2">
                {[5, 10].map(pct => {
                  const base = draft.items.reduce((acc, i) => acc + Number(i.precio) * Number(i.cantidad), 0);
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPropinaInput(String(Math.round(base * pct / 100)))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                    >
                      {pct}% ({formatCurrency(Math.round(base * pct / 100))})
                    </button>
                  );
                })}
                <input
                  type="number"
                  min="0"
                  placeholder="Valor de la propina (COP)"
                  value={propinaInput}
                  onChange={e => setPropinaInput(e.target.value)}
                  className="flex-1 min-w-[180px] p-2.5 rounded-xl border border-amber-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Platos Solicitados por el Cliente:</p>
            
            {/* Contenedor amplio que luce perfecto en computadores y pantallas completas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase">Seleccionar del Menú:</p>
                <MenuPicker onSelectItem={draft.addItem} wide />
              </div>
              <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <OrderComposer
                  draftItems={draft.items}
                  onUpdateQty={draft.updateQuantity}
                  onRemoveItem={draft.removeItem}
                  onUpdateObs={draft.updateObservation}
                  onConfirmOrder={() => {}}
                  hideConfirmButton={true}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex space-x-3 sticky bottom-0 bg-white py-2">
            <Button onClick={() => setIsModalOpen(false)} variant="outline" className="w-1/2 py-3 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleConfirmDomicilio} variant="primary" className="w-1/2 py-3 text-xs font-bold bg-amber-600 hover:bg-amber-700">
              Enviar Pedido a Cocina
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}