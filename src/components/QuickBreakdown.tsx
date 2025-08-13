import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Check, AlertCircle, Save, History } from 'lucide-react';

interface BreakdownRecord {
  id: string;
  date: string;
  totalVerifon: number;
  bebidas109: number;
  comida107: number;
  timestamp: Date;
}

interface QuickBreakdownProps {
  onNotify?: (type: 'success' | 'warning' | 'error', title: string, message: string) => void;
}

export const QuickBreakdown: React.FC<QuickBreakdownProps> = ({ onNotify }) => {
  const [totalVerifon, setTotalVerifon] = useState<string>('');
  const [bebidas109, setBebidas109] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  
  // Cargar historial desde localStorage
  const [history, setHistory] = useState<BreakdownRecord[]>(() => {
    try {
      const savedHistory = localStorage.getItem('desglose-restaurante-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error cargando historial de desglose:', error);
      return [];
    }
  });

  // Cálculo derivado de comida
  const comida107 = useMemo(() => {
    const total = parseFloat(totalVerifon) || 0;
    const bebidas = parseFloat(bebidas109) || 0;
    
    if (total === 0 || bebidas === 0) return 0;
    
    return total - bebidas;
  }, [totalVerifon, bebidas109]);

  // Validación del cálculo
  const validation = useMemo(() => {
    const total = parseFloat(totalVerifon) || 0;
    const bebidas = parseFloat(bebidas109) || 0;
    
    if (total === 0 && bebidas === 0) {
      return { status: 'neutral', message: 'Ingresa los valores para calcular' };
    }
    
    if (bebidas === 0) {
      return { status: 'neutral', message: 'Ingresa el total de bebidas' };
    }
    
    if (total === 0) {
      return { status: 'neutral', message: 'Ingresa el total del Verifón' };
    }
    
    if (comida107 < 0) {
      return { 
        status: 'error', 
        message: `Error: Las bebidas (${bebidas.toFixed(2)}) no pueden ser mayores al total (${total.toFixed(2)})` 
      };
    }
    
    // Verificar que la suma cuadre
    const suma = comida107 + bebidas;
    const diferencia = Math.abs(suma - total);
    
    if (diferencia <= 0.01) {
      return { 
        status: 'success', 
        message: `✓ Cuadra perfectamente: ${comida107.toFixed(2)} + ${bebidas.toFixed(2)} = ${total.toFixed(2)}` 
      };
    } else {
      return { 
        status: 'warning', 
        message: `⚠ Diferencia de ${diferencia.toFixed(2)}: revisar redondeo` 
      };
    }
  }, [totalVerifon, bebidas109, comida107]);

  // Guardar en localStorage cuando cambie el historial
  useEffect(() => {
    try {
      localStorage.setItem('desglose-restaurante-history', JSON.stringify(history));
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  }, [history]);

  const saveBreakdown = () => {
    const total = parseFloat(totalVerifon);
    const bebidas = parseFloat(bebidas109);
    
    if (!total || !bebidas || comida107 < 0) {
      onNotify?.('error', 'Error de Validación', 'Los valores ingresados no son válidos');
      return;
    }
    
    const newRecord: BreakdownRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES'),
      totalVerifon: total,
      bebidas109: bebidas,
      comida107: comida107,
      timestamp: new Date()
    };
    
    setHistory(prev => [newRecord, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
    
    onNotify?.('success', 'Desglose Guardado', 
      `Comida: $${comida107.toFixed(2)}, Bebidas: $${bebidas.toFixed(2)}, Total: $${total.toFixed(2)}`);
    
    // Limpiar formulario
    setTotalVerifon('');
    setBebidas109('');
  };

  const loadFromHistory = (record: BreakdownRecord) => {
    setTotalVerifon(record.totalVerifon.toString());
    setBebidas109(record.bebidas109.toString());
    setShowHistory(false);
  };

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
      setHistory([]);
      onNotify?.('success', 'Historial Limpiado', 'Se eliminó todo el historial de desgloses');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-full">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Desglose Rápido</h2>
            <p className="text-sm text-gray-400">
              Cálculo automático: Comida = Total Verifón - Bebidas
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          <span className="text-sm">Historial</span>
        </button>
      </div>

      {/* Formulario de cálculo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total Verifón (Restaurante)
          </label>
          <input
            type="number"
            step="0.01"
            value={totalVerifon}
            onChange={(e) => setTotalVerifon(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Solo ventas de comida + bebida (sin propinas)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total Bebidas (Folio 109)
          </label>
          <input
            type="number"
            step="0.01"
            value={bebidas109}
            onChange={(e) => setBebidas109(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ventas exclusivamente de bebidas
          </p>
        </div>
      </div>

      {/* Resultado calculado */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Resultado Calculado</h3>
          {validation.status === 'success' && <Check className="w-5 h-5 text-green-500" />}
          {validation.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {validation.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Comida (Folio 107)</p>
            <p className={`text-2xl font-bold ${
              comida107 < 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              ${comida107.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">Bebidas (Folio 109)</p>
            <p className="text-2xl font-bold text-blue-400">
              ${(parseFloat(bebidas109) || 0).toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Verifón</p>
            <p className="text-2xl font-bold text-white">
              ${(parseFloat(totalVerifon) || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Estado de validación */}
        <div className={`p-3 rounded-lg text-sm ${
          validation.status === 'success' ? 'bg-green-900/30 border border-green-600 text-green-200' :
          validation.status === 'error' ? 'bg-red-900/30 border border-red-600 text-red-200' :
          validation.status === 'warning' ? 'bg-yellow-900/30 border border-yellow-600 text-yellow-200' :
          'bg-gray-600 text-gray-300'
        }`}>
          {validation.message}
        </div>

        {/* Botón guardar */}
        {validation.status === 'success' && (
          <button
            onClick={saveBreakdown}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Desglose</span>
          </button>
        )}
      </div>

      {/* Historial */}
      {showHistory && (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Historial de Desgloses</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Limpiar Todo
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No hay desgloses guardados
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((record) => (
                <div
                  key={record.id}
                  onClick={() => loadFromHistory(record)}
                  className="bg-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{record.date}</span>
                    <span className="text-xs text-gray-400">
                      {record.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Total: ${record.totalVerifon.toFixed(2)} | 
                    Comida: ${record.comida107.toFixed(2)} | 
                    Bebidas: ${record.bebidas109.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
