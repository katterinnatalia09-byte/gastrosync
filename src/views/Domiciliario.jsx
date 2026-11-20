import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Modal, Input } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { Bike, MapPin, Phone, DollarSign, Clock, KeyRound, PackageCheck, Navigation } from 'lucide-react';

const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

export default function Domiciliario() {
  const { currentUser, orders, takeDelivery, completeDelivery } = useApp();

  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [inputPin, setInputPin] = useState('');

  const localDomicilios = orders.filter(
    o => sameCode(o.codigoEstablecimiento, currentUser.codigoEstablecimiento) && o.tipo === 'domicilio'
  );

  // 1) Cocina ya los despachó: están listos para que un domiciliario los recoja
  const listosParaRecoger = localDomicilios.filter(o => o.estado === 'listo');
  // 2) Los que ESTE domiciliario ya recogió y está entregando. Al entregarse desaparecen de la lista.
  const enRuta = localDomicilios.filter(o => o.estado === 'en_camino' && o.domiciliario === currentUser.nombreUsuario);
  const enPreparacion = localDomicilios.filter(o => o.estado === 'pendiente').length;

  const handleVerifyAndDeliver = (e) => {
    e.preventDefault();
    if (!verifyingOrder) return;

    const correctPin = verifyingOrder.clienteData?.codigoVerificacion;
    if (correctPin && inputPin.trim() !== String(correctPin)) {
      alert('❌ Código de verificación incorrecto. Por favor verifique el PIN con el cliente.');
      return;
    }

    completeDelivery(verifyingOrder.id);
    setVerifyingOrder(null);
    setInputPin('');
  };

  const renderCard = (order, modo) => {
    const cliente = order.clienteData || {};
    const totalMonto = order.items.reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
    const enCamino = modo === 'ruta';
    const propina = Number(cliente.propina) || 0;
    const tarifa = Number(cliente.costoDomicilio) || 0;

    return (
      <div key={order.id} className={`bg-white border rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 ${enCamino ? 'border-indigo-300' : 'border-slate-200'}`}>
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${enCamino ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
              Domicilio #{order.id.slice(-5)}
            </span>
            <h4 className="font-extrabold text-sm text-slate-900 mt-1">{cliente.nombre || 'Cliente General'}</h4>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(order.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-start space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[10px] text-slate-400 uppercase">Dirección de Destino:</span>
              <span className="font-semibold text-slate-900">{cliente.direccion || 'Sin dirección registrada'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <Phone className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-bold text-[10px] text-slate-400 uppercase">Teléfono:</span>
              <span className="font-semibold text-slate-900 ml-1">{cliente.telefono || 'Sin teléfono'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-700 pt-1 border-t border-slate-200">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-[10px] text-slate-400 uppercase">Método de Pago / Cobro:</span>
              <span className="font-bold uppercase text-emerald-700 ml-1">{cliente.metodoPago || 'Efectivo'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Productos a Llevar:</p>
          <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-2 rounded-xl border border-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-slate-700">{item.cantidad}x {item.nombre}</span>
                <span className="font-bold">{formatCurrency((item.precio || 0) * (item.cantidad || 0))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="flex justify-between text-xs text-slate-500"><span>Platos:</span><span>{formatCurrency(totalMonto)}</span></div>
          <div className="flex justify-between text-xs text-indigo-700 font-semibold"><span>Domicilio (su pago por este viaje):</span><span>{formatCurrency(tarifa)}</span></div>
          {propina > 0 && (
            <div className="flex justify-between text-xs text-amber-700 font-semibold">
              <span>Propina:</span>
              <span>{formatCurrency(propina)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-600">Total a Cobrar al cliente:</span>
            <span className="text-base font-black text-emerald-600">{formatCurrency(totalMonto + tarifa + propina)}</span>
          </div>
        </div>

        <div className="pt-1">
          {enCamino ? (
            <Button
              onClick={() => { setVerifyingOrder(order); setInputPin(''); }}
              variant="primary"
              className="w-full text-xs py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              <KeyRound className="w-4 h-4 mr-1" /> Validar Código y Confirmar Entrega
            </Button>
          ) : (
            <Button
              onClick={() => takeDelivery(order.id)}
              variant="primary"
              className="w-full text-xs py-2.5 font-bold bg-indigo-600 hover:bg-indigo-700"
            >
              <Navigation className="w-4 h-4 mr-1" /> Recoger Pedido y Salir a Entregar
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Bike className="w-6 h-6 text-emerald-600 mr-2" /> Panel de Domiciliario (Logística de Entrega)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Cuando cocina despacha un pedido aparece aquí. Al entregarlo con el PIN del cliente, desaparece de su lista.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-xl font-bold text-xs">{listosParaRecoger.length} Listos para recoger</div>
          <div className="bg-indigo-100 text-indigo-800 px-3.5 py-1.5 rounded-xl font-bold text-xs">{enRuta.length} En ruta</div>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center">
          <PackageCheck className="w-4 h-4 text-amber-600 mr-2" /> Listos para recoger en cocina
          {enPreparacion > 0 && <span className="ml-2 text-[11px] font-medium text-slate-400">({enPreparacion} aún en preparación)</span>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listosParaRecoger.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
              <Bike className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-sm font-medium">No hay pedidos listos para recoger en este momento.</p>
            </div>
          ) : listosParaRecoger.map(o => renderCard(o, 'listo'))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center">
          <Navigation className="w-4 h-4 text-indigo-600 mr-2" /> Mis entregas en ruta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enRuta.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
              <p className="text-sm font-medium">No lleva ninguna entrega en ruta.</p>
            </div>
          ) : enRuta.map(o => renderCard(o, 'ruta'))}
        </div>
      </section>

      <Modal isOpen={Boolean(verifyingOrder)} onClose={() => setVerifyingOrder(null)} title="Validación de Entrega por PIN">
        <form onSubmit={handleVerifyAndDeliver} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">🔒 Seguridad de Entrega</p>
            <p>Solicite al cliente el <strong>código PIN de 4 dígitos</strong> generado al tomar el pedido. Al confirmar, la entrega se elimina de su lista.</p>
          </div>

          <Input
            label="Ingrese el Código PIN del Cliente"
            placeholder="ej. 4829"
            maxLength={4}
            value={inputPin}
            onChange={e => setInputPin(e.target.value)}
            required
            className="text-center font-mono text-lg tracking-widest font-bold"
          />

          <div className="pt-2 flex space-x-2">
            <Button type="button" onClick={() => setVerifyingOrder(null)} variant="outline" className="w-1/2 py-2.5 text-xs">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="w-1/2 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
              Confirmar Entrega
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
