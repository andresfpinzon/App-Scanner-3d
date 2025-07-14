import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import CustomSlider from '../components/CustomSlider';
import { engineFourServices } from '../services/engineFour.services';
import { ESCANER_PASSWORD, ESCANER_SSID, ESP32_URL } from '../utils/constantes';


const DEBOUNCE_DELAY = 300; // ms

const EscanerScreen = () => {
    // Estados
    const [angulo, setAngulo] = useState(0);
    const [altura, setAltura] = useState(0);
    const [ancho, setAncho] = useState(0);
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);

    // Refs para control
    const lastSentValues = useRef({
        angulo: -1,
        altura: -1,
        ancho: -1
    });
    const debounceTimeouts = useRef({
        angulo: null as NodeJS.Timeout | null,
        altura: null as NodeJS.Timeout | null,
        ancho: null as NodeJS.Timeout | null
    });
    const isMounted = useRef(true);

    // Efecto de limpieza
    useEffect(() => {
        return () => {
            isMounted.current = false;
            Object.values(debounceTimeouts.current).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);

    // Sincronización inicial
    useEffect(() => {
        const init = async () => {
            try {
                const [anguloActual] = await Promise.all([
                    engineFourServices.getAngulo(),
                ]);
                
                if (isMounted.current && anguloActual !== null) {
                    setAngulo(anguloActual);
                    lastSentValues.current.angulo = anguloActual;
                }
            } catch (error) {
                showSnackbar("Error al sincronizar valores iniciales");
            }
        };
        
        init();
    }, []);

    // Función genérica con debounce
    const createDebouncedHandler = (type: 'angulo' | 'altura' | 'ancho') => 
        useCallback((value: number) => {
            // Actualización visual inmediata
            switch (type) {
                case 'angulo': setAngulo(value); break;
                case 'altura': setAltura(value); break;
                case 'ancho': setAncho(value); break;
            }

            // Limpiar timeout previo
            if (debounceTimeouts.current[type]) {
                clearTimeout(debounceTimeouts.current[type]!);
            }

            // Configurar nuevo timeout
            debounceTimeouts.current[type] = setTimeout(async () => {
                try {
                    if (value !== lastSentValues.current[type] && isMounted.current) {
                        // Aquí iría la llamada al servicio correspondiente
                        if (type === 'angulo') {
                            await engineFourServices.setAngulo(value);
                        }
                        // Agregar else if para otros parámetros si es necesario
                        
                        lastSentValues.current[type] = value;
                    }
                } catch (error) {
                    showSnackbar(`Error al actualizar ${type}`);
                    console.error(`Error en ${type}:`, error);
                }
            }, DEBOUNCE_DELAY);
        }, []);

    // Handlers debounceados
    const handleAnguloChange = createDebouncedHandler('angulo');
    const handleAlturaChange = createDebouncedHandler('altura');
    const handleAnchoChange = createDebouncedHandler('ancho');

    // Helper para snackbar
    const showSnackbar = (message: string) => {
        if (isMounted.current) {
            setSnackbar({ visible: true, message });
        }
    };

    const iniciarEscaneo = async () => {
        setLoading(true);
        
        try {
            const response = await fetch(`${ESP32_URL}/start-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ angulo, altura, ancho }),
            });

            showSnackbar(
                response.ok 
                    ? 'Escaneo iniciado correctamente' 
                    : 'Error al iniciar el escaneo'
            );
        } catch (error) {
            showSnackbar('No se pudo conectar al ESP32');
            console.error("Error en escaneo:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Conexión WiFi requerida</Title>
                    <Paragraph>
                        Conéctese a la red <Text style={styles.bold}>{ESCANER_SSID}</Text> con la contraseña <Text style={styles.bold}>{ESCANER_PASSWORD}</Text>.
                    </Paragraph>
                </Card.Content>
            </Card>

            {/* Sliders con debounce integrado */}
            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Inclinación del sensor"
                        value={angulo}
                        min={0}
                        max={90}
                        onChange={handleAnguloChange}
                        unit="°"
                        step={1} // Paso de 1 grado
                    />
                </Card.Content>
            </Card>

            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Ancho del objeto (cm)"
                        value={ancho}
                        min={0}
                        max={30}
                        onChange={handleAnchoChange}
                        unit="cm"
                        step={0.5} // Paso de 0.5 cm
                    />
                </Card.Content>
            </Card>

            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Altura del objeto (cm)"
                        value={altura}
                        min={0}
                        max={200}
                        onChange={handleAlturaChange}
                        unit="cm"
                        step={1} // Paso de 1 cm
                    />
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={iniciarEscaneo}
                style={styles.button}
                disabled={loading}
                loading={loading}
                labelStyle={styles.buttonLabel}
            >
                Iniciar Escaneo
            </Button>

            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbar(prev => ({ ...prev, visible: false })),
                }}
            >
                {snackbar.message}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F6FA',
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
    },
    controlCard: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    button: {
        marginTop: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
    },
    buttonLabel: {
        color: 'white',
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
        color: '#2196F3',
    },
});

export default EscanerScreen;
