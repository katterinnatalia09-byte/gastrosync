import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { Plus, Check, AlertTriangle } from 'lucide-react';

const FALLBACK_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='56' height='56' fill='%23fef3c7'/><text x='28' y='36' font-size='26' text-anchor='middle'>🍽️</text></svg>";

export default function MenuPicker({ onSelectItem, wide = false }) {
  const { products: allProducts, currentUser } = useApp();
  // Solo los platos del local donde está trabajando el usuario
  const products = allProducts.filter(p => String(p.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...new Set(products.map(p => p.categoria))];
  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.categoria === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${wide ? 'sm:grid-cols-2' : ''} gap-3 max-h-[450px] overflow-y-auto pr-1`}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${product.disponible ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-slate-100 border-slate-300 opacity-60'}`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img
                src={product.imagen || FALLBACK_IMG}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                alt={product.nombre}
                className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-800 leading-tight">{product.nombre}</h4>
                <p className="text-xs font-extrabold text-amber-600">{formatCurrency(product.precio)}</p>
                {!product.disponible && (
                  <span className="inline-flex items-center text-[10px] text-red-600 font-bold space-x-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Plato Agotado</span>
                  </span>
                )}
              </div>
            </div>

            <button
              disabled={!product.disponible}
              onClick={() => onSelectItem(product)}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white p-2.5 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}