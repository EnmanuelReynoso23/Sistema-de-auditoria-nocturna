import React from 'react';
import { BarChart3, TrendingUp, PieChart, DollarSign, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  description: string;
  amount: number;
  type: 'food' | 'beverage' | 'other';
  shift: 'day' | 'night';
  timestamp: string;
}

interface AuditStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  notes: string;
}

interface AdvancedAnalyticsProps {
  invoices: Invoice[];
  auditSteps: AuditStep[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ invoices, auditSteps }) => {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const dayRevenue = invoices.filter(inv => inv.shift === 'day').reduce((sum, inv) => sum + inv.amount, 0);
  const nightRevenue = invoices.filter(inv => inv.shift === 'night').reduce((sum, inv) => sum + inv.amount, 0);
  
  const foodRevenue = invoices.filter(inv => inv.type === 'food').reduce((sum, inv) => sum + inv.amount, 0);
  const beverageRevenue = invoices.filter(inv => inv.type === 'beverage').reduce((sum, inv) => sum + inv.amount, 0);
  
  const completedSteps = auditSteps.filter(step => step.completed).length;
  const highPriorityCompleted = auditSteps.filter(step => step.priority === 'high' && step.completed).length;
  const highPriorityTotal = auditSteps.filter(step => step.priority === 'high').length;
  
  const averageInvoiceAmount = invoices.length > 0 ? totalRevenue / invoices.length : 0;
  
  const categoryBreakdown = auditSteps.reduce((acc, step) => {
    acc[step.category] = (acc[step.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedByCategory = auditSteps.reduce((acc, step) => {
    if (step.completed) {
      acc[step.category] = (acc[step.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Progreso Auditoría</p>
              <p className="text-2xl font-bold">{((completedSteps / auditSteps.length) * 100).toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Facturas Procesadas</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Promedio por Factura</p>
              <p className="text-2xl font-bold">${averageInvoiceAmount.toFixed(2)}</p>
            </div>
            <PieChart className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Revenue Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Análisis de Ingresos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Por Turno</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Día (7/3)</span>
                <div className="text-right">
                  <p className="font-bold text-blue-600">${dayRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{((dayRevenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Noche (3/11)</span>
                <div className="text-right">
                  <p className="font-bold text-purple-600">${nightRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{((nightRevenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Por Categoría</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Comida</span>
                <div className="text-right">
                  <p className="font-bold text-green-600">${foodRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{((foodRevenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Bebida</span>
                <div className="text-right">
                  <p className="font-bold text-orange-600">${beverageRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{((beverageRevenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Progress Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-600" />
          Análisis de Progreso de Auditoría
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-600">{highPriorityCompleted}/{highPriorityTotal}</p>
              <p className="text-sm text-gray-600">Tareas Alta Prioridad</p>
              <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(highPriorityCompleted / highPriorityTotal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-600">
                {auditSteps.filter(s => s.priority === 'medium' && s.completed).length}/
                {auditSteps.filter(s => s.priority === 'medium').length}
              </p>
              <p className="text-sm text-gray-600">Tareas Media Prioridad</p>
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(auditSteps.filter(s => s.priority === 'medium' && s.completed).length / 
                              auditSteps.filter(s => s.priority === 'medium').length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                {auditSteps.filter(s => s.priority === 'low' && s.completed).length}/
                {auditSteps.filter(s => s.priority === 'low').length}
              </p>
              <p className="text-sm text-gray-600">Tareas Baja Prioridad</p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(auditSteps.filter(s => s.priority === 'low' && s.completed).length / 
                              auditSteps.filter(s => s.priority === 'low').length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Progreso por Categoría</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryBreakdown).map(([category, total]) => {
              const completed = completedByCategory[category] || 0;
              const percentage = (completed / total) * 100;
              
              return (
                <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-800 capitalize">{category}</p>
                  <p className="text-lg font-bold text-gray-900">{completed}/{total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
