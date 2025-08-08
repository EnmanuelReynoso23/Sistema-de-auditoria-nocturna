import React from 'react';
import { Download, FileSpreadsheet, FileText, Cloud, Database } from 'lucide-react';

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

interface DataExportProps {
  invoices: Invoice[];
  auditSteps: AuditStep[];
}

export const DataExport: React.FC<DataExportProps> = ({ invoices, auditSteps }) => {
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFullBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      invoices,
      auditSteps,
      summary: {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        completedSteps: auditSteps.filter(step => step.completed).length,
        totalSteps: auditSteps.length
      }
    };
    
    exportToJSON(backupData, 'audit_backup_complete');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-indigo-600" />
        Exportar Datos
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => exportToCSV(invoices, 'facturas_restaurante')}
          className="flex items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
        >
          <FileSpreadsheet className="w-6 h-6 mr-3 text-green-600" />
          <div className="text-left">
            <p className="font-semibold text-green-800">Facturas a Excel</p>
            <p className="text-sm text-green-600">Archivo CSV para análisis</p>
          </div>
        </button>

        <button
          onClick={() => exportToCSV(auditSteps.map(step => ({
            titulo: step.title,
            descripcion: step.description,
            completado: step.completed ? 'Sí' : 'No',
            prioridad: step.priority,
            categoria: step.category,
            notas: step.notes
          })), 'lista_verificacion')}
          className="flex items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <FileText className="w-6 h-6 mr-3 text-blue-600" />
          <div className="text-left">
            <p className="font-semibold text-blue-800">Auditoría a Excel</p>
            <p className="text-sm text-blue-600">Lista de verificación</p>
          </div>
        </button>

        <button
          onClick={exportFullBackup}
          className="flex items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200"
        >
          <Database className="w-6 h-6 mr-3 text-purple-600" />
          <div className="text-left">
            <p className="font-semibold text-purple-800">Respaldo Completo</p>
            <p className="text-sm text-purple-600">Todos los datos en JSON</p>
          </div>
        </button>

        <button
          onClick={() => {
            const summaryData = [{
              fecha: new Date().toLocaleDateString(),
              total_facturas: invoices.length,
              monto_total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
              pasos_completados: auditSteps.filter(step => step.completed).length,
              pasos_totales: auditSteps.length,
              progreso_porcentaje: ((auditSteps.filter(step => step.completed).length / auditSteps.length) * 100).toFixed(1)
            }];
            exportToCSV(summaryData, 'resumen_diario');
          }}
          className="flex items-center justify-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200"
        >
          <Cloud className="w-6 h-6 mr-3 text-orange-600" />
          <div className="text-left">
            <p className="font-semibold text-orange-800">Resumen Diario</p>
            <p className="text-sm text-orange-600">Métricas principales</p>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Formatos de Exportación</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>CSV:</strong> Compatible con Excel y Google Sheets</p>
            <p><strong>JSON:</strong> Respaldo completo para importar</p>
          </div>
          <div>
            <p><strong>Automático:</strong> Incluye fecha en nombre del archivo</p>
            <p><strong>Completo:</strong> Todos los datos y metadatos</p>
          </div>
        </div>
      </div>
    </div>
  );
};