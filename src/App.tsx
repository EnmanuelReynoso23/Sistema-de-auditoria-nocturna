import { useState, useEffect } from 'react';
import { Check, Clock, FileText, CreditCard, Calculator, Printer, CheckCircle, Plus, Trash2, Shield } from 'lucide-react';
import { FloatingWindow } from './components/FloatingWindow';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { DataValidation } from './components/DataValidation';
import { QuickBreakdown } from './components/QuickBreakdown';

interface Step {
  id: number;
  title: string;
  description: string;
  details: string[];
  completed: boolean;
  timeLimit?: string;
  icon?: JSX.Element;
  category: 'preparation' | 'checkout' | 'checkin' | 'breakdown' | 'reports' | 'invoices';
}

interface Invoice {
  id: string;
  description: string;
  amount: number;
  paymentType: 'cash' | 'card';
  shift: 'day' | 'night';
  category: 'food' | 'drinks' | 'shop';
}

const AuditGuideApp = () => {
  const [activeTab, setActiveTab] = useState<'preparation' | 'checkout' | 'checkin' | 'breakdown' | 'reports' | 'invoices' | 'timer' | 'validation'>('preparation');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationSent, setNotificationSent] = useState(false);
  
  // Hook de notificaciones
  const {
    notifications,
    dismissNotification,
    clearAllNotifications,
    notifyDeadlineWarning,
    addNotification
  } = useNotifications();
  
  // Cargar facturas desde localStorage al iniciar
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const savedInvoices = localStorage.getItem('auditoria-facturas');
      return savedInvoices ? JSON.parse(savedInvoices) : [];
    } catch (error) {
      console.error('Error cargando facturas:', error);
      return [];
    }
  });

  // Cargar el contador de facturas desde localStorage
  const [invoiceCounter, setInvoiceCounter] = useState<number>(() => {
    try {
      const savedCounter = localStorage.getItem('auditoria-factura-counter');
      return savedCounter ? parseInt(savedCounter) : 1;
    } catch (error) {
      console.error('Error cargando contador:', error);
      return 1;
    }
  });

  const [newInvoice, setNewInvoice] = useState<{
    description: string;
    amount: string | number;
    paymentType: 'cash' | 'card';
    shift: 'day' | 'night';
    category: 'food' | 'drinks' | 'shop';
  }>({
    description: `Factura ${invoiceCounter}`,
    amount: '',
    paymentType: 'cash',
    shift: 'day',
    category: 'food'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hook para notificar 10 minutos antes del cierre del Verifón
  useEffect(() => {
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(23, 55, 0, 0); // 11:55 PM
    
    // Si ya pasó la hora, configurar para el siguiente día
    if (now > deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }
    
    const tenMinutesBefore = new Date(deadline.getTime() - (10 * 60 * 1000)); // 10 minutos antes (11:45 PM)
    
    // Verificar si estamos dentro de los 10 minutos y no hemos enviado la notificación
    if (now >= tenMinutesBefore && now < deadline && !notificationSent) {
      const minutesLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60));
      
      // Solicitar permisos de notificación si no están concedidos
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            notifyDeadlineWarning(minutesLeft);
            setNotificationSent(true);
          }
        });
      } else if (Notification.permission === 'granted') {
        notifyDeadlineWarning(minutesLeft);
        setNotificationSent(true);
      }
    }
    
    // Resetear la notificación al pasar el deadline para el próximo día
    if (now > deadline && notificationSent) {
      setNotificationSent(false);
    }
  }, [currentTime, notificationSent, notifyDeadlineWarning]);

  // Solicitar permisos de notificación al cargar la aplicación
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Guardar facturas en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('auditoria-facturas', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error guardando facturas:', error);
    }
  }, [invoices]);

  // Guardar contador en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('auditoria-factura-counter', invoiceCounter.toString());
    } catch (error) {
      console.error('Error guardando contador:', error);
    }
  }, [invoiceCounter]);

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Adecuar Área de Papeles de Auditoría",
      description: "Configuración inicial del espacio de trabajo",
      details: [
        "Adecuar el área donde colocar los papeles de la auditoría",
        "Organizar el espacio de trabajo de manera eficiente",
        "Preparar separadores y carpetas necesarias",
        "Verificar materiales: grapadora, clips, calculadora"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'preparation'
    },
    {
      id: 2,
      title: "Cierre del Verifón",
      description: "CRÍTICO: Antes de las 12:00 AM (11:55 PM máximo)",
      details: [
        "HACER EL CIERRE DEL VERIFÓN ANTES DE LAS 12 DE LA MEDIA NOCHE",
        "Horario límite estricto: 11:55 PM - NO EXCEDER",
        "Verificar que todas las transacciones del día estén procesadas",
        "Generar el reporte de cierre completo",
        "Confirmar que el total del cierre coincida con las ventas registradas"
      ],
      completed: false,
      timeLimit: "11:55 PM",
      icon: <Clock className="w-4 h-4" />,
      category: 'preparation'
    },
    {
      id: 3,
      title: "Chequeo Folder de Check-Outs",
      description: "IR A HOTELLO - Verificación de salidas",
      details: [
        "IR A HOTELLO - Ubicado en el primer icono de Hotello",
        "ELEGIR DEPARTURES y mostrar todos los check-outs",
        "VERIFICAR PAGOS:",
        "• Que el monto cobrado sea el mismo adeudado",
        "• Que el número de aprobación sea el mismo",
        "• Que el tipo de tarjeta sea el mismo (si sistema dice Visa, voucher debe decir Visa)",
        "CHEQUEO DE FACTURAS: Confirmar lo físico con lo cargado a la habitación",
        "Si alguna no fue cargada: NOTIFICAR al supervisor de turno"
      ],
      completed: false,
      icon: <CheckCircle className="w-4 h-4" />,
      category: 'checkout'
    },
    {
      id: 4,
      title: "Chequeo Folder Trabajo del Día",
      description: "Revisión de facturas de proveedores y comandas",
      details: [
        "Ver si hay facturas de proveedores",
        "Anexar las comandas del restaurante",
        "Seguir archivando ENCIMA de los check-outs ya chequeados",
        "Verificar facturas cargadas a Hotello:",
        "• Del restaurante",
        "• De la tienda", 
        "• Limpieza de habitaciones",
        "• Cargos de lavandería, etc.",
        "IMPORTANTE: Estos deben ser grapados en la tarjeta de registro correspondiente"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'checkout'
    },
    {
      id: 5,
      title: "Verificación de Propinas del Restaurante",
      description: "Sub folio 908 - Proceso de propinas",
      details: [
        "Verificar si hay propinas firmadas del restaurante",
        "Las copias deberían estar hechas, pero CONFIRMAR",
        "Verificar en las remesas del restaurante (CONFIRMAR)",
        "Hacer un sub folio 908",
        "Insertar UN CARGO con un solo monto de las propinas ya sumadas",
        "Llevarlas a dólares",
        "Proceder a los pagos UNO POR UNO según el monto de propina de cada voucher",
        "Agregar a trabajo del día"
      ],
      completed: false,
      icon: <Calculator className="w-4 h-4" />,
      category: 'checkout'
    },
    {
      id: 6,
      title: "Verificar los Check-Ins",
      description: "IR A HOTELLO - IN-HOUSE",
      details: [
        "IR A HOTELLO - Primer icono y elegir IN-HOUSE",
        "ORGANIZAR por el orden que están en Hotello",
        "Verificar: pago, # de aprobación, tipo de tarjeta, monto cobrado",
        "En caso de arreglarlo:",
        "• Si se cobró de menos: insertar el monto que se cobró",
        "• El que dice en el voucher de pago",
        "• Notificarlo al supervisor de turno a quien hizo el error",
        "Verificar la tarifa que está cargando (IR A CHANGE)",
        "Que sea la misma que dice el sistema y el soporte de la compañía",
        "Si es directo también verificar"
      ],
      completed: false,
      icon: <CreditCard className="w-4 h-4" />,
      category: 'checkin'
    },
    {
      id: 7,
      title: "Acumular Documentos Check-In Separados",
      description: "Organización de documentos por categorías",
      details: [
        "Al verificar un check-in acumular SEPARADOS:",
        "1. VOUCHERS DE PAGOS:",
        "   • Después de acumulados irán grapados con el cierre del verifón",
        "   • Ordenados y cotejados como que se revisaron",
        "2. HOJA IMPRESA DE HOTELLO del pago de la habitación:",
        "   • Después de acumuladas irán todas grapadas",
        "   • Colocadas en el trabajo de la auditoría",
        "3. TARJETAS DE REGISTRO:",
        "   • Luego de revisadas serán archivadas en el pin de habitaciones",
        "   • Las facturas verificadas también deben ser grapadas en la tarjeta"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'checkin'
    },
    {
      id: 8,
      title: "Desglose Comida y Bebida Restaurante 7/3",
      description: "Primer turno - Desglose manual",
      details: [
        "DESGLOSE DE LA COMIDA Y BEBIDA DEL RESTAURANTE - TURNO 7/3",
        "Separar comida y bebida de ventas en EFECTIVO",
        "Separar comida y bebida de ventas por TARJETA DE CRÉDITO",
        "Hacerlo MANUALMENTE - debe cuadrar EXACTAMENTE",
        "Debe coincidir con el cuadre de ese mismo turno del restaurante",
        "OJO: Estos procesos se deben trabajar los 2 turnos por separado",
        "Colocar las ventas por separado en la hoja de cálculo",
        "Anotar la venta en efectivo de cada turno y sumarlas"
      ],
      completed: false,
      icon: <Calculator className="w-4 h-4" />,
      category: 'invoices'
    },
    {
      id: 9,
      title: "Desglose Comida y Bebida Restaurante 3/11",
      description: "Segundo turno - Desglose manual",
      details: [
        "DESGLOSE DE LA COMIDA Y BEBIDA DEL RESTAURANTE - TURNO 3/11",
        "Separar comida y bebida de ventas en EFECTIVO",
        "Separar comida y bebida de ventas por TARJETA DE CRÉDITO",
        "Hacerlo MANUALMENTE - debe cuadrar EXACTAMENTE",
        "Debe coincidir con el cuadre de ese mismo turno del restaurante",
        "Confirmar que al insertar el pago cash al final de cada folio",
        "Sea el que en realidad tengo"
      ],
      completed: false,
      icon: <Calculator className="w-4 h-4" />,
      category: 'invoices'
    },
    {
      id: 10,
      title: "Desglose Ventas de la Tienda",
      description: "Procesamiento de gift shop",
      details: [
        "Las ventas de la tienda: extraer el efectivo",
        "Si hay pagos con tarjeta también (sumarlos)",
        "Luego de que ya tengo los 3 desgloses, colocarlos en hoja de cálculo",
        "Para crear hoja de cálculo:",
        "• Ir a Excel",
        "• En esquina superior izquierda está el icono",
        "• Elegir hoja de cálculo"
      ],
      completed: false,
      icon: <Calculator className="w-4 h-4" />,
      category: 'breakdown'
    },
    {
      id: 11,
      title: "Crear Folio Beach Club 107",
      description: "Folio de comida del bar",
      details: [
        "Crear folio Beach Club 107",
        "Insertar el cargo de la comida del bar (está en hoja de cálculo en negrita)",
        "Proceder a insertar los pagos con tarjetas de las ventas DEL RESTAURANTE",
        "Utilizar los pagos de tarjeta del día Y de la noche",
        "El balance en rojo más el de la bebida (en pesos)",
        "Debe ser el monto que adquirimos de las 2 ventas del restaurante (el cash)"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'breakdown'
    },
    {
      id: 12,
      title: "Crear Folio Bar Beverages 109",
      description: "Folio de bebidas",
      details: [
        "Crear folio Bar Beverages 109",
        "Insertar el cargo de bebidas",
        "Insertar el pago correspondiente",
        "Después de haber insertado los pagos con tarjeta:",
        "El monto faltante debe ser el mismo de las 2 ventas cash del día y noche que ya sumé"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'breakdown'
    },
    {
      id: 13,
      title: "Crear Folio 901 Gift Shop",
      description: "Procesamiento de tienda y remesa",
      details: [
        "Crear folio 901 Gift Shop",
        "Insertar el cargo y luego el pago correspondiente",
        "Hay que pagar primero con tarjeta si tenemos",
        "Para hacer la remesa de la tienda:",
        "• Se debe imprimir en el icono #9",
        "• Ir abajo, deshacer todo",
        "• Elegir payment, refresh y luego print",
        "Grapar el sobre de la remesa con las facturas y papel del icono #9",
        "Asentarlo en el folder de las remesas"
      ],
      completed: false,
      icon: <FileText className="w-4 h-4" />,
      category: 'breakdown'
    },
    {
      id: 14,
      title: "Cierre del Día - Icono Luna",
      description: "Reports List - Papeles para contabilidad",
      details: [
        "CIERRE DEL DÍA - ICONO LUNA",
        "Icono Reports List",
        "OJO: Todo se imprime del día (fecha) que se está trabajando la auditoría",
        "PAPELES PARA CONTABILIDAD:",
        "• Ir a Marketing e imprimir: Rate Code Statistics",
        "• Ir a Folio Balances, abrir y solo dejar cotejo a In House e imprimir",
        "• Ir a Transactions Journal e imprimir:",
        "  - SUMMARY BY GENERAL LEDGER",
        "  - TRANSACTIONS JOURNAL DETAILS BY GL"
      ],
      completed: false,
      icon: <Printer className="w-4 h-4" />,
      category: 'reports'
    },
    {
      id: 15,
      title: "Papeles para Ama de Llaves",
      description: "Impresiones finales para housekeeping",
      details: [
        "PAPELES PARA AMA DE LLAVES:",
        "• IR a Reservations e imprimir:",
        "  - Arrivals",
        "  - In House Guest (elegir room)",
        "  - Departures",
        "• Luego ir a Folios:",
        "  - Clic DESK FOLIOS",
        "  - Luego OPEN",
        "  - FOLIO LIST e imprimir",
        "• Imprimir un In House para el restaurante",
        "• Colocarle la cantidad de personas que hay en cada habitación"
      ],
      completed: false,
      icon: <Printer className="w-4 h-4" />,
      category: 'reports'
    }
  ]);

  const toggleStep = (id: number) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const addInvoice = () => {
    const amountNum = typeof newInvoice.amount === 'string' ? parseFloat(newInvoice.amount) : newInvoice.amount;
    if (newInvoice.description && amountNum > 0) {
      const invoice: Invoice = {
        id: Date.now().toString(),
        description: newInvoice.description,
        amount: amountNum,
        paymentType: newInvoice.paymentType,
        shift: newInvoice.shift,
        category: newInvoice.category
      };
      setInvoices([...invoices, invoice]);
      // Incrementar el contador y actualizar la descripción
      const nextCounter = invoiceCounter + 1;
      setInvoiceCounter(nextCounter);
      setNewInvoice({
        description: `Factura ${nextCounter}`,
        amount: '',
        paymentType: 'cash',
        shift: 'day',
        category: 'food'
      });
    }
  };

  const clearAllInvoices = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las facturas? Esta acción no se puede deshacer.')) {
      setInvoices([]);
      setInvoiceCounter(1);
      setNewInvoice({
        description: 'Factura 1',
        amount: '',
        paymentType: 'cash',
        shift: 'day',
        category: 'food'
      });
    }
  };

  const removeInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getTimeToDeadline = () => {
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(23, 55, 0, 0); // 11:55 PM
    
    if (now > deadline) {
      deadline.setDate(deadline.getDate() + 1); // Next day
    }
    
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, isUrgent: hours === 0 && minutes < 30 };
  };

  const timeToDeadline = getTimeToDeadline();

  const getTotalsByCategory = () => {
    return invoices.reduce((acc, invoice) => {
      const key = `${invoice.category}_${invoice.shift}_${invoice.paymentType}`;
      acc[key] = (acc[key] || 0) + invoice.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const categoryColors = {
    preparation: 'border-purple-500',
    checkout: 'border-blue-500',
    checkin: 'border-green-500',
    breakdown: 'border-yellow-500',
    reports: 'border-red-500',
    invoices: 'border-orange-500'
  };

  const categoryTitles = {
    preparation: 'Preparación',
    checkout: 'Check-Outs',
    checkin: 'Check-Ins',
    breakdown: 'Desgloses y Folios',
    reports: 'Reportes Finales',
    invoices: 'Facturas y Desgloses'
  };

  const getStepsByCategory = (category: string) => steps.filter(step => step.category === category);

  const getCategoryProgress = (category: string) => {
    const categorySteps = getStepsByCategory(category);
    const completedCategorySteps = categorySteps.filter(step => step.completed).length;
    return {
      completed: completedCategorySteps,
      total: categorySteps.length,
      percentage: categorySteps.length > 0 ? (completedCategorySteps / categorySteps.length) * 100 : 0
    };
  };

  const renderCategorySteps = (category: 'preparation' | 'checkout' | 'checkin' | 'breakdown' | 'reports' | 'invoices') => {
    const categorySteps = getStepsByCategory(category);
    const progress = getCategoryProgress(category);
    
    return (
      <div className="space-y-6">
        {/* Quick Breakdown Component for breakdown category */}
        {category === 'breakdown' && (
          <QuickBreakdown
            onNotify={(type, title, message) => addNotification({
              type,
              title,
              message
            })}
          />
        )}

        {/* Category Header */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {categoryTitles[category]}
            </h2>
            {category === 'preparation' && timeToDeadline.isUrgent && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ⚠️ ¡Cierre Verifón Urgente!
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="text-gray-300">
              Progreso de esta sección: {progress.completed}/{progress.total} pasos
            </div>
            <div className="text-gray-300">
              {Math.round(progress.percentage)}% completado
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categorySteps.map((step) => (
            <div 
              key={step.id}
              className={`bg-gray-800 rounded-lg p-6 border-l-4 transition-all duration-200 ${
                step.completed 
                  ? 'border-green-500 bg-green-900/20' 
                  : categoryColors[category]
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {step.icon}
                </div>
                
                <button
                  onClick={() => toggleStep(step.id)}
                  className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <h3 className={`text-lg font-bold ${
                    step.completed ? 'text-green-300' : 'text-white'
                  }`}>
                    {step.id}. {step.title}
                  </h3>
                  {step.timeLimit && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                      ⏰ {step.timeLimit}
                    </span>
                  )}
                </div>
                
                <p className={`text-base ${
                  step.completed ? 'text-green-400' : 'text-gray-300'
                }`}>
                  {step.description}
                </p>
                
                <ul className="space-y-2 mt-4">
                  {step.details.map((detail, index) => (
                    <li key={index} className={`text-sm flex items-start space-x-3 ${
                      step.completed ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      <span className="text-blue-400 mt-1 text-sm">•</span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <FloatingWindow>
      <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white">
              Sistema de Auditoría Nocturna
            </h1>
            <NotificationSystem
              notifications={notifications}
              onDismiss={dismissNotification}
              onClearAll={clearAllNotifications}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-300">
              Hora: {getCurrentTime()}
            </div>
            <div className="text-gray-300">
              Progreso: {completedSteps}/{totalSteps} ({Math.round(progressPercentage)}%)
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('preparation')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'preparation'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📋 Preparación
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'checkout'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✅ Check-Outs
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'checkin'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏨 Check-Ins
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'breakdown'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 Desgloses & Folios
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🧾 Facturas
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🖨️ Reportes
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'timer'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⏰ Temporizador
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'bg-gray-900 text-white border-t border-l border-r border-gray-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" /> Validación
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {(activeTab === 'preparation' || activeTab === 'checkout' || activeTab === 'checkin' || activeTab === 'breakdown' || activeTab === 'reports') && 
          renderCategorySteps(activeTab)
        }

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Invoice Form and List Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Invoice Form */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Agregar Nueva Factura</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción de la Factura
                    </label>
                    <input
                      type="text"
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Ej: Mesa 5 - Cena completa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categoría
                      </label>
                      <select
                        value={newInvoice.category}
                        onChange={(e) => setNewInvoice({...newInvoice, category: e.target.value as 'food' | 'drinks' | 'shop'})}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="food">Comida</option>
                        <option value="drinks">Bebidas</option>
                        <option value="shop">Tienda</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Turno
                      </label>
                      <select
                        value={newInvoice.shift}
                        onChange={(e) => setNewInvoice({...newInvoice, shift: e.target.value as 'day' | 'night'})}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="day">Día (7/3)</option>
                        <option value="night">Noche (3/11)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Pago
                    </label>
                    <select
                      value={newInvoice.paymentType}
                      onChange={(e) => setNewInvoice({...newInvoice, paymentType: e.target.value as 'cash' | 'card'})}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                    </select>
                  </div>

                  <button
                    onClick={addInvoice}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Factura</span>
                  </button>
                </div>
              </div>

              {/* Invoice List */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Facturas Registradas ({invoices.length})
                  </h2>
                  {invoices.length > 0 && (
                    <button
                      onClick={clearAllInvoices}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      Limpiar Todo
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {invoices.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No hay facturas registradas aún
                    </p>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              invoice.category === 'food' ? 'bg-orange-600 text-white' :
                              invoice.category === 'drinks' ? 'bg-blue-600 text-white' :
                              'bg-purple-600 text-white'
                            }`}>
                              {invoice.category === 'food' ? 'Comida' : 
                               invoice.category === 'drinks' ? 'Bebidas' : 'Tienda'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              invoice.shift === 'day' ? 'bg-yellow-600 text-white' : 'bg-indigo-600 text-white'
                            }`}>
                              {invoice.shift === 'day' ? 'Día' : 'Noche'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              invoice.paymentType === 'cash' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {invoice.paymentType === 'cash' ? 'Efectivo' : 'Tarjeta'}
                            </span>
                          </div>
                          <p className="text-white text-sm font-medium">{invoice.description}</p>
                          <p className="text-green-400 font-bold">${invoice.amount.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeInvoice(invoice.id)}
                          className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {invoices.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Resumen de Ventas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['food', 'drinks', 'shop'].map((category) => (
                    <div key={category} className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-3 text-center">
                        {category === 'food' ? '🍽️ Comida' : 
                         category === 'drinks' ? '🍹 Bebidas' : '🛍️ Tienda'}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Efectivo Día:</span>
                          <span className="text-yellow-400 font-medium">
                            ${(getTotalsByCategory()[`${category}_day_cash`] || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efectivo Noche:</span>
                          <span className="text-yellow-400 font-medium">
                            ${(getTotalsByCategory()[`${category}_night_cash`] || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarjeta Día:</span>
                          <span className="text-blue-400 font-medium">
                            ${(getTotalsByCategory()[`${category}_day_card`] || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarjeta Noche:</span>
                          <span className="text-blue-400 font-medium">
                            ${(getTotalsByCategory()[`${category}_night_card`] || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-green-400">
                            ${(
                              (getTotalsByCategory()[`${category}_day_cash`] || 0) +
                              (getTotalsByCategory()[`${category}_night_cash`] || 0) +
                              (getTotalsByCategory()[`${category}_day_card`] || 0) +
                              (getTotalsByCategory()[`${category}_night_card`] || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Steps Section */}
            {renderCategorySteps('invoices')}
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-lg p-8 border-2 text-center ${
              timeToDeadline.isUrgent ? 'bg-red-900/50 border-red-500' : 'bg-gray-800 border-gray-600'
            }`}>
              <h2 className="text-3xl font-bold text-white mb-4">
                ⏰ Temporizador Verifón
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Tiempo restante para cierre (11:55 PM)
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className={`text-3xl font-bold ${timeToDeadline.isUrgent ? 'text-red-400' : 'text-blue-400'}`}>
                    {timeToDeadline.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400">Horas</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className={`text-3xl font-bold ${timeToDeadline.isUrgent ? 'text-red-400' : 'text-blue-400'}`}>
                    {timeToDeadline.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400">Minutos</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className={`text-3xl font-bold ${timeToDeadline.isUrgent ? 'text-red-400' : 'text-blue-400'}`}>
                    {timeToDeadline.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400">Segundos</div>
                </div>
              </div>

              {timeToDeadline.isUrgent && (
                <div className="bg-red-800 border border-red-600 rounded-lg p-4 mb-4">
                  <p className="text-red-200 font-bold">
                    ⚠️ ¡URGENTE! Menos de 30 minutos para el cierre
                  </p>
                </div>
              )}

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-lg text-white mb-2">Hora Actual</h3>
                <p className="text-2xl font-mono text-blue-400">{getCurrentTime()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <DataValidation
            invoices={invoices}
            steps={steps}
            currentTime={currentTime}
          />
        )}


        {completedSteps === totalSteps && (
          <div className="mt-6 bg-green-800 border border-green-600 text-green-100 px-4 py-3 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">¡Auditoría Completada!</h2>
            <p>Has completado todos los pasos del proceso de auditoría nocturna.</p>
          </div>
        )}
      </div>
    </div>
    </FloatingWindow>
  );
};

export default AuditGuideApp;
