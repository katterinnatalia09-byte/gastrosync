import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';
import { ChefHat, CheckCircle2, Clock, PlusCircle } from 'lucide-react';

const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();
const hora = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Cocina() {
  const { currentUser, orders, updateOrdersStatus } = useApp();

  const pendientes = orders
    .filter(o => sameCode(o.codigoEstablecimiento, currentUser.codigoEstablecimiento) && o.estado === 'pendiente')
    .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

  // Todas las comandas pendientes de una misma mesa (pedido + adicionales) salen juntas en UNA tarjeta.
  // Los domicilios van cada uno en su propia tarjeta.
  const grupos = [];
  pendientes.forEach(o => {
    if (o.tipo === 'mesa') {
      const existente = grupos.find(g => g.tipo === 'mesa' && Number(g.mesaNumero) === Number(o.mesaNumero));
      if (existente) { existente.pedidos.push(o); return; }
      grupos.push({ clave: 'mesa-' + o.mesaNumero, tipo: 'mesa', mesaNumero: o.mesaNumero, pedidos: [o] });
    } else {
      grupos.push({ clave: o.id, tipo: o.tipo, pedidos: [o] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pantalla de Cocina en Tiempo Real</h2>
          <p className="text-xs text-slate-500">Comandas pendientes. Los adicionales de una mesa salen juntos en la misma tarjeta.</p>
        </div>
        <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-xl font-bold text-xs">
          <ChefHat className="w-4 h-4" />
          <span>{grupos.length} Pendientes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupos.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay comandas pendientes en este momento. Todo al día.</p>
          </div>
        ) : (
          grupos.map(grupo => {
            const primera = grupo.pedidos[0];
            const soloAdicional = grupo.pedidos.every(p => p.esAdicional);
            const hayAdicional = grupo.pedidos.some(p => p.esAdicional);
            const esDomicilio = grupo.tipo === 'domicilio';

            return (
              <div key={grupo.clave} className={`bg-white border rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 ${hayAdicional ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {esDomicilio ? 'Domicilio' : `Mesa #${grupo.mesaNumero}`}
                    </span>
                    {soloAdicional && (
                      <span className="ml-1 text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-md">Adicional</span>
                    )}
                    {!soloAdicional && hayAdicional && (
                      <span className="ml-1 text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-md">Con adicional</span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900">
                      {grupo.pedidos.length === 1 ? `Orden #${primera.id.slice(-5)}` : `${grupo.pedidos.length} comandas de la misma mesa`}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{hora(primera.fechaHora)}</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {grupo.pedidos.map(pedido => (
                    <div key={pedido.id} className="space-y-1.5">
                      {!esDomicilio && grupo.pedidos.length > 1 && (
                        <p className={`text-[10px] font-bold uppercase flex items-center ${pedido.esAdicional ? 'text-amber-700' : 'text-slate-500'}`}>
                          {pedido.esAdicional && <PlusCircle className="w-3 h-3 mr-1" />}
                          {pedido.esAdicional ? 'Adicional' : 'Pedido inicial'} · {hora(pedido.fechaHora)}
                        </p>
                      )}
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                          <span className="font-bold text-slate-800">{item.cantidad}x {item.nombre}</span>
                          {item.observacion && <span className="text-[10px] text-amber-600 italic">Nota: {item.observacion}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Button
                    onClick={() => updateOrdersStatus(grupo.pedidos.map(p => p.id), 'listo')}
                    variant="primary"
                    className="w-full text-xs py-2.5 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {esDomicilio ? 'Despachar: listo para el domiciliario' : 'Marcar como Listo / Preparado'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
