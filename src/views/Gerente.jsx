import React, { useState } from 'react';
import MenuAdmin from './gerente/MenuAdmin';
import Employees from './gerente/Employees';
import PaymentSettings from './gerente/PaymentSettings';
import Audit from './gerente/Audit';
import Payroll from './gerente/Payroll';
import { Button } from '../components/ui';
import { Utensils, Users, DollarSign, FileText, Wallet } from 'lucide-react';

export default function Gerente() {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Panel Gerencial / Dueño</h2>
          <p className="text-xs text-slate-500">Administración general, personal, pagos y auditoría financiera.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === 'menu' ? 'primary' : 'outline'} onClick={() => setActiveTab('menu')} className="text-xs">
            <Utensils className="w-3.5 h-3.5 mr-1" /> Menú
          </Button>
          <Button variant={activeTab === 'employees' ? 'primary' : 'outline'} onClick={() => setActiveTab('employees')} className="text-xs">
            <Users className="w-3.5 h-3.5 mr-1" /> Empleados
          </Button>
          <Button variant={activeTab === 'payments' ? 'primary' : 'outline'} onClick={() => setActiveTab('payments')} className="text-xs">
            <DollarSign className="w-3.5 h-3.5 mr-1" /> Métodos de Pago
          </Button>
          <Button variant={activeTab === 'payroll' ? 'primary' : 'outline'} onClick={() => setActiveTab('payroll')} className="text-xs">
            <Wallet className="w-3.5 h-3.5 mr-1" /> Nómina y Propinas
          </Button>
          <Button variant={activeTab === 'audit' ? 'primary' : 'outline'} onClick={() => setActiveTab('audit')} className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1" /> Auditoría
          </Button>
        </div>
      </div>

      {activeTab === 'menu' && <MenuAdmin />}
      {activeTab === 'employees' && <Employees />}
      {activeTab === 'payments' && <PaymentSettings />}
      {activeTab === 'payroll' && <Payroll />}
      {activeTab === 'audit' && <Audit />}
    </div>
  );
}