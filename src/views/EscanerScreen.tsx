import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {CustomSlider} from '../components/slider'; // Ajusta la ruta según tu estructura

const ESCANER_SSID = 'ESP_SCANNER';
const ESCANER_PASSWORD = '12345678';
const ESP32_URL = 'http://192.168.4.1';

const EscanerScreen = () => {
  const [angulo, setAngulo] = useState(45);
  const [altura, setAltura] = useState(100);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.type === 'wifi' && state.details?.ssid === ESCANER_SSID;
      setWifiConnected(connected);
      if (!connected) {
        setSnackbarMessage('No estás conectado a la red ESP_SCANNER');
        setSnackbarVisible(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const iniciarEscaneo = async () => {
    if (!wifiConnected) {
      setSnackbarMessage('Conéctese primero a la red ESP_SCANNER');
      setSnackbarVisible(true);
      return;
    }

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
            onChange={setAngulo}
            unit="°"
          />
        </Card.Content>
      </Card>

      <Card style={styles.controlCard}>
        <Card.Content>
          <CustomSlider
            title="Altura del riel"
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



