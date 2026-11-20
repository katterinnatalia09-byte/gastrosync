import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Input, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MenuAdmin() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Platos Fuertes',
    descripcion: '',
    precio: '',
    imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'
  });

  const localProducts = products.filter(p => String(p.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({ nombre: '', categoria: 'Platos Fuertes', descripcion: '', precio: '', imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({ nombre: p.nombre, categoria: p.categoria, descripcion: p.descripcion, precio: p.precio, imagen: p.imagen });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) return alert('Nombre y precio son obligatorios.');

    if (editingProduct) {
      updateProduct(editingProduct.id, { ...form, precio: Number(form.precio) });
    } else {
      addProduct({ ...form, precio: Number(form.precio) });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-base">Gestión de Productos del Menú</h3>
        <Button onClick={handleOpenCreate} variant="primary" className="text-xs">
          <Plus className="w-4 h-4 mr-1" /> Nuevo Plato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localProducts.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center space-x-3">
              <img src={p.imagen} alt={p.nombre} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{p.nombre}</h4>
                <p className="text-xs text-slate-500">{p.categoria}</p>
                <p className="text-xs font-extrabold text-amber-600 mt-1">{formatCurrency(p.precio)}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button onClick={() => handleOpenEdit(p)} variant="outline" className="text-xs py-1 px-2.5">
                <Edit className="w-3.5 h-3.5" /> Editar
              </Button>
              <Button onClick={() => deleteProduct(p.id)} variant="danger" className="text-xs py-1 px-2.5">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Editar Plato' : 'Crear Nuevo Plato'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nombre del Plato" placeholder="ej. Cazuela de Mariscos" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <Input label="Categoría" placeholder="ej. Platos Fuertes" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required />
          <Input label="Precio (COP)" type="number" placeholder="ej. 35000" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
          <Input label="URL de Imagen" placeholder="https://..." value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} required />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">Descripción</label>
            <textarea className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500" rows="3" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
          </div>
          <Button type="submit" variant="primary" className="w-full py-3">Guardar Plato</Button>
        </form>
      </Modal>
    </div>
  );
}