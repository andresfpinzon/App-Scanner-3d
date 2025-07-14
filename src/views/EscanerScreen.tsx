import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, useColorScheme } from 'react-native';
import { Text, Button, Card, Title, Snackbar, Divider, useTheme } from 'react-native-paper';
import CustomSlider from '../components/CustomSlider';
import { engineFourServices } from '../services/engineFour.services';
import { ESCANER_PASSWORD, ESCANER_SSID, ESP32_URL } from '../utils/constantes';

const DEBOUNCE_DELAY = 300; // ms
const { width } = Dimensions.get('window');
const isSmallScreen = width < 375; // iPhone SE y dispositivos pequeños

const ALTURA_PRESETS = [
  { label: "50 cm", value: 50 },
  { label: "100 cm", value: 100 },
  { label: "150 cm", value: 150 }
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

    // Tema y modo oscuro
    const colorScheme = useColorScheme();
    const theme = useTheme();
    const isDarkMode = colorScheme === 'dark';
    
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

    // Colores para modo oscuro/claro
    const colors = useMemo(() => ({
        primary: theme.colors.primary,
        accent: theme.colors.secondary,
        background: isDarkMode ? '#121212' : '#f8f9fa',
        surface: isDarkMode ? '#1e1e1e' : '#ffffff',
        surfaceVariant: isDarkMode ? '#2d2d2d' : '#e3f2fd',
        text: isDarkMode ? '#e0e0e0' : '#333333',
        textSecondary: isDarkMode ? '#a0a0a0' : '#666666',
        highlight: isDarkMode ? '#90caf9' : '#1e88e5',
        border: isDarkMode ? '#444444' : '#e0e0e0',
        snackbar: isDarkMode ? '#2d2d2d' : '#1e3a8a',
        button: isDarkMode ? '#bb86fc' : '#1e40af',
        buttonText: isDarkMode ? '#000000' : '#ffffff',
    }), [isDarkMode, theme]);

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

    // Estilos dinámicos basados en modo oscuro
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 16,
            backgroundColor: colors.background,
        },
        connectionCard: {
            backgroundColor: colors.surfaceVariant,
            borderRadius: 12,
            marginBottom: 20,
            elevation: 1,
        },
        wifiInfo: {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
        },
        controlCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginBottom: 20,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cardTitle: {
            fontSize: isSmallScreen ? 16 : 18,
            fontWeight: 'bold',
            marginBottom: 8,
            color: colors.text,
        },
        cardText: {
            fontSize: isSmallScreen ? 14 : 15,
            marginVertical: 2,
            color: colors.text,
        },
        infoLabel: {
            fontWeight: 'bold',
            color: colors.text,
        },
        highlight: {
            fontWeight: 'bold',
            color: colors.highlight,
        },
        divider: {
            backgroundColor: colors.border,
            marginVertical: 8,
            height: 1,
        },
        alturaContainer: {
            marginTop: 15,
            padding: 12,
            backgroundColor: isDarkMode ? '#252525' : '#f9f9f9',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
        },
        presetTitle: {
            fontSize: isSmallScreen ? 15 : 16,
            fontWeight: '600',
            marginBottom: 10,
            color: colors.text,
        },
        currentAltura: {
            fontSize: isSmallScreen ? 14 : 15,
            fontWeight: '500',
            marginTop: 10,
            textAlign: 'center',
            color: colors.highlight,
        },
        presetContainer: {
            flexDirection: isSmallScreen ? 'column' : 'row',
            justifyContent: 'space-between',
        },
        presetButton: {
            flex: isSmallScreen ? 0 : 1,
            marginBottom: isSmallScreen ? 10 : 0,
            marginHorizontal: isSmallScreen ? 0 : 4,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 6,
            backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        selectedPreset: {
            backgroundColor: colors.button,
            borderColor: colors.button,
        },
        presetLabel: {
            fontSize: isSmallScreen ? 13 : 14,
            color: colors.text,
        },
        selectedPresetLabel: {
            color: colors.buttonText,
            fontWeight: 'bold',
        },
        actionsContainer: {
            flexDirection: isSmallScreen ? 'column' : 'row',
            justifyContent: 'space-between',
            marginTop: 8,
        },
        actionButton: {
            marginBottom: isSmallScreen ? 12 : 0,
            paddingVertical: 8,
            borderRadius: 8,
        },
        resetButton: {
            borderColor: colors.button,
            backgroundColor: colors.surface,
        },
        resetButtonLabel: {
            color: colors.button,
            fontSize: isSmallScreen ? 14 : 15,
        },
        scanButton: {
            backgroundColor: colors.button,
        },
        scanButtonLabel: {
            color: colors.buttonText,
            fontWeight: 'bold',
            fontSize: isSmallScreen ? 14 : 15,
        },
        snackbar: {
            backgroundColor: colors.snackbar,
            marginBottom: 20,
        },
    }), [isSmallScreen, isDarkMode, colors]);

    return (
        <ScrollView 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Card style={styles.connectionCard}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Configuración WiFi</Title>
                    <Divider style={styles.divider} />
                    <View style={styles.wifiInfo}>
                        <Text style={styles.cardText}>
                            <Text style={styles.infoLabel}>Red:</Text> 
                            <Text style={styles.highlight}> {ESCANER_SSID}</Text>
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.infoLabel}>Contraseña:</Text> 
                            <Text style={styles.highlight}> {ESCANER_PASSWORD}</Text>
                        </Text>
                    </View>
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
                        thumbColor={colors.button}
                        minTrackColor={colors.button}
                        maxTrackColor={colors.border}
                        textColor={colors.text}
                    />
                    
                    {/* Ancho */}
                    <CustomSlider
                        title="Ancho del objeto"
                        value={ancho}
                        min={0}
                        max={30}
                        onChange={handleAnchoChange}
                        unit="cm"
                        step={0.5}
                        thumbColor={colors.button}
                        minTrackColor={colors.button}
                        maxTrackColor={colors.border}
                        textColor={colors.text}
                    />
                    
                    {/* Altura con presets */}
                    <View style={styles.alturaContainer}>
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
                                    labelStyle={[
                                        styles.presetLabel,
                                        altura === preset.value && styles.selectedPresetLabel
                                    ]}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </View>
                        <Text style={styles.currentAltura}>Altura actual: {altura} cm</Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Acciones */}
            <View style={styles.actionsContainer}>
                <Button
                    mode="outlined"
                    onPress={reiniciarPosicion}
                    style={[styles.actionButton, styles.resetButton]}
                    labelStyle={styles.resetButtonLabel}
                    icon="restart"
                >
                    Reiniciar
                </Button>
                
                <Button
                    mode="contained"
                    onPress={iniciarEscaneo}
                    style={[styles.actionButton, styles.scanButton]}
                    disabled={loading}
                    loading={loading}
                    labelStyle={styles.scanButtonLabel}
                    icon="camera"
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
                    textColor: colors.buttonText,
                    onPress: () => setSnackbar(prev => ({ ...prev, visible: false })),
                }}
            >
                <Text style={{ color: isDarkMode ? '#fff' : '#fff' }}>{snackbar.message}</Text>
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
    wifiInfo: {
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    controlCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e3a8a',
    },
    cardText: {
        fontSize: isSmallScreen ? 14 : 15,
        marginVertical: 2,
        color: '#374151',
    },
    infoLabel: {
        fontWeight: 'bold',
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
    alturaContainer: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eaeaea',
    },
    presetTitle: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1e3a8a',
    },
    currentAltura: {
        fontSize: isSmallScreen ? 14 : 15,
        fontWeight: '500',
        marginTop: 10,
        textAlign: 'center',
        color: '#3b82f6',
    },
    presetContainer: {
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: 'space-between',
    },
    presetButton: {
        flex: isSmallScreen ? 0 : 1,
        marginBottom: isSmallScreen ? 10 : 0,
        marginHorizontal: isSmallScreen ? 0 : 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingVertical: 6,
    },
    selectedPreset: {
        backgroundColor: '#1e40af',
        borderColor: '#1e3a8a',
    },
    presetLabel: {
        fontSize: isSmallScreen ? 13 : 14,
        color: '#374151',
    },
    selectedPresetLabel: {
        color: 'white',
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        marginBottom: isSmallScreen ? 12 : 0,
        paddingVertical: 8,
        borderRadius: 8,
    },
    resetButton: {
        borderColor: '#3b82f6',
        backgroundColor: 'white',
    },
    resetButtonLabel: {
        color: '#3b82f6',
        fontSize: isSmallScreen ? 14 : 15,
    },
    scanButton: {
        backgroundColor: '#1e40af',
    },
    scanButtonLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: isSmallScreen ? 14 : 15,
    },
    snackbar: {
        backgroundColor: '#1e3a8a',
        marginBottom: 20,
    },
});

export default EscanerScreen;