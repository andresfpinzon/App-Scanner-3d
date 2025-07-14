import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Title, Snackbar, Divider } from 'react-native-paper';
import CustomSlider from '../components/CustomSlider';
import { engineFourServices } from '../services/engineFour.services';
import { ESCANER_PASSWORD, ESCANER_SSID, ESP32_URL } from '../utils/constantes';

const DEBOUNCE_DELAY = 300; // ms

const ALTURA_PRESETS = [
  { label: "Pequeño (50cm)", value: 50 },
  { label: "Mediano (100cm)", value: 100 },
  { label: "Grande (150cm)", value: 150 }
];

const EscanerScreen = () => {
    // Estados
    const [angulo, setAngulo] = useState(0);
    const [altura, setAltura] = useState(50);
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
    const handleAnchoChange = createDebouncedHandler('ancho');

    // Handler para altura con presets
    const handleAlturaPreset = (value: number) => {
        setAltura(value);
        // Enviar inmediatamente sin debounce
        if (value !== lastSentValues.current.altura) {
            // Aquí iría la llamada al servicio para altura si existiera
            lastSentValues.current.altura = value;
        }
    };

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

    // Reiniciar valores
    const reiniciarPosicion = () => {
        // Resetear ángulo con debounce
        handleAnguloChange(0);
        
        // Resetear altura (usa el primer preset)
        const initialAltura = ALTURA_PRESETS[0].value;
        setAltura(initialAltura);
        lastSentValues.current.altura = initialAltura;
        
        // Resetear ancho
        setAncho(0);
        lastSentValues.current.ancho = 0;
        
        showSnackbar('Posición reiniciada');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.connectionCard}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Configuración WiFi</Title>
                    <Divider style={styles.divider} />
                    <Text style={styles.cardText}>
                        Conéctese a la red: 
                        <Text style={styles.highlight}> {ESCANER_SSID}</Text>
                    </Text>
                    <Text style={styles.cardText}>
                        Contraseña: 
                        <Text style={styles.highlight}> {ESCANER_PASSWORD}</Text>
                    </Text>
                </Card.Content>
            </Card>

            {/* Controles de escaneo */}
            <Card style={styles.controlCard}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Ajustes de Escaneo</Title>
                    <Divider style={styles.divider} />
                    
                    {/* Inclinación */}
                    <CustomSlider
                        title="Inclinación del sensor"
                        value={angulo}
                        min={0}
                        max={90}
                        onChange={handleAnguloChange}
                        unit="°"
                        step={1}
                        //style={styles.slider}
                    />
                    
                    {/* Ancho */}
                    <CustomSlider
                        title="Ancho del objeto (cm)"
                        value={ancho}
                        min={0}
                        max={30}
                        onChange={handleAnchoChange}
                        unit="cm"
                        step={0.5}
                        //style={styles.slider}
                    />
                    
                    {/* Altura con presets */}
                    <Text style={styles.presetTitle}>Altura predefinida:</Text>
                    <View style={styles.presetContainer}>
                        {ALTURA_PRESETS.map((preset, index) => (
                            <Button
                                key={index}
                                mode={altura === preset.value ? "contained" : "outlined"}
                                onPress={() => handleAlturaPreset(preset.value)}
                                style={[
                                    styles.presetButton,
                                    altura === preset.value && styles.selectedPreset
                                ]}
                                labelStyle={styles.presetLabel}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </View>
                </Card.Content>
            </Card>

            {/* Acciones */}
            <View style={styles.actionsContainer}>
                <Button
                    mode="outlined"
                    onPress={reiniciarPosicion}
                    style={styles.resetButton}
                    labelStyle={styles.resetButtonLabel}
                >
                    Reiniciar Posición
                </Button>
                
                <Button
                    mode="contained"
                    onPress={iniciarEscaneo}
                    style={styles.scanButton}
                    disabled={loading}
                    loading={loading}
                    labelStyle={styles.scanButtonLabel}
                >
                    Iniciar Escaneo
                </Button>
            </View>

            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
                duration={3000}
                style={styles.snackbar}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbar(prev => ({ ...prev, visible: false })),
                }}
            >
                {snackbar.message}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    connectionCard: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        marginBottom: 20,
        elevation: 1,
    },
    controlCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e3a8a',
    },
    cardText: {
        fontSize: 15,
        marginVertical: 4,
        color: '#374151',
    },
    highlight: {
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    divider: {
        backgroundColor: '#dbeafe',
        marginVertical: 8,
        height: 1,
    },
    slider: {
        marginVertical: 12,
    },
    presetTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: 10,
        marginBottom: 8,
        color: '#374151',
    },
    presetContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    presetButton: {
        flexBasis: '48%',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    selectedPreset: {
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
    },
    presetLabel: {
        fontSize: 13,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    resetButton: {
        flex: 1,
        marginRight: 8,
        borderColor: '#3b82f6',
    },
    resetButtonLabel: {
        color: '#3b82f6',
    },
    scanButton: {
        flex: 1,
        backgroundColor: '#1e40af',
    },
    scanButtonLabel: {
        color: 'white',
        fontWeight: 'bold',
    },
    snackbar: {
        backgroundColor: '#1e3a8a',
    },
});

export default EscanerScreen;