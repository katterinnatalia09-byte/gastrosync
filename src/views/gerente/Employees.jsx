import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Input } from '../../components/ui';
import { Users, UserPlus, Shield, Trash2, IdCard, Camera, Eye, EyeOff } from 'lucide-react';
import EmployeeCredential, { Avatar } from '../../components/EmployeeCredential';
import { resizePhoto } from '../../utils/photo';

export default function Employees() {
  const { currentUser, users, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [credEmpId, setCredEmpId] = useState(null);
  const [shownPass, setShownPass] = useState({});
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empData, setEmpData] = useState({
    nombreUsuario: '',
    contrasenaHash: '',
    correo: '',
    rol: 'Mesero',
    salario: '',
    nombreCompleto: '',
    telefono: '',
    foto: ''
  });

  const handlePhoto = async (file, setter) => {
    if (!file) return;
    try {
      setter(await resizePhoto(file));
    } catch (err) {
      alert(err.message);
    }
  };

  const credEmp = users.find(u => u.id === credEmpId);
  const openCredential = (emp) => {
    setCredEmpId(emp.id);
    setEditData({ nombreCompleto: emp.nombreCompleto || '', telefono: emp.telefono || '', correo: emp.correo || '', foto: emp.foto || '', contrasenaHash: emp.contrasenaHash || '' });
  };
  const saveCredential = () => {
    if (!editData.contrasenaHash) { alert('La contraseña no puede estar vacía.'); return; }
    updateEmployee(credEmp.id, { ...editData, nombreCompleto: editData.nombreCompleto.trim(), telefono: editData.telefono.trim() });
    alert('Datos de la credencial actualizados.');
  };

  // Validación segura para evitar pantallas en blanco si currentUser o users tardan en cargar
  const establishmentCode = currentUser?.codigoEstablecimiento || '';
  const localUsers = Array.isArray(users) 
    ? users.filter(u => String(u?.codigoEstablecimiento || '').toUpperCase() === String(establishmentCode).toUpperCase())
    : [];

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!empData.nombreUsuario || !empData.contrasenaHash) {
      alert('Por favor ingrese el nombre de usuario y contraseña.');
      return;
    }

    try {
      addEmployee(empData);
      alert('¡Empleado creado con éxito!');
      setEmpData({ nombreUsuario: '', contrasenaHash: '', correo: '', rol: 'Mesero', salario: '', nombreCompleto: '', telefono: '', foto: '' });
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error al registrar el empleado.');
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('¿Está seguro de eliminar este empleado?')) {
      deleteEmployee(userId);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Gestión del Personal del Establecimiento</h3>
          <p className="text-xs text-slate-500">Cree credenciales para Meseros, Cocineros, Domiciliarios y Operadores de Call Center.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="text-xs font-bold">
          <UserPlus className="w-4 h-4 mr-1.5" /> Registrar Empleado
        </Button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Empleado</th>
                <th className="p-3">Usuario (para ingresar)</th>
                <th className="p-3">Contraseña</th>
                <th className="p-3">Correo Electrónico</th>
                <th className="p-3">Rol Asignado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400 italic">No hay empleados registrados además del gerente.</td>
                </tr>
              ) : (
                localUsers.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar emp={emp} />
                        <div>
                          <p className="font-bold text-slate-900">{emp.nombreCompleto || emp.nombreUsuario}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-700">{emp.nombreUsuario}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800">{shownPass[emp.id] ? emp.contrasenaHash : '••••••••'}</span>
                      <button
                        onClick={() => setShownPass(p => ({ ...p, [emp.id]: !p[emp.id] }))}
                        className="ml-2 text-slate-400 hover:text-slate-700 align-middle"
                        title={shownPass[emp.id] ? 'Ocultar' : 'Mostrar'}
                      >
                        {shownPass[emp.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3 text-slate-500">{emp.correo || 'No registrado'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        emp.rol === 'Gerente' ? 'bg-purple-100 text-purple-800' : 
                        emp.rol === 'Mesero' ? 'bg-blue-100 text-blue-800' : 
                        emp.rol === 'Cocina' ? 'bg-amber-100 text-amber-800' : 
                        emp.rol === 'CallCenter' || emp.rol === 'Call Center' ? 'bg-orange-100 text-orange-800' : 
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {emp.rol}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => openCredential(emp)} className="text-amber-600 hover:text-amber-800 p-1 mr-1" title="Ver y editar credencial">
                        <IdCard className="w-4 h-4" />
                      </button>
                      {emp.rol !== 'Gerente' && (
                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar empleado">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Empleado</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar emp={{ nombreCompleto: empData.nombreCompleto, nombreUsuario: empData.nombreUsuario, foto: empData.foto }} className="w-16 h-16 text-xl" />
                <label className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl cursor-pointer flex items-center">
                  <Camera className="w-4 h-4 mr-1" /> {empData.foto ? 'Cambiar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { handlePhoto(e.target.files[0], f => setEmpData(d => ({ ...d, foto: f }))); e.target.value = ''; }} />
                </label>
              </div>
              <Input label="Nombre completo" placeholder="ej. María Fernanda Gómez" value={empData.nombreCompleto} onChange={e => setEmpData({...empData, nombreCompleto: e.target.value})} />
              <Input label="Teléfono" placeholder="ej. 3101234567" value={empData.telefono} onChange={e => setEmpData({...empData, telefono: e.target.value})} />
              <Input label="Nombre de Usuario" placeholder="ej. callcenter1, maria_mesera" value={empData.nombreUsuario} onChange={e => setEmpData({...empData, nombreUsuario: e.target.value})} required />
              <Input label="Correo Electrónico" placeholder="empleado@local.com" value={empData.correo} onChange={e => setEmpData({...empData, correo: e.target.value})} />
              <Input label="Contraseña de Acceso" type="password" placeholder="••••••••" value={empData.contrasenaHash} onChange={e => setEmpData({...empData, contrasenaHash: e.target.value})} required />

              <Input label="Salario (COP, opcional)" type="number" min="0" placeholder="ej. 1300000" value={empData.salario} onChange={e => setEmpData({...empData, salario: e.target.value})} />

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Rol en el Sistema:</label>
                <select
                  value={empData.rol}
                  onChange={e => setEmpData({...empData, rol: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Mesero">Mesero (Atención de Mesas)</option>
                  <option value="Cocina">Cocina (Preparación de Platos)</option>
                  <option value="CallCenter">Call Center (Toma de Pedidos a Domicilio)</option>
                  <option value="Domiciliario">Domiciliario (Repartidor en Ruta)</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-2">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="w-1/2 py-2.5 text-xs">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="w-1/2 py-2.5 text-xs font-bold">
                  Guardar Empleado
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {credEmp && editData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Credencial de {credEmp.nombreCompleto || credEmp.nombreUsuario}</h3>
              <button onClick={() => { setCredEmpId(null); setEditData(null); }} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <EmployeeCredential emp={{ ...credEmp, ...editData }} />
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase">Datos de la credencial</p>
                <label className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl cursor-pointer inline-flex items-center">
                  <Camera className="w-4 h-4 mr-1" /> {editData.foto ? 'Cambiar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { handlePhoto(e.target.files[0], f => setEditData(d => ({ ...d, foto: f }))); e.target.value = ''; }} />
                </label>
                {editData.foto && (
                  <button onClick={() => setEditData(d => ({ ...d, foto: '' }))} className="ml-3 text-xs text-red-500 hover:text-red-700">Quitar foto</button>
                )}
                <Input label="Nombre completo" value={editData.nombreCompleto} onChange={e => setEditData({ ...editData, nombreCompleto: e.target.value })} />
                <Input label="Correo electrónico" value={editData.correo} onChange={e => setEditData({ ...editData, correo: e.target.value })} />
                <Input label="Teléfono" value={editData.telefono} onChange={e => setEditData({ ...editData, telefono: e.target.value })} />
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-bold text-amber-900 uppercase">Acceso al sistema</p>
                  <p className="text-xs text-slate-700">Usuario: <span className="font-mono font-bold">{credEmp.nombreUsuario}</span> · Código del local: <span className="font-mono font-bold">{credEmp.codigoEstablecimiento}</span></p>
                  <Input label="Contraseña" value={editData.contrasenaHash} onChange={e => setEditData({ ...editData, contrasenaHash: e.target.value })} />
                </div>
                <Button onClick={saveCredential} variant="primary" className="w-full py-2.5 text-xs font-bold">Guardar cambios</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}