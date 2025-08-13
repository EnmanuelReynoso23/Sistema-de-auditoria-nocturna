import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.persistent).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones ({notifications.length})
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar todo
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 ${getBackgroundColor(notification.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.persistent && (
                              <button
                                onClick={() => onDismiss(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex space-x-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  action.action();
                                  if (!notification.persistent) {
                                    onDismiss(notification.id);
                                  }
                                }}
                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                  action.variant === 'primary'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook para manejar notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss para notificaciones no persistentes
    if (!notification.persistent) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 5000);
    }

    // Mostrar notificación del navegador si está permitido
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type
      });
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Notificaciones específicas para auditoría
  const notifyDeadlineWarning = (minutesLeft: number) => {
    addNotification({
      type: 'warning',
      title: '⚠️ Advertencia de Tiempo',
      message: `Quedan ${minutesLeft} minutos para el cierre del Verifón (11:55 PM)`,
      persistent: true,
      actions: [
        {
          label: 'Ir a Cierre',
          action: () => {
            // Esta acción será implementada por el componente padre
          },
          variant: 'primary'
        }
      ]
    });
  };

  const notifyStepCompleted = (stepTitle: string) => {
    addNotification({
      type: 'success',
      title: '✅ Paso Completado',
      message: `"${stepTitle}" ha sido marcado como completado`
    });
  };

  const notifyDataSaved = () => {
    addNotification({
      type: 'success',
      title: '💾 Datos Guardados',
      message: 'Los datos de la auditoría han sido guardados automáticamente'
    });
  };

  const notifyValidationError = (field: string, error: string) => {
    addNotification({
      type: 'error',
      title: '❌ Error de Validación',
      message: `${field}: ${error}`
    });
  };

  const notifyBackupCreated = () => {
    addNotification({
      type: 'info',
      title: '🔄 Backup Creado',
      message: 'Se ha creado un backup automático de los datos'
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    // Notificaciones específicas
    notifyDeadlineWarning,
    notifyStepCompleted,
    notifyDataSaved,
    notifyValidationError,
    notifyBackupCreated
  };
};
