import React from 'react';
import { AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Invoice {
  id: string;
  description: string;
  amount: number;
  paymentType: 'cash' | 'card';
  shift: 'day' | 'night';
  category: 'food' | 'drinks' | 'shop';
}

interface Step {
  id: number;
  title: string;
  completed: boolean;
  category: string;
}

interface DataValidationProps {
  invoices: Invoice[];
  steps: Step[];
  currentTime: Date;
}

export const DataValidation: React.FC<DataValidationProps> = ({
  invoices,
  steps,
  currentTime
}) => {
  const validateInvoices = (): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Validar facturas duplicadas
    const descriptions = invoices.map(inv => inv.description);
    const duplicates = descriptions.filter((item, index) => descriptions.indexOf(item) !== index);
    if (duplicates.length > 0) {
      results.push({
        isValid: false,
        message: `Facturas duplicadas detectadas: ${[...new Set(duplicates)].join(', ')}`,
        severity: 'warning'
      });
    }

    // Validar montos negativos o cero
    const invalidAmounts = invoices.filter(inv => inv.amount <= 0);
    if (invalidAmounts.length > 0) {
      results.push({
        isValid: false,
        message: `${invalidAmounts.length} facturas con montos inválidos (≤ 0)`,
        severity: 'error'
      });
    }

    // Validar montos excesivamente altos
    const highAmounts = invoices.filter(inv => inv.amount > 10000);
    if (highAmounts.length > 0) {
      results.push({
        isValid: false,
        message: `${highAmounts.length} facturas con montos muy altos (> $10,000)`,
        severity: 'warning'
      });
    }

    // Validar balance entre turnos
    const dayTotal = invoices.filter(inv => inv.shift === 'day').reduce((sum, inv) => sum + inv.amount, 0);
    const nightTotal = invoices.filter(inv => inv.shift === 'night').reduce((sum, inv) => sum + inv.amount, 0);
    
    if (dayTotal === 0 && nightTotal > 0) {
      results.push({
        isValid: false,
        message: 'No hay ventas registradas para el turno de día',
        severity: 'warning'
      });
    }

    if (nightTotal === 0 && dayTotal > 0) {
      results.push({
        isValid: false,
        message: 'No hay ventas registradas para el turno de noche',
        severity: 'warning'
      });
    }

    // Validar distribución por categorías
    const foodTotal = invoices.filter(inv => inv.category === 'food').reduce((sum, inv) => sum + inv.amount, 0);
    const drinksTotal = invoices.filter(inv => inv.category === 'drinks').reduce((sum, inv) => sum + inv.amount, 0);
    const shopTotal = invoices.filter(inv => inv.category === 'shop').reduce((sum, inv) => sum + inv.amount, 0);

    if (foodTotal === 0 && drinksTotal === 0 && shopTotal > 0) {
      results.push({
        isValid: false,
        message: 'Solo hay ventas de tienda, revisar categorización',
        severity: 'info'
      });
    }

    return results;
  };

  const validateAuditProgress = (): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Validar pasos críticos
    const criticalSteps = steps.filter(step => 
      step.title.toLowerCase().includes('verifón') || 
      step.title.toLowerCase().includes('crítico')
    );

    const incompleteCritical = criticalSteps.filter(step => !step.completed);
    if (incompleteCritical.length > 0) {
      results.push({
        isValid: false,
        message: `${incompleteCritical.length} pasos críticos pendientes`,
        severity: 'error'
      });
    }

    // Validar orden de pasos
    const preparationSteps = steps.filter(step => step.category === 'preparation');
    const completedPreparation = preparationSteps.filter(step => step.completed);
    const otherCompleted = steps.filter(step => step.category !== 'preparation' && step.completed);

    if (otherCompleted.length > 0 && completedPreparation.length === 0) {
      results.push({
        isValid: false,
        message: 'Se han completado pasos sin finalizar la preparación',
        severity: 'warning'
      });
    }

    // Validar progreso general
    const totalCompleted = steps.filter(step => step.completed).length;
    const progressPercentage = (totalCompleted / steps.length) * 100;

    if (progressPercentage < 30) {
      results.push({
        isValid: true,
        message: `Progreso inicial: ${progressPercentage.toFixed(1)}%`,
        severity: 'info'
      });
    } else if (progressPercentage >= 30 && progressPercentage < 80) {
      results.push({
        isValid: true,
        message: `Progreso avanzado: ${progressPercentage.toFixed(1)}%`,
        severity: 'info'
      });
    } else if (progressPercentage >= 80) {
      results.push({
        isValid: true,
        message: `Auditoría casi completa: ${progressPercentage.toFixed(1)}%`,
        severity: 'info'
      });
    }

    return results;
  };

  const validateTimeConstraints = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    const deadline = new Date();
    deadline.setHours(23, 55, 0, 0);
    
    if (currentTime > deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }
    
    const timeLeft = deadline.getTime() - currentTime.getTime();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);

    if (minutesLeft < 0) {
      results.push({
        isValid: false,
        message: '¡Hora límite para cierre del Verifón superada!',
        severity: 'error'
      });
    } else if (minutesLeft < 30) {
      results.push({
        isValid: false,
        message: `¡URGENTE! Solo quedan ${minutesLeft} minutos para el cierre`,
        severity: 'error'
      });
    } else if (minutesLeft < 60) {
      results.push({
        isValid: false,
        message: `Advertencia: Quedan ${minutesLeft} minutos para el cierre`,
        severity: 'warning'
      });
    } else if (hoursLeft < 2) {
      results.push({
        isValid: true,
        message: `Tiempo restante: ${hoursLeft}h ${minutesLeft % 60}m`,
        severity: 'info'
      });
    }

    return results;
  };

  const validateDataIntegrity = (): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Validar consistencia de datos
    try {
      const savedInvoices = localStorage.getItem('auditoria-facturas');
      const savedSteps = localStorage.getItem('auditoria-steps');
      
      if (!savedInvoices || !savedSteps) {
        results.push({
          isValid: false,
          message: 'Datos no guardados en almacenamiento local',
          severity: 'warning'
        });
      } else {
        results.push({
          isValid: true,
          message: 'Datos guardados correctamente',
          severity: 'info'
        });
      }
    } catch {
      results.push({
        isValid: false,
        message: 'Error al acceder al almacenamiento local',
        severity: 'error'
      });
    }

    // Validar formato de datos
    const invalidInvoices = invoices.filter(inv => 
      !inv.id || 
      !inv.description || 
      typeof inv.amount !== 'number' ||
      !['cash', 'card'].includes(inv.paymentType) ||
      !['day', 'night'].includes(inv.shift) ||
      !['food', 'drinks', 'shop'].includes(inv.category)
    );

    if (invalidInvoices.length > 0) {
      results.push({
        isValid: false,
        message: `${invalidInvoices.length} facturas con formato inválido`,
        severity: 'error'
      });
    }

    return results;
  };

  const allValidations = [
    ...validateInvoices(),
    ...validateAuditProgress(),
    ...validateTimeConstraints(),
    ...validateDataIntegrity()
  ];

  const errors = allValidations.filter(v => v.severity === 'error');
  const warnings = allValidations.filter(v => v.severity === 'warning');
  const infos = allValidations.filter(v => v.severity === 'info');

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen de validación */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Estado de Validación
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{errors.length}</div>
            <div className="text-red-300 text-sm">Errores</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{warnings.length}</div>
            <div className="text-yellow-300 text-sm">Advertencias</div>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{infos.length}</div>
            <div className="text-blue-300 text-sm">Información</div>
          </div>
        </div>

        {/* Validaciones detalladas */}
        <div className="space-y-2">
          {allValidations.map((validation, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getBgColor(validation.severity)}`}
            >
              <div className="flex items-center space-x-3">
                {getIcon(validation.severity)}
                <span className="text-gray-800 text-sm">{validation.message}</span>
              </div>
            </div>
          ))}
          
          {allValidations.length === 0 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-800 text-sm">
                  Todos los datos están validados correctamente
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas de datos */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Estadísticas de Datos
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{invoices.length}</div>
            <div className="text-gray-300 text-sm">Facturas</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </div>
            <div className="text-gray-300 text-sm">Total</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {steps.filter(s => s.completed).length}/{steps.length}
            </div>
            <div className="text-gray-300 text-sm">Pasos</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">
              {((steps.filter(s => s.completed).length / steps.length) * 100).toFixed(0)}%
            </div>
            <div className="text-gray-300 text-sm">Progreso</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función utilitaria para validación en tiempo real
export const validateInvoiceInput = (
  description: string,
  amount: number | string,
  category: string,
  shift: string,
  paymentType: string
): ValidationResult[] => {
  const results: ValidationResult[] = [];

  if (!description.trim()) {
    results.push({
      isValid: false,
      message: 'La descripción es requerida',
      severity: 'error'
    });
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount <= 0) {
    results.push({
      isValid: false,
      message: 'El monto debe ser un número mayor a 0',
      severity: 'error'
    });
  }

  if (numAmount > 10000) {
    results.push({
      isValid: false,
      message: 'Monto muy alto, verificar si es correcto',
      severity: 'warning'
    });
  }

  if (!['food', 'drinks', 'shop'].includes(category)) {
    results.push({
      isValid: false,
      message: 'Categoría inválida',
      severity: 'error'
    });
  }

  if (!['day', 'night'].includes(shift)) {
    results.push({
      isValid: false,
      message: 'Turno inválido',
      severity: 'error'
    });
  }

  if (!['cash', 'card'].includes(paymentType)) {
    results.push({
      isValid: false,
      message: 'Tipo de pago inválido',
      severity: 'error'
    });
  }

  return results;
};
