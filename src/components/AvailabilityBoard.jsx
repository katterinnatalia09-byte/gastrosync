import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AvailabilityBoard() {
  const { products: allProducts, currentUser, toggleProductAvailability } = useApp();
  const products = allProducts.filter(p => String(p.codigoEstablecimiento).toUpperCase() === String(currentUser.codigoEstablecimiento).toUpperCase());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Control Rápido de Disponibilidad de Platos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3">
              <img src={product.imagen || undefined} alt="" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">{product.nombre}</h4>
                <p className="text-xs text-slate-500">{product.categoria}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${product.disponible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {product.disponible ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span>{product.disponible ? 'Disponible' : 'Agotado'}</span>
              </span>
              <Button
                variant={product.disponible ? 'danger' : 'primary'}
                className="text-xs py-1.5 px-3"
                onClick={() => toggleProductAvailability(product.id, !product.disponible)}
              >
                {product.disponible ? 'Marcar Agotado' : 'Habilitar'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}