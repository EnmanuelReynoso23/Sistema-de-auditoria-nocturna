import React from 'react';
import { Printer, FileText, Calculator, Users, Building, Clock } from 'lucide-react';

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

interface PrintableReportsProps {
  invoices: Invoice[];
  auditSteps: AuditStep[];
  calculations: any;
}

export const PrintableReports: React.FC<PrintableReportsProps> = ({ 
  invoices, 
  auditSteps, 
  calculations 
}) => {
  const printReport = (reportType: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '';
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const headerStyle = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .table th { background-color: #f0f0f0; }
          .total { font-weight: bold; background-color: #e6f3ff; }
          .signature { margin-top: 40px; border-top: 1px solid #000; width: 200px; text-align: center; }
        }
      </style>
    `;

    switch (reportType) {
      case 'restaurant-invoices':
        content = `
          ${headerStyle}
          <div class="header">
            <h1>REPORTE DE FACTURAS DEL RESTAURANTE</h1>
            <p>Fecha: ${currentDate} | Hora: ${currentTime}</p>
          </div>
          
          <div class="section">
            <h2>Facturas por Turno</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Turno</th>
                  <th>Monto</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(inv => `
                  <tr>
                    <td>${inv.description}</td>
                    <td>${inv.type === 'food' ? 'Comida' : inv.type === 'beverage' ? 'Bebida' : 'Otro'}</td>
                    <td>${inv.shift === 'day' ? 'Día (7/3)' : 'Noche (3/11)'}</td>
                    <td>$${inv.amount.toFixed(2)}</td>
                    <td>${inv.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Resumen por Categorías</h2>
            <table class="table">
              <tr><th>Categoría</th><th>Día (7/3)</th><th>Noche (3/11)</th><th>Total</th></tr>
              <tr>
                <td>Comida</td>
                <td>$${invoices.filter(i => i.type === 'food' && i.shift === 'day').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                <td>$${invoices.filter(i => i.type === 'food' && i.shift === 'night').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                <td class="total">$${invoices.filter(i => i.type === 'food').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Bebida</td>
                <td>$${invoices.filter(i => i.type === 'beverage' && i.shift === 'day').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                <td>$${invoices.filter(i => i.type === 'beverage' && i.shift === 'night').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                <td class="total">$${invoices.filter(i => i.type === 'beverage').reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td><strong>GRAN TOTAL</strong></td>
                <td><strong>$${invoices.filter(i => i.shift === 'day').reduce((s, i) => s + i.amount, 0).toFixed(2)}</strong></td>
                <td><strong>$${invoices.filter(i => i.shift === 'night').reduce((s, i) => s + i.amount, 0).toFixed(2)}</strong></td>
                <td><strong>$${invoices.reduce((s, i) => s + i.amount, 0).toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="signature">
            <p>Auditor: _________________</p>
            <p>Fecha: ${currentDate}</p>
          </div>
        `;
        break;

      case 'audit-checklist':
        const completedSteps = auditSteps.filter(step => step.completed).length;
        content = `
          ${headerStyle}
          <div class="header">
            <h1>LISTA DE VERIFICACIÓN DE AUDITORÍA</h1>
            <p>Fecha: ${currentDate} | Hora: ${currentTime}</p>
            <p>Progreso: ${completedSteps}/${auditSteps.length} pasos completados</p>
          </div>
          
          <div class="section">
            <table class="table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Paso</th>
                  <th>Descripción</th>
                  <th>Prioridad</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                ${auditSteps.map(step => `
                  <tr>
                    <td>${step.completed ? '✓ Completado' : '○ Pendiente'}</td>
                    <td>${step.title}</td>
                    <td>${step.description}</td>
                    <td>${step.priority === 'high' ? 'Alta' : step.priority === 'medium' ? 'Media' : 'Baja'}</td>
                    <td>${step.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="signature">
            <p>Auditor: _________________</p>
            <p>Supervisor: _________________</p>
            <p>Fecha: ${currentDate}</p>
          </div>
        `;
        break;

      case 'daily-summary':
        content = `
          ${headerStyle}
          <div class="header">
            <h1>RESUMEN DIARIO DE AUDITORÍA</h1>
            <p>Fecha: ${currentDate} | Hora: ${currentTime}</p>
          </div>
          
          <div class="section">
            <h2>Estado General</h2>
            <p><strong>Pasos Completados:</strong> ${completedSteps}/${auditSteps.length}</p>
            <p><strong>Progreso:</strong> ${((completedSteps / auditSteps.length) * 100).toFixed(1)}%</p>
            <p><strong>Facturas Procesadas:</strong> ${invoices.length}</p>
            <p><strong>Monto Total Procesado:</strong> $${invoices.reduce((s, i) => s + i.amount, 0).toFixed(2)}</p>
          </div>
          
          <div class="section">
            <h2>Pasos Pendientes</h2>
            <ul>
              ${auditSteps.filter(step => !step.completed).map(step => `
                <li><strong>${step.title}</strong> - ${step.description}</li>
              `).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Observaciones Importantes</h2>
            ${auditSteps.filter(step => step.notes).map(step => `
              <p><strong>${step.title}:</strong> ${step.notes}</p>
            `).join('') || '<p>Sin observaciones registradas.</p>'}
          </div>
          
          <div class="signature">
            <p>Auditor: _________________</p>
            <p>Supervisor: _________________</p>
            <p>Fecha: ${currentDate}</p>
          </div>
        `;
        break;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Auditoría</title>
          <meta charset="utf-8">
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Printer className="w-5 h-5 mr-2 text-blue-600" />
        Centro de Impresión
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => printReport('restaurant-invoices')}
          className="flex items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
        >
          <FileText className="w-6 h-6 mr-3 text-green-600" />
          <div className="text-left">
            <p className="font-semibold text-green-800">Facturas Restaurante</p>
            <p className="text-sm text-green-600">Desglose completo por turnos</p>
          </div>
        </button>

        <button
          onClick={() => printReport('audit-checklist')}
          className="flex items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <Users className="w-6 h-6 mr-3 text-blue-600" />
          <div className="text-left">
            <p className="font-semibold text-blue-800">Lista de Verificación</p>
            <p className="text-sm text-blue-600">Estado de todos los pasos</p>
          </div>
        </button>

        <button
          onClick={() => printReport('daily-summary')}
          className="flex items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200"
        >
          <Building className="w-6 h-6 mr-3 text-purple-600" />
          <div className="text-left">
            <p className="font-semibold text-purple-800">Resumen Diario</p>
            <p className="text-sm text-purple-600">Reporte ejecutivo completo</p>
          </div>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200"
        >
          <Printer className="w-6 h-6 mr-3 text-orange-600" />
          <div className="text-left">
            <p className="font-semibold text-orange-800">Pantalla Actual</p>
            <p className="text-sm text-orange-600">Imprimir vista completa</p>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Formatos Disponibles</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Facturas:</strong> Desglose por turno, totales por categoría</p>
            <p><strong>Auditoría:</strong> Lista completa con estado y notas</p>
          </div>
          <div>
            <p><strong>Resumen:</strong> Estado general y observaciones</p>
            <p><strong>Pantalla:</strong> Vista actual del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};