import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchCollection, upsertRows, deleteRows, subscribe, SEED_MARKER } from '../lib/remote';
import {
  initialEstablishments, initialUsers, initialProducts, initialTables, initialPaymentConfig
} from './seed';

const AppContext = createContext();

// ---------- Almacenamiento compartido en Supabase ----------
// Cada colección (pedidos, usuarios, menú...) se guarda como filas individuales en la tabla gs_records.
// Todos los aparatos leen la misma base de datos y reciben los cambios en tiempo real.
const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

// Estas colecciones se muestran de la más nueva a la más vieja
const NEWEST_FIRST = new Set(['gs_orders', 'gs_transactions', 'gs_payroll']);

function useSharedState(key, seed, onError) {
  const [state, setState] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef([]);
  const pending = useRef(0);
  const chain = useRef(Promise.resolve());

  const apply = useCallback((items) => {
    ref.current = items;
    setState(items);
  }, []);

  const toList = useCallback((rows) => {
    const items = rows.filter(r => r.id !== SEED_MARKER).map(r => r.data);
    return NEWEST_FIRST.has(key) ? items.reverse() : items;
  }, [key]);

  // Carga inicial (y siembra los datos de ejemplo la primera vez que se usa la base de datos)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await fetchCollection(key);
        if (seed && !rows.some(r => r.id === SEED_MARKER)) {
          const existing = new Set(rows.map(r => r.id));
          const toInsert = seed.filter(i => !existing.has(i.id)).map(i => ({ collection: key, id: i.id, data: i }));
          await upsertRows([...toInsert, { collection: key, id: SEED_MARKER, data: { seeded: true } }]);
          rows = await fetchCollection(key);
        }
        if (!cancelled) { apply(toList(rows)); setLoaded(true); }
      } catch (err) {
        console.error('Error cargando', key, err);
        if (!cancelled) onError && onError(err);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  // Cambios en tiempo real que vienen de otros aparatos
  useEffect(() => {
    return subscribe(key, (type, row, oldRow) => {
      const current = ref.current;
      if (type === 'DELETE') {
        if (!oldRow || oldRow.id === SEED_MARKER) return;
        apply(current.filter(i => i.id !== oldRow.id));
        return;
      }
      if (!row || row.id === SEED_MARKER) return;
      const exists = current.some(i => i.id === row.id);
      if (exists) apply(current.map(i => i.id === row.id ? row.data : i));
      else apply(NEWEST_FIRST.has(key) ? [row.data, ...current] : [...current, row.data]);
    });
  }, [key]);

  // Red de seguridad: re-sincroniza cada 15 s y al volver a la pestaña
  useEffect(() => {
    const resync = async () => {
      if (!loaded || pending.current > 0) return;
      try {
        const next = toList(await fetchCollection(key));
        if (pending.current === 0 && JSON.stringify(next) !== JSON.stringify(ref.current)) apply(next);
      } catch { /* sin conexión: se reintenta */ }
    };
    const timer = setInterval(resync, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') resync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [key, loaded]);

  const update = useCallback((updater) => {
    const prev = ref.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    apply(next);

    const prevJson = new Map(prev.map(i => [i.id, JSON.stringify(i)]));
    const nextIds = new Set(next.map(i => i.id));
    const upserts = next
      .filter(i => prevJson.get(i.id) !== JSON.stringify(i))
      .map(i => ({ collection: key, id: i.id, data: i }));
    const removed = prev.filter(i => !nextIds.has(i.id)).map(i => i.id);
    if (!upserts.length && !removed.length) return;

    pending.current += 1;
    chain.current = chain.current
      .then(async () => {
        await upsertRows(upserts);
        await deleteRows(key, removed);
      })
      .catch(err => {
        console.error('Error guardando', key, err);
        onError && onError(err);
      })
      .finally(() => { pending.current -= 1; });
  }, [key]);

  return [state, update, loaded];
}

export function AppProvider({ children }) {
  const [syncError, setSyncError] = useState(null);
  const reportError = useCallback((err) => setSyncError(err?.message || 'No se pudo conectar con la base de datos.'), []);

  const [establishments, setEstablishments, l1] = useSharedState('gs_establishments', initialEstablishments, reportError);
  const [users, setUsers, l2] = useSharedState('gs_users', initialUsers, reportError);
  const [products, setProducts, l3] = useSharedState('gs_products', initialProducts, reportError);
  const [tables, setTables, l4] = useSharedState('gs_tables', initialTables, reportError);
  const [paymentConfig, setPaymentConfig, l5] = useSharedState('gs_paymentConfig', initialPaymentConfig, reportError);
  const [orders, setOrders, l6] = useSharedState('gs_orders', null, reportError);
  const [transactions, setTransactions, l7] = useSharedState('gs_transactions', null, reportError);
  const [payroll, setPayroll, l8] = useSharedState('gs_payroll', null, reportError);
  const ready = l1 && l2 && l3 && l4 && l5 && l6 && l7 && l8;

  // La sesión vive en sessionStorage: cada pestaña/aparato tiene su propio usuario.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('gs_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('gs_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // ---------- Sesión ----------
  const login = (codigoEstablecimiento, nombreUsuario, contrasena) => {
    const est = establishments.find(e => sameCode(e.codigo, codigoEstablecimiento.trim()));
    if (!est) throw new Error('El código del establecimiento no existe.');

    const user = users.find(u => sameCode(u.codigoEstablecimiento, est.codigo) && String(u.nombreUsuario).toLowerCase() === String(nombreUsuario).trim().toLowerCase());
    if (!user || user.contrasenaHash !== contrasena) {
      throw new Error('Credenciales inválidas o usuario incorrecto para este local.');
    }

    setCurrentUser(user);
    return user;
  };

  const logout = () => setCurrentUser(null);

  const registerEstablishment = (data) => {
    if (establishments.some(e => e.nit === data.nit)) throw new Error('El NIT ya se encuentra registrado.');
    if (establishments.some(e => sameCode(e.codigo, data.codigo))) throw new Error('Ese código de local ya existe.');

    const newEst = {
      id: 'est-' + Date.now(),
      codigo: data.codigo,
      nombre: data.nombre,
      direccion: data.direccion,
      nit: data.nit,
      telefono: data.telefono,
      logo: data.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
      estado: 'activo',
      habeasDataAcceptedAt: new Date().toISOString()
    };

    const newGerente = {
      id: 'u-' + Date.now(),
      codigoEstablecimiento: data.codigo,
      nombreUsuario: data.gerenteUsuario || 'gerente',
      contrasenaHash: data.gerentePassword || '123456',
      correo: data.correo || 'gerente@restaurante.com',
      rol: 'Gerente',
      cambioContrasenaObligatorio: false
    };

    setEstablishments(prev => [...prev, newEst]);
    setUsers(prev => [...prev, newGerente]);

    const defaultTables = [1, 2, 3, 4].map(num => ({
      id: `m-${data.codigo}-${num}`,
      codigoEstablecimiento: data.codigo,
      numero: num,
      estado: 'libre'
    }));
    setTables(prev => [...prev, ...defaultTables]);

    // Antes un local nuevo quedaba sin métodos de pago y no se podía cobrar.
    setPaymentConfig(prev => [
      ...prev,
      { id: `pay-${data.codigo}-1`, codigoEstablecimiento: data.codigo, tipo: 'efectivo', habilitado: true, cuentaBancariaCifrada: '' },
      { id: `pay-${data.codigo}-2`, codigoEstablecimiento: data.codigo, tipo: 'transferencia', habilitado: true, cuentaBancariaCifrada: '', qrImagen: '' }
    ]);

    return newEst;
  };

  // ---------- Pedidos ----------
  const createOrder = ({ tipo, mesaNumero, items, clienteData }) => {
    // Si la mesa ya tiene pedidos sin pagar, este es un adicional de la misma cuenta
    const esAdicional = tipo === 'mesa' && orders.some(o =>
      sameCode(o.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
      o.tipo === 'mesa' && Number(o.mesaNumero) === Number(mesaNumero) &&
      o.estado !== 'pagado' && o.estado !== 'cancelado'
    );

    const newOrder = {
      id: 'ord-' + Date.now(),
      codigoEstablecimiento: currentUser.codigoEstablecimiento,
      tipo,
      mesaNumero: mesaNumero || null,
      clienteData: clienteData || null,
      items,
      estado: 'pendiente',
      esAdicional,
      creadoPor: currentUser.nombreUsuario,
      fechaHora: new Date().toISOString(),
      total: items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0)
    };

    setOrders(prev => [newOrder, ...prev]);

    if (tipo === 'mesa' && mesaNumero) {
      setTables(prev => prev.map(t => (sameCode(t.codigoEstablecimiento, currentUser.codigoEstablecimiento) && Number(t.numero) === Number(mesaNumero)) ? { ...t, estado: 'ocupada' } : t));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId, nuevoEstado) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: nuevoEstado } : o));
  };

  // Cambia el estado de varios pedidos a la vez (comandas agrupadas de una misma mesa)
  const updateOrdersStatus = (orderIds, nuevoEstado) => {
    const ids = new Set(orderIds);
    setOrders(prev => prev.map(o => ids.has(o.id) ? { ...o, estado: nuevoEstado } : o));
  };

  // Cancelar un pedido a domicilio (o cualquier pedido por id)
  const cancelOrder = (orderId, motivo) => {
    const ahoraIso = new Date().toISOString();
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      estado: 'cancelado',
      motivoCancelacion: motivo,
      canceladoPor: currentUser.nombreUsuario,
      fechaHoraCancelacion: ahoraIso
    } : o));
  };

  // El domiciliario toma un pedido que cocina ya dejó listo y sale a entregarlo.
  const takeDelivery = (orderId) => {
    setOrders(prev => prev.map(o => (o.id === orderId && o.estado === 'listo') ? {
      ...o,
      estado: 'en_camino',
      domiciliario: currentUser.nombreUsuario,
      fechaHoraSalida: new Date().toISOString()
    } : o));
  };

  // Entrega confirmada con PIN: el pedido queda 'entregado' (sale de la lista del domiciliario)
  // y se registra el cobro para que cuente en la auditoría de ingresos.
  const completeDelivery = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.estado !== 'en_camino') return null;

    const ahoraIso = new Date().toISOString();
    const monto = (order.items || []).reduce((acc, i) => acc + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
    // La propina y el costo del domicilio los fija el Call Center al tomar el pedido.
    // La propina es de quien tomó el pedido; el costo del domicilio es la paga del domiciliario por el viaje.
    const costoDomicilio = Math.max(0, Number(order.clienteData?.costoDomicilio) || 0);
    const propina = Math.max(0, Number(order.clienteData?.propina) || 0);

    const newTx = {
      id: 'tx-' + Date.now(),
      codigoEstablecimiento: order.codigoEstablecimiento,
      targetId: order.id,
      tipoTarget: 'domicilio',
      metodoPago: order.clienteData?.metodoPago || 'efectivo',
      monto,
      propina,
      propinaMesero: propina > 0 ? order.creadoPor : null,
      propinaLiquidada: false,
      costoDomicilio,
      domiciliario: order.domiciliario || currentUser.nombreUsuario,
      clienteNombre: order.clienteData?.nombre || '',
      destino: order.clienteData?.direccion || '',
      tarifaLiquidada: false,
      items: order.items,
      usuario: currentUser.nombreUsuario,
      fechaHora: ahoraIso
    };

    setTransactions(prev => [newTx, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: 'entregado', fechaHoraEntrega: ahoraIso } : o));
    return newTx;
  };

  const cancelTableOrder = (mesaNumero, motivo) => {
    const ahoraIso = new Date().toISOString();

    setOrders(prev => prev.map(o => {
      if (sameCode(o.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
          Number(o.mesaNumero) === Number(mesaNumero) &&
          o.estado !== 'pagado' && o.estado !== 'cancelado') {
        return {
          ...o,
          estado: 'cancelado',
          motivoCancelacion: motivo,
          canceladoPor: currentUser.nombreUsuario,
          fechaHoraCancelacion: ahoraIso
        };
      }
      return o;
    }));

    setTables(prev => prev.map(t => {
      if (sameCode(t.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
          Number(t.numero) === Number(mesaNumero)) {
        return { ...t, estado: 'libre' };
      }
      return t;
    }));
  };

  // ---------- Menú ----------
  const toggleProductAvailability = (productId, disponible) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, disponible } : p));
  };

  const addProduct = (productData) => {
    const newP = {
      id: 'p-' + Date.now(),
      codigoEstablecimiento: currentUser.codigoEstablecimiento,
      ...productData,
      disponible: true
    };
    setProducts(prev => [...prev, newP]);
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedData } : p));
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // ---------- Empleados ----------
  const addEmployee = (empData) => {
    const duplicado = users.some(u =>
      sameCode(u.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
      String(u.nombreUsuario).toLowerCase() === String(empData.nombreUsuario).trim().toLowerCase()
    );
    if (duplicado) throw new Error('Ya existe un usuario con ese nombre en este local.');

    const newEmp = {
      id: 'u-' + Date.now(),
      codigoEstablecimiento: currentUser.codigoEstablecimiento,
      ...empData,
      nombreUsuario: String(empData.nombreUsuario).trim(),
      salario: Number(empData.salario) || 0
    };
    setUsers(prev => [...prev, newEmp]);
  };

  const updateEmployee = (userId, patch) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...patch } : u));
  };

  const deleteEmployee = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // ---------- Pagos de clientes (con propina) ----------
  const processPayment = ({ targetId, tipoTarget, metodo, monto, items, propina = 0, meseroPropina = null }) => {
    const propinaNum = Math.max(0, Number(propina) || 0);
    const mesa = tipoTarget === 'mesa' ? tables.find(t => t.id === targetId) : null;

    const newTx = {
      id: 'tx-' + Date.now(),
      codigoEstablecimiento: currentUser.codigoEstablecimiento,
      targetId,
      tipoTarget,
      metodoPago: metodo,
      monto,
      propina: propinaNum,
      propinaMesero: propinaNum > 0 ? meseroPropina : null,
      propinaLiquidada: false,
      mesaNumero: mesa ? mesa.numero : null,
      items,
      usuario: currentUser.nombreUsuario,
      fechaHora: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    if (tipoTarget === 'mesa') {
      if (mesa) {
        setTables(prev => prev.map(t => Number(t.numero) === Number(mesa.numero) && sameCode(t.codigoEstablecimiento, currentUser.codigoEstablecimiento) ? { ...t, estado: 'libre' } : t));
        setOrders(prev => prev.map(o => (Number(o.mesaNumero) === Number(mesa.numero) && sameCode(o.codigoEstablecimiento, currentUser.codigoEstablecimiento) && o.estado !== 'cancelado' && o.estado !== 'pagado') ? { ...o, estado: 'pagado' } : o));
      }
    } else if (tipoTarget === 'domicilio') {
      setOrders(prev => prev.map(o => o.id === targetId ? { ...o, estado: 'pagado' } : o));
    }

    return newTx;
  };

  const updatePaymentConfig = (configId, habilitado) => {
    setPaymentConfig(prev => prev.map(c => c.id === configId ? { ...c, habilitado } : c));
  };

  const updatePaymentDetails = (configId, patch) => {
    setPaymentConfig(prev => prev.map(c => c.id === configId ? { ...c, ...patch } : c));
  };

  // ---------- Nómina y propinas ----------
  // Propinas que le faltan por entregar a un empleado (solo de este local).
  const getPendingTips = (nombreUsuario) => transactions.filter(t =>
    sameCode(t.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
    t.propinaMesero === nombreUsuario &&
    Number(t.propina) > 0 &&
    !t.propinaLiquidada
  );

  // Domicilios entregados por un domiciliario cuya tarifa aún no se le ha pagado
  const getPendingFees = (nombreUsuario) => transactions.filter(t =>
    sameCode(t.codigoEstablecimiento, currentUser.codigoEstablecimiento) &&
    t.tipoTarget === 'domicilio' &&
    t.domiciliario === nombreUsuario &&
    Number(t.costoDomicilio) > 0 &&
    !t.tarifaLiquidada
  );

  const registerPayroll = ({ empleado, periodo }) => {
    const pendientes = getPendingTips(empleado.nombreUsuario);
    const propinas = pendientes.reduce((acc, t) => acc + Number(t.propina), 0);
    const viajes = getPendingFees(empleado.nombreUsuario);
    const domicilios = viajes.reduce((acc, t) => acc + Number(t.costoDomicilio), 0);
    const salario = Number(empleado.salario) || 0;
    const id = 'pay-' + Date.now();

    const record = {
      id,
      codigoEstablecimiento: currentUser.codigoEstablecimiento,
      empleadoId: empleado.id,
      empleado: empleado.nombreUsuario,
      rol: empleado.rol,
      periodo: periodo || '',
      salario,
      propinas,
      domicilios,
      viajes: viajes.length,
      total: salario + propinas + domicilios,
      pagadoPor: currentUser.nombreUsuario,
      fechaHora: new Date().toISOString()
    };

    const ids = new Set(pendientes.map(t => t.id));
    const viajeIds = new Set(viajes.map(t => t.id));
    setPayroll(prev => [record, ...prev]);
    setTransactions(prev => prev.map(t => {
      let next = t;
      if (ids.has(t.id)) next = { ...next, propinaLiquidada: true, liquidacionId: id };
      if (viajeIds.has(t.id)) next = { ...next, tarifaLiquidada: true, liquidacionId: id };
      return next;
    }));
    return record;
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 font-black flex items-center justify-center text-lg">GS</div>
        {syncError ? (
          <>
            <p className="font-bold text-red-300">No se pudo conectar con la base de datos</p>
            <p className="text-xs text-slate-300 max-w-md">{syncError}</p>
            <p className="text-xs text-slate-400 max-w-md">Verifique la conexión a internet y que haya ejecutado el archivo supabase_setup.sql en Supabase.</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-xs">Reintentar</button>
          </>
        ) : (
          <p className="text-sm text-slate-300">Conectando con la base de datos...</p>
        )}
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      syncError, clearSyncError: () => setSyncError(null),
      establishments, users, products, tables, paymentConfig, orders, transactions, payroll, currentUser,
      login, logout, registerEstablishment, createOrder, updateOrderStatus, updateOrdersStatus, cancelOrder, takeDelivery, completeDelivery, cancelTableOrder,
      toggleProductAvailability, addProduct, updateProduct, deleteProduct, addEmployee, updateEmployee, deleteEmployee,
      processPayment, updatePaymentConfig, updatePaymentDetails, getPendingTips, getPendingFees, registerPayroll
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
