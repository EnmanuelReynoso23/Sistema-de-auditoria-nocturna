import React, { useEffect, useState } from 'react';
import { Pin, PinOff, Move } from 'lucide-react';

interface FloatingWindowProps {
  children: React.ReactNode;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({ children }) => {
  const [isPinned, setIsPinned] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Solicitar permisos para notificaciones y keep awake
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Prevenir que la página se descargue
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPinned) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres cerrar la auditoría?';
        return e.returnValue;
      }
    };

    // Mantener la ventana enfocada si está "pinned"
    const handleBlur = () => {
      if (isPinned && document.hidden === false) {
        setTimeout(() => {
          window.focus();
        }, 100);
      }
    };

    // Prevenir cierre accidental con Ctrl+W
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPinned && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          const confirmClose = window.confirm('¿Estás seguro de que quieres cerrar la auditoría?');
          if (confirmClose) {
            setIsPinned(false);
            window.close();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);

    // Wake Lock API para mantener la pantalla activa
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock not supported or failed:', err);
      }
    };

    if (isPinned) {
      requestWakeLock();
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isPinned]);

  // Abrir en ventana popup si es posible
  const openInPopup = () => {
    const popup = window.open(
      window.location.href,
      'AuditoriaWindow',
      `width=1200,height=800,top=100,left=100,resizable=yes,scrollbars=yes,status=yes,alwaysRaised=yes`
    );
    
    if (popup) {
      popup.focus();
      // Intentar mantener el foco en la ventana popup
      const keepFocus = setInterval(() => {
        if (popup.closed) {
          clearInterval(keepFocus);
        } else {
          popup.focus();
        }
      }, 2000);
    }
  };

  // Funciones de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de control flotante */}
      <div 
        className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border transition-all duration-300"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="flex items-center p-2 space-x-2">
          {/* Indicador de estado */}
          <div className={`w-3 h-3 rounded-full ${isPinned ? 'bg-green-500' : 'bg-gray-400'}`} />
          
          {/* Toggle Pin */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-md transition-colors ${
              isPinned 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPinned ? 'Desactivar modo flotante' : 'Activar modo flotante'}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>

          {/* Abrir en ventana popup */}
          <button
            onClick={openInPopup}
            className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Abrir en ventana separada"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="transition-all duration-300">
        {children}
      </div>

      {/* Overlay cuando está en modo arrastre */}
      {isDragging && (
        <div className="fixed inset-0 z-30 cursor-grabbing" />
      )}
    </div>
  );
};
