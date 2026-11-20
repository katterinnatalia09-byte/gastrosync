import React from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  let base = "px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ";
  if (variant === 'primary') base += "bg-amber-600 text-white hover:bg-amber-700 active:scale-95";
  else if (variant === 'secondary') base += "bg-slate-200 text-slate-800 hover:bg-slate-300 active:scale-95";
  else if (variant === 'danger') base += "bg-red-600 text-white hover:bg-red-700 active:scale-95";
  else if (variant === 'outline') base += "border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95";
  
  return <button className={`${base} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-md border border-slate-100 p-6 ${className}`}>{children}</div>;
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>}
      <input className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white shadow-sm ${className}`} {...props} />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl shadow-2xl ${size === 'xl' ? 'max-w-6xl' : 'max-w-lg'} w-full p-6 border border-slate-100 transform transition-all my-8`}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}