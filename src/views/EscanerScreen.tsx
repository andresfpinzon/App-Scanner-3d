import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import CustomSlider from '../components/CustomSlider';
import { Esp32Service } from '../services/Esp32Service';

const ESCANER_SSID = 'ESP_ESCANER';
const ESCANER_PASSWORD = '12345678';
const ESP32_URL = 'http://192.168.4.1';

const EscanerScreen = () => {
    const [angulo, setAngulo] = useState(0);
    const [altura, setAltura] = useState(0);
    const [ancho, setAncho] = useState(0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const lastSentAngle = useRef<number>(-1);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        sincronizarAnguloDesdeESP32();
    }, []);

    const sincronizarAnguloDesdeESP32 = async () => {
        try {
            const anguloActual = await Esp32Service.getAngulo();
            if (anguloActual !== null) {
                setAngulo(anguloActual);
                lastSentAngle.current = anguloActual;
            }
        } catch (error) {
            console.warn("No se pudo sincronizar el ángulo desde ESP32");
        }
    };

    const iniciarEscaneo = async () => {

        setLoading(true);

        try {
            const response = await fetch(`${ESP32_URL}/start-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ angulo, altura }),
            });

            if (response.ok) {
                setSnackbarMessage('Escaneo iniciado correctamente');
            } else {
                setSnackbarMessage('Error al iniciar el escaneo');
            }
        } catch (error) {
            setSnackbarMessage('No se pudo conectar al ESP32');
        } finally {
            setSnackbarVisible(true);
            setLoading(false);
        }
    };

    const handleAnguloChange = (valor: number) => {
        setAngulo(valor);


        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            if (valor !== lastSentAngle.current) {
                try {
                    await Esp32Service.setAngulo(valor);
                    lastSentAngle.current = valor;
                } catch (error) {
                    console.warn("Error al enviar ángulo al ESP32:", error);
                }
            }
        }, 300);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Conexión WiFi requerida</Title>
                    <Paragraph>
                        Conéctese a la red <Text style={styles.bold}>{ESCANER_SSID}</Text> con la contraseña <Text style={styles.bold}>{ESCANER_PASSWORD}</Text> para usar el escáner.
                    </Paragraph>
                </Card.Content>
            </Card>

            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Inclinación del sensor"
                        value={angulo}
                        min={0}
                        max={90}
                        onChange={handleAnguloChange}
                        unit="°"
                    />
                </Card.Content>
            </Card>

            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Ancho del objeto escaneado"
                        value={ancho}
                        min={0}
                        max={30}
                        onChange={setAncho}
                        unit="cm"
                    />
                </Card.Content>
            </Card>

            <Card style={styles.controlCard}>
                <Card.Content>
                    <CustomSlider
                        title="Alto del objeto escaneado"
                        value={altura}
                        min={0}
                        max={200}
                        onChange={setAltura}
                        unit="cm"
                    />
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={iniciarEscaneo}
                style={styles.button}
                disabled={loading}
                loading={loading}
            >
                Iniciar Escaneo
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

export default EscanerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F6FA',
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    controlCard: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bold: {
        fontWeight: 'bold',
    },
});
