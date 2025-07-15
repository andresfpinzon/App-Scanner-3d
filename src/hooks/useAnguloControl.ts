// hooks/useAnguloControl.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { engineFourServices } from "../services/engineFour.services";

const DEBOUNCE_DELAY = 800; // Aumentado para conexiones móviles

export const useAnguloControl = () => {
  const [angulo, setAnguloState] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSent = useRef(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Función para mostrar logs detallados
  const logDebug = (message: string, data?: any) => {
    console.log(`[useAnguloControl] ${message}`, data || '');
  };

  // Inicializar ángulo al montar
  useEffect(() => {
    const init = async () => {
      try {
        logDebug("Inicializando ángulo...");
        setIsLoading(true);
        const anguloActual = await engineFourServices.getAngulo();
        
        if (anguloActual !== null && isMounted.current) {
          logDebug("Ángulo inicial obtenido:", anguloActual);
          setAnguloState(anguloActual);
          lastSent.current = anguloActual;
          setError(null);
        } else {
          logDebug("No se pudo obtener ángulo inicial");
        }
      } catch (err) {
        logDebug("Error al sincronizar ángulo:", err);
        setError("Error al obtener ángulo inicial");
      } finally {
        setIsLoading(false);
      }
    };
    
    init();

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const setAngulo = useCallback((valor: number) => {
    logDebug("Cambiando ángulo a:", valor);
    setAnguloState(valor);
    setError(null);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      logDebug("Timeout anterior cancelado");
    }

    // Mostrar indicador de carga inmediatamente
    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (valor !== lastSent.current && isMounted.current) {
          logDebug("Enviando ángulo al ESP32:", valor);
          logDebug("Valor anterior:", lastSent.current);
          
          await engineFourServices.setAngulo(valor);
          
          lastSent.current = valor;
          logDebug("Ángulo enviado exitosamente");
          
          // Verificar que se aplicó correctamente
          setTimeout(async () => {
            try {
              const verificacion = await engineFourServices.getAngulo();
              logDebug("Verificación del ángulo:", verificacion);
              if (verificacion !== valor) {
                logDebug("Advertencia: El ángulo verificado no coincide");
              }
            } catch (verifyErr) {
              logDebug("Error en verificación:", verifyErr);
            }
          }, 1000);
          
        } else {
          logDebug("No se envía - mismo valor o componente desmontado");
        }
      } catch (error) {
        logDebug("Error al enviar ángulo:", error);
        setError(`Error al enviar ángulo: ${error}`);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const forceSync = useCallback(async () => {
    try {
      logDebug("Forzando sincronización...");
      setIsLoading(true);
      const anguloActual = await engineFourServices.getAngulo();
      
      if (anguloActual !== null && isMounted.current) {
        setAnguloState(anguloActual);
        lastSent.current = anguloActual;
        setError(null);
        logDebug("Sincronización forzada exitosa:", anguloActual);
      }
    } catch (err) {
      logDebug("Error en sincronización forzada:", err);
      setError("Error al sincronizar");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    angulo, 
    setAngulo, 
    isLoading, 
    error,
    forceSync,
    clearError: () => setError(null)
  };
};