import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Modal } from '../../components/ui';
import EmployeeCredential, { Avatar } from '../../components/EmployeeCredential';
import { formatCurrency } from '../../utils/helpers';
import { Wallet, HandCoins, History, Banknote, Bike } from 'lucide-react';

const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

export default function Payroll() {
  const { currentUser, users, transactions, payroll, updateEmployee, getPendingTips, getPendingFees, registerPayroll } = useApp();
  const [payingEmp, setPayingEmp] = useState(null);
  const [periodo, setPeriodo] = useState('');
  const [lastPayment, setLastPayment] = useState(null);
  const [credEmp, setCredEmp] = useState(null);

  const code = currentUser.codigoEstablecimiento;
  const empleados = users.filter(u => sameCode(u.codigoEstablecimiento, code) && u.rol !== 'Gerente');
  const localTips = transactions.filter(t => sameCode(t.codigoEstablecimiento, code) && Number(t.propina) > 0);
  const localViajes = transactions.filter(t => sameCode(t.codigoEstablecimiento, code) && t.tipoTarget === 'domicilio');
  const localPayroll = payroll.filter(p => sameCode(p.codigoEstablecimiento, code));

  const nombreDe = (usuario) => {
    const e = users.find(u => sameCode(u.codigoEstablecimiento, code) && u.nombreUsuario === usuario);
    return e?.nombreCompleto || usuario;
  };

  const rows = empleados.map(emp => {
    const propinasPend = getPendingTips(emp.nombreUsuario).reduce((acc, t) => acc + Number(t.propina), 0);
    const domiciliosPend = getPendingFees(emp.nombreUsuario).reduce((acc, t) => acc + Number(t.costoDomicilio), 0);
    const salario = Number(emp.salario) || 0;
    return { emp, salario, propinasPend, domiciliosPend, total: salario + propinasPend + domiciliosPend };
  });

  const totalPropinasPendientes = rows.reduce((acc, r) => acc + r.propinasPend, 0);
  const totalPagado = localPayroll.reduce((acc, p) => acc + p.total, 0);
  const totalAPagarHoy = rows.reduce((acc, r) => acc + r.total, 0);

  const openPay = (row) => { setPayingEmp(row); setPeriodo(''); setLastPayment(null); };

  const confirmPay = () => {
    const record = registerPayroll({ empleado: payingEmp.emp, periodo: periodo.trim() });
    setLastPayment(record);
  };

  const closeModal = () => { setPayingEmp(null); setLastPayment(null); setPeriodo(''); };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Total a pagar a empleados hoy</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalAPagarHoy)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Propinas pendientes de entregar</p>
          <p className="text-2xl font-black text-amber-600">{formatCurrency(totalPropinasPendientes)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs text-slate-500">Total pagado históricamente</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalPagado)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center"><Wallet className="w-4 h-4 text-purple-600 mr-2" /> Pago a Empleados</h3>
          <p className="text-xs text-slate-500">Defina el salario de cada empleado. Al pagar, se suman las propinas que ha recibido y quedan marcadas como entregadas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Empleado</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Salario (COP)</th>
                <th className="p-3">Domicilios (viajes)</th>
                <th className="p-3">Propinas acumuladas</th>
                <th className="p-3">Total a pagar</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-slate-400 italic">No hay empleados registrados. Créelos en la pestaña Empleados.</td></tr>
              ) : rows.map(r => (
                <tr key={r.emp.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <button onClick={() => setCredEmp(r.emp)} className="flex items-center space-x-3 text-left hover:opacity-80" title="Ver credencial">
                      <Avatar emp={r.emp} />
                      <span>
                        <span className="block font-bold text-slate-900">{r.emp.nombreCompleto || r.emp.nombreUsuario}</span>
                        <span className="block text-[10px] text-slate-400">@{r.emp.nombreUsuario}</span>
                      </span>
                    </button>
                  </td>
                  <td className="p-3 text-slate-600">{r.emp.rol}</td>
                  <td className="p-3">
                    <input
                      key={r.emp.id + '-' + r.salario}
                      type="number"
                      min="0"
                      defaultValue={r.salario}
                      onBlur={e => {
                        const nuevo = Math.max(0, Number(e.target.value) || 0);
                        if (nuevo !== r.salario) updateEmployee(r.emp.id, { salario: nuevo });
                      }}
                      className="w-32 p-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-indigo-600">{formatCurrency(r.domiciliosPend)}</td>
                  <td className="p-3 font-bold text-amber-600">{formatCurrency(r.propinasPend)}</td>
                  <td className="p-3 font-black text-slate-900">{formatCurrency(r.total)}</td>
                  <td className="p-3 text-right">
                    <Button
                      disabled={r.total <= 0}
                      onClick={() => openPay(r)}
                      variant="primary"
                      className="text-[11px] py-1.5 px-3 bg-purple-600 hover:bg-purple-700 ml-auto"
                    >
                      <Banknote className="w-3.5 h-3.5 mr-1" /> Pagar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center"><Bike className="w-4 h-4 text-indigo-600 mr-2" /> Domicilios entregados y tarifa cobrada</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Fecha y hora</th>
                <th className="p-3">Domiciliario</th>
                <th className="p-3">Cliente / Destino</th>
                <th className="p-3">Estado de pago</th>
                <th className="p-3 text-right">Tarifa del viaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localViajes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-slate-400 italic">Aún no hay domicilios entregados.</td></tr>
              ) : localViajes.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{new Date(t.fechaHora).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900">{nombreDe(t.domiciliario)}</td>
                  <td className="p-3">{t.clienteNombre || '—'}<span className="block text-[10px] text-slate-400">{t.destino}</span></td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${t.tarifaLiquidada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {Number(t.costoDomicilio) > 0 ? (t.tarifaLiquidada ? 'Pagada' : 'Pendiente') : 'Sin tarifa'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600">{formatCurrency(t.costoDomicilio || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center"><HandCoins className="w-4 h-4 text-amber-600 mr-2" /> Propinas recibidas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Fecha y hora</th>
                <th className="p-3">Origen</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Método</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Propina</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localTips.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-400 italic">Aún no se han registrado propinas.</td></tr>
              ) : localTips.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{new Date(t.fechaHora).toLocaleString()}</td>
                  <td className="p-3">{t.tipoTarget === 'domicilio' ? 'Domicilio (Call Center)' : (t.mesaNumero ? `Mesa #${t.mesaNumero}` : '—')}</td>
                  <td className="p-3 font-bold text-slate-900">{nombreDe(t.propinaMesero)}</td>
                  <td className="p-3 capitalize">{t.metodoPago}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${t.propinaLiquidada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {t.propinaLiquidada ? 'Entregada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(t.propina)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center"><History className="w-4 h-4 text-slate-600 mr-2" /> Historial de pagos a empleados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Periodo / Nota</th>
                <th className="p-3">Salario</th>
                <th className="p-3">Domicilios</th>
                <th className="p-3">Propinas</th>
                <th className="p-3 text-right">Total pagado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localPayroll.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-slate-400 italic">Todavía no se ha registrado ningún pago.</td></tr>
              ) : localPayroll.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{new Date(p.fechaHora).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900">{nombreDe(p.empleado)} <span className="font-normal text-slate-400">({p.rol})</span></td>
                  <td className="p-3">{p.periodo || '—'}</td>
                  <td className="p-3">{formatCurrency(p.salario)}</td>
                  <td className="p-3 text-indigo-600">{formatCurrency(p.domicilios || 0)}{p.viajes ? ` (${p.viajes})` : ''}</td>
                  <td className="p-3 text-amber-600">{formatCurrency(p.propinas)}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{formatCurrency(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={Boolean(credEmp)} onClose={() => setCredEmp(null)} title="Credencial del empleado">
        {credEmp && <EmployeeCredential emp={credEmp} />}
      </Modal>

      <Modal isOpen={Boolean(payingEmp)} onClose={closeModal} title={lastPayment ? 'Pago registrado' : `Pagar a ${payingEmp?.emp.nombreCompleto || payingEmp?.emp.nombreUsuario}`}>
        {lastPayment ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-sm">✅ Pago registrado a {lastPayment.empleado}</p>
              <p>Salario: {formatCurrency(lastPayment.salario)} · Domicilios: {formatCurrency(lastPayment.domicilios || 0)} · Propinas: {formatCurrency(lastPayment.propinas)}</p>
              <p className="text-base font-black">Total entregado: {formatCurrency(lastPayment.total)}</p>
            </div>
            <Button onClick={closeModal} variant="primary" className="w-full py-2.5 text-xs font-bold">Cerrar</Button>
          </div>
        ) : payingEmp && (
          <div className="space-y-4">
            <EmployeeCredential emp={payingEmp.emp} />
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Salario</span><span className="font-bold">{formatCurrency(payingEmp.salario)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Domicilios (tarifas de viajes)</span><span className="font-bold text-indigo-600">{formatCurrency(payingEmp.domiciliosPend)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Propinas acumuladas</span><span className="font-bold text-amber-600">{formatCurrency(payingEmp.propinasPend)}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm"><span className="font-bold">Total a pagar</span><span className="font-black text-emerald-600">{formatCurrency(payingEmp.total)}</span></div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase">Periodo o nota (opcional)</label>
              <input
                value={periodo}
                onChange={e => setPeriodo(e.target.value)}
                placeholder="ej. Quincena 1-15 de noviembre"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={closeModal} variant="outline" className="w-1/2 py-2.5 text-xs">Cancelar</Button>
              <Button onClick={confirmPay} variant="primary" className="w-1/2 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700">Confirmar pago</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
