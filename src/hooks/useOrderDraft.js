import { useState } from 'react';

export function useOrderDraft() {
  const [items, setItems] = useState([]);

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...product, cantidad: 1, observacion: '' }];
    });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setItems(prev => prev.map(i => {
      if (i.id === productId) {
        const nuevaCant = i.cantidad + delta;
        return nuevaCant > 0 ? { ...i, cantidad: nuevaCant } : i;
      }
      return i;
    }));
  };

  const updateObservation = (productId, obs) => {
    setItems(prev => prev.map(i => i.id === productId ? { ...i, observacion: obs } : i));
  };

  const clearDraft = () => setItems([]);

  return { items, addItem, removeItem, updateQuantity, updateObservation, clearDraft };
}