import React from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, Trash2 } from 'lucide-react';

const sameCode = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

export default function PaymentSettings() {
  const { currentUser, paymentConfig, updatePaymentConfig, updatePaymentDetails } = useApp();
  const localConfigs = paymentConfig.filter(c => sameCode(c.codigoEstablecimiento, currentUser.codigoEstablecimiento));

  const handleQrUpload = (cfg, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Seleccione una imagen (PNG o JPG).');
    if (file.size > 600 * 1024) return alert('La imagen es muy pesada (máx. 600 KB). Use una captura más pequeña del QR.');
    const reader = new FileReader();
    reader.onload = () => updatePaymentDetails(cfg.id, { qrImagen: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 text-base">Configuración de Métodos de Pago</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localConfigs.map(cfg => (
          <div key={cfg.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 capitalize">{cfg.tipo}</h4>
                <p className="text-xs text-slate-500">{cfg.tipo === 'efectivo' ? 'Habilitado para cobros en caja o local.' : 'El mesero verá el QR al cobrar por transferencia.'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.habilitado}
                  onChange={(e) => updatePaymentConfig(cfg.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {cfg.tipo === 'transferencia' && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Cuenta / Nequi / Daviplata</label>
                  <input
                    value={cfg.cuentaBancariaCifrada || ''}
                    onChange={e => updatePaymentDetails(cfg.id, { cuentaBancariaCifrada: e.target.value })}
                    placeholder="ej. Bancolombia Ahorros ***4589"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase flex items-center"><QrCode className="w-3.5 h-3.5 mr-1" /> QR de cobro del local</label>
                  {cfg.qrImagen ? (
                    <div className="flex items-center space-x-3">
                      <img src={cfg.qrImagen} alt="QR de cobro" className="w-24 h-24 object-contain rounded-xl border border-slate-200" />
                      <button
                        onClick={() => updatePaymentDetails(cfg.id, { qrImagen: '' })}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Quitar QR
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">Sin QR cargado: se muestra un QR de demostración. Suba la captura del QR de su app del banco (Bancolombia, Nequi, etc.).</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => { handleQrUpload(cfg, e.target.files[0]); e.target.value = ''; }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-800 file:font-bold hover:file:bg-amber-200"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
