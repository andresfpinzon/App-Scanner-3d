import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Title,
  Snackbar,
  Divider,
  useTheme,
  IconButton,
} from "react-native-paper";
import CustomSlider from "../components/CustomSlider";
import { engineFourServices } from "../services/engineFour.services";
import { engineOneServices } from "../services/engineOne.services";
import { engineTwoServices } from "../services/engineTwo.services";
import { engineThreeServices } from "../services/engineThree.services";
import { ESCANER_PASSWORD, ESCANER_SSID, ESP32_URL } from "../utils/constantes";

const DEBOUNCE_DELAY = 300; // ms
const { width } = Dimensions.get("window");
const isSmallScreen = width < 375; // iPhone SE y dispositivos pequeños

const ALTURA_PRESETS = [
  { label: "50 cm", value: 50 },
  { label: "100 cm", value: 100 },
  { label: "150 cm", value: 150 },
];
const CICLOS_PRESETS = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const EscanerScreen = () => {
  // Estados
  const [ciclo, setCiclo] = useState(1);
  const [angulo, setAngulo] = useState(0);
  const [altura, setAltura] = useState(50);
  const [ancho, setAncho] = useState(0);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingMotor, setLoadingMotor] = useState(false);
  const [manualDarkMode, setManualDarkMode] = useState<boolean | null>(null);

  // Tema y modo oscuro
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const isDarkMode =
    manualDarkMode !== null ? manualDarkMode : colorScheme === "dark";

  const [isMovingForward, setIsMovingForward] = useState(false);
  const [isMovingBackward, setIsMovingBackward] = useState(false);

  // Refs para control
  const lastSentValues = useRef({
    angulo: -1,
    altura: -1,
    ancho: -1,
  });

  const cicloSentValues = useRef({
    ciclo: -1,
  });

  const handleCicloPreset = (value: number) => {
    setCiclo(value);
    // Si necesitas guardar el último valor enviado como con altura:
    if (cicloSentValues.current.ciclo !== value) {
      cicloSentValues.current.ciclo = value;
    }
  };

  const debounceTimeouts = useRef({
    angulo: null as NodeJS.Timeout | null,
    altura: null as NodeJS.Timeout | null,
    ancho: null as NodeJS.Timeout | null,
  });
  const isMounted = useRef(true);

  // Colores para modo oscuro/claro
  const colors = useMemo(
    () => ({
      primary: theme.colors.primary,
      accent: theme.colors.secondary,
      background: isDarkMode ? "#121212" : "#77777eff",
      surface: isDarkMode ? "#1e1e1e" : "#ffffff",
      surfaceVariant: isDarkMode ? "#2d2d2d" : "#e3f2fd",
      text: isDarkMode ? "#e0e0e0" : "#333333",
      textSecondary: isDarkMode ? "#a0a0a0" : "#00a6f3ff",
      highlight: isDarkMode ? "#9d61e6ff" : "#666666",
      border: isDarkMode ? "#444444" : "#e0e0e0",
      snackbar: isDarkMode ? "#2d2d2d" : "#00a6f3ff",
      button: isDarkMode ? "#9d61e6ff" : "#00a6f3ff",
      buttonText: isDarkMode ? "#000000" : "#e3f2fd",
      sliderThumb: isDarkMode ? "#9d61e6ff" : "#00a6f3ff",
      sliderTrack: isDarkMode ? "#3a3a3a" : "#e0e0e0",
      sliderActive: isDarkMode ? "#9d61e6ff" : "#00a6f3ff",
      wifiInfoBg: isDarkMode ? "#4f5256" : "#94d0ecff",
      motorButton: isDarkMode ? "#9d61e6ff" : "#00a6f3ff",
    }),
    [isDarkMode, theme]
  );

  // Alternar modo oscuro/claro
  const toggleDarkMode = () => {
    setManualDarkMode(!isDarkMode);
  };

  // Efecto de limpieza
  useEffect(() => {
    return () => {
      isMounted.current = false;
      Object.values(debounceTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Sincronización inicial del ángulo del motor 4
  useEffect(() => {
    const init = async () => {
      try {
        const anguloActual = await engineFourServices.getAngulo();
        if (isMounted.current && anguloActual !== null) {
          setAngulo(anguloActual);
          lastSentValues.current.angulo = anguloActual;
        }
      } catch (error) {
        showSnackbar("Error al sincronizar ángulo inicial");
      }
    };

    init();
  }, []);

  // Función genérica con debounce
  const createDebouncedHandler = (type: "angulo" | "altura" | "ancho") =>
    useCallback((value: number) => {
      switch (type) {
        case "angulo":
          setAngulo(value);
          break;
        case "altura":
          setAltura(value);
          break;
        case "ancho":
          setAncho(value);
          break;
      }

      if (debounceTimeouts.current[type]) {
        clearTimeout(debounceTimeouts.current[type]!);
      }

      debounceTimeouts.current[type] = setTimeout(async () => {
        try {
          if (value !== lastSentValues.current[type] && isMounted.current) {
            if (type === "angulo") {
              await engineFourServices.setAngulo(value);
            }
            lastSentValues.current[type] = value;
          }
        } catch (error) {
          showSnackbar(`Error al actualizar ${type}`);
          console.error(`Error en ${type}:`, error);
        }
      }, DEBOUNCE_DELAY);
    }, []);

  // Handlers debounceados
  const handleAnguloChange = createDebouncedHandler("angulo");
  const handleAnchoChange = createDebouncedHandler("ancho");

  // Handler para altura con presets
  const handleAlturaPreset = (value: number) => {
    setAltura(value);
    if (value !== lastSentValues.current.altura) {
      lastSentValues.current.altura = value;
    }
  };

  // Helper para snackbar
  const showSnackbar = (message: string) => {
    if (isMounted.current) {
      setSnackbar({ visible: true, message });
    }
  };

  // Función para iniciar escaneo con motores 2 y 3
  const iniciarEscaneo = async () => {
    setLoading(true);

    try {
      // 1. Iniciar motores de escaneo (2 y 3)
      await engineTwoServices.startEngine();
      await engineThreeServices.startEngine();
      showSnackbar("Motores de escaneo iniciados - Escaneando...");

      // 2. Iniciar el proceso de escaneo en el ESP32
      const response = await fetch(`${ESP32_URL}/start-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ angulo, altura, ancho }),
      });

      if (!response.ok) {
        throw new Error("El ESP32 reportó un error");
      }

      // 3. Esperar a que termine el escaneo
      let escaneoCompleto = false;
      let intentos = 0;
      const maxIntentos = 10;

      while (!escaneoCompleto && intentos < maxIntentos) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const statusResponse = await fetch(`${ESP32_URL}/scan-status`);
        const status = await statusResponse.json();

        if (status.complete) {
          escaneoCompleto = true;
        }
        intentos++;
      }

      if (!escaneoCompleto) {
        throw new Error("El escaneo tardó demasiado");
      }

      // 4. Detener motores
      await engineTwoServices.stopEngine();
      await engineThreeServices.stopEngine();
      showSnackbar("Escaneo completado - Motores detenidos");
    } catch (error) {
      try {
        await engineTwoServices.stopEngine();
        await engineThreeServices.stopEngine();
      } catch (e) {
        console.error("Error al detener motores:", e);
      }

      showSnackbar("Error durante el escaneo: " + snackbar.message);
      console.error("Error en escaneo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar valores
  const reiniciarPosicion = () => {
    // Resetear ángulo con debounce
    handleAnguloChange(0);

    // Resetear altura
    const initialAltura = ALTURA_PRESETS[0].value;
    setAltura(initialAltura);
    lastSentValues.current.altura = initialAltura;

    // Resetear ancho
    setAncho(0);
    lastSentValues.current.ancho = 0;

    showSnackbar("Posición reiniciada");
  };

  // Funciones para control del motor 1
  const iniciarMotor = async () => {
    setLoadingMotor(true);
    try {
      await engineOneServices.startEngine();
      showSnackbar("Motor 1 iniciado correctamente");
    } catch (error) {
      showSnackbar("Error al iniciar el motor 1");
      console.error("Error en motor:", error);
    } finally {
      setLoadingMotor(false);
    }
  };

  const detenerMotor = async () => {
    setLoadingMotor(true);
    try {
      await engineOneServices.stopEngine();
      showSnackbar("Motor 1 detenido correctamente");
    } catch (error) {
      showSnackbar("Error al detener el motor 1");
      console.error("Error en motor:", error);
    } finally {
      setLoadingMotor(false);
    }
  };

  const handlePressIn = async (direction: "forward" | "backward") => {
    try {
      if (direction === "forward") {
        setIsMovingForward(true);
        await engineOneServices.startEngine();
      } else {
        setIsMovingBackward(true);
        await engineOneServices.stopEngine();
      }
    } catch (error) {
      console.error("Error al iniciar motor:", error);
    }
  };

  const handlePressOut = async () => {
    try {
      setIsMovingForward(false);
      setIsMovingBackward(false);
    } catch (error) {
      console.error("Error al detener motor:", error);
    }
  };

  // Estilos dinámicos basados en modo oscuro
  const styles = useMemo(
    () =>
      StyleSheet.create({
        connectionCardHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        },
        cardTitleContainer: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        container: {
          flexGrow: 1,
          padding: 16,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        },
        title: {
          fontSize: 24,
          fontWeight: "bold",
          color: colors.text,
        },
        themeButton: {
          backgroundColor: colors.surface,
          borderRadius: 20,
          marginLeft: 8,
        },
        connectionCard: {
          backgroundColor: colors.surfaceVariant,
          borderRadius: 12,
          marginBottom: 20,
          elevation: 1,
        },
        wifiInfo: {
          backgroundColor: colors.wifiInfoBg,
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
          fontWeight: "bold",
          color: colors.text,
        },
        cardText: {
          fontSize: isSmallScreen ? 14 : 15,
          marginVertical: 2,
          color: colors.text,
        },
        infoLabel: {
          fontWeight: "bold",
          color: colors.text,
        },
        highlight: {
          fontWeight: "bold",
          color: colors.highlight,
        },
        divider: {
          backgroundColor: colors.border,
          marginVertical: 8,
          marginTop: 10,
          height: 1,
        },
        alturaContainer: {
          marginTop: 15,
          padding: 12,
          backgroundColor: isDarkMode ? "#252525" : "#f9f9f9",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        presetTitle: {
          fontSize: isSmallScreen ? 15 : 16,
          fontWeight: "600",
          marginBottom: 10,
          color: colors.text,
        },
        currentAltura: {
          fontSize: isSmallScreen ? 14 : 15,
          fontWeight: "bold",
          marginTop: 10,
          textAlign: "center",
          color: colors.highlight,
        },
        presetContainer: {
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
        },
        presetButton: {
          flex: isSmallScreen ? 0 : 1,
          marginBottom: isSmallScreen ? 10 : 0,
          marginHorizontal: isSmallScreen ? 0 : 4,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingVertical: 6,
          backgroundColor: isDarkMode ? "#333" : "#fff",
          marginVertical: 10,
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
          fontWeight: "bold",
        },
        actionsContainer: {
          flexDirection: "row", // Siempre en fila (horizontal)
          justifyContent: "space-between", // Espacio entre botones
          alignItems: "center", // Centra verticalmente los botones
          marginTop: 16, // Aumenté el margen superior para mejor espaciado
          gap: 12, // Espacio entre botones (soporte moderno)
        },
        motorActionsContainer: {
          flexDirection: "row", // Siempre en horizontal
          justifyContent: "space-between", // Espacio entre botones
          alignItems: "center", // Centrado vertical
          marginTop: 16, // Espaciado superior
          gap: 12, // Espacio entre botones (opcional)
        },
        actionButton: {
          flex: 1, // Cada botón ocupa igual espacio
          marginHorizontal: 6, // Espaciado horizontal
          paddingVertical: 12, // Aumenté el padding vertical
          borderRadius: 15,
          minHeight: 50,
          justifyContent: "center", // Centra contenido verticalmente
        },

        resetButton: {
          borderColor: colors.button,
          backgroundColor: colors.surface,
        },
        resetButtonLabel: {
          color: colors.button,
          fontSize: isSmallScreen ? 14 : 16, // Aumenté el tamaño mínimo
          fontWeight: "600",
          textAlign: "center",
        },
        scanButton: {
          backgroundColor: colors.button,
          elevation: 3,
        },
        scanButtonLabel: {
          color: colors.buttonText,
          fontWeight: "bold",
          fontSize: isSmallScreen ? 14 : 16,
          textAlign: "center",
          paddingVertical: 4,
        },
        motorButton: {
          flex: 1, // Ambos botones ocupan igual espacio
          backgroundColor: colors.motorButton,
          paddingVertical: 14, // Altura del botón
          borderRadius: 30,
          alignItems: "center", // Centrado horizontal
          justifyContent: "center", // Centrado vertical
          marginHorizontal: 5, // Pequeño margen lateral
        },
        motorButtonLabel: {
          color: "#FFF",
          fontSize: isSmallScreen ? 14 : 16, // Tamaño adaptable
          fontWeight: "500", // Grosor de fuente
        },
        snackbar: {
          backgroundColor: colors.snackbar,
          marginBottom: 20,
          minHeight: 40,
          marginHorizontal: 16,
          borderRadius: 8,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          marginStart: 45,
        },
        wifiHighlight: {
          fontWeight: "bold",
          color: colors.highlight,
        },
        holdButton: {
          backgroundColor: colors.motorButton,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120,
        },
        buttonContent: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
        verticalActionsContainer: {
          flexDirection: "column", // Cambiado de "row" a "column"
          justifyContent: "center", // Centrado vertical
          alignItems: "stretch", // Los botones ocuparán todo el ancho
          marginTop: 10,
          gap: 10, // Espacio entre botones
        },
        verticalActionButton: {
          width: "100%",
          marginHorizontal: 0, // Eliminamos el margen horizontal
          paddingVertical: 10,
          borderRadius: 15,
          minHeight: 10,
          justifyContent: "center",
        },
      }),
    [isSmallScreen, isDarkMode, colors]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Card style={styles.connectionCard}>
        <Card.Content>
          <View style={styles.connectionCardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>Configuración WiFi</Title>
            </View>
            <IconButton
              icon={isDarkMode ? "weather-sunny" : "weather-night"}
              onPress={toggleDarkMode}
              style={styles.themeButton}
              iconColor={colors.text}
              size={20}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.wifiInfo}>
            <Text style={styles.cardText}>
              <Text style={styles.infoLabel}>Red:</Text>
              <Text style={styles.wifiHighlight}> {ESCANER_SSID}</Text>
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.infoLabel}>Contraseña:</Text>
              <Text style={styles.wifiHighlight}> {ESCANER_PASSWORD}</Text>
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Controles de escaneo */}
      <Card style={styles.controlCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Ajustes del Scanner</Title>
          <Divider style={styles.divider} />

          {/* Inclinación - Controla Motor 4 */}
          <CustomSlider
            title="Inclinación del sensor"
            value={angulo}
            min={0}
            max={90}
            onChange={handleAnguloChange}
            unit="°"
            step={1}
            thumbColor={colors.sliderThumb}
            minTrackColor={colors.sliderActive}
            maxTrackColor={colors.sliderTrack}
            textColor={colors.text}
          />
          <Divider style={styles.divider} />
          <View style={styles.alturaContainer}>
            <Title style={styles.cardTitle}>Control del Motor 1</Title>
            <Divider style={styles.divider} />

            <View style={styles.motorActionsContainer}>
              {/* Botón de Avance */}
              <TouchableOpacity
                onPressIn={() => engineOneServices.startEngine()}
                style={[styles.actionButton, styles.motorButton]}
              >
                <Text style={styles.motorButtonLabel}>◀ Izquierda</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPressIn={() => {
                  engineFourServices.stopMotor;
                }}
                style={[styles.actionButton, styles.motorButton]}
              >
                <Text style={styles.motorButtonLabel}>Derecha ▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Altura con presets */}
          <View style={styles.alturaContainer}>
            <Text style={styles.cardTitle}>Altura predefinida:</Text>
            <Divider style={styles.divider} />

            <View style={styles.presetContainer}>
              {ALTURA_PRESETS.map((preset, index) => (
                <Button
                  key={index}
                  mode={altura === preset.value ? "contained" : "outlined"}
                  onPress={() => handleAlturaPreset(preset.value)}
                  style={[
                    styles.presetButton,
                    altura === preset.value && styles.selectedPreset,
                  ]}
                  labelStyle={[
                    styles.presetLabel,
                    altura === preset.value && styles.selectedPresetLabel,
                  ]}
                >
                  {preset.label}
                </Button>
              ))}
            </View>
            <Text style={styles.currentAltura}>Altura actual: {altura} cm</Text>
          </View>

          <View style={styles.alturaContainer}>
            {/* Acciones */}
            <View style={styles.verticalActionsContainer}>
              <Button
                mode="outlined"
                onPress={reiniciarPosicion}
                style={[styles.verticalActionButton, styles.resetButton]}
                labelStyle={styles.resetButtonLabel}
                icon="restart"
                contentStyle={styles.buttonContent}
              >
                Reiniciar
              </Button>
              <Button
                mode="contained"
                onPress={iniciarEscaneo}
                style={[styles.verticalActionButton, styles.scanButton]}
                disabled={loading}
                loading={loading}
                labelStyle={styles.scanButtonLabel}
                icon="camera"
                contentStyle={styles.buttonContent}
              >
                {isSmallScreen ? "Escanear" : "Iniciar Escaneo"}
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
        duration={6000}
        style={styles.snackbar}
        action={{
          label: "OK",
          textColor: colors.buttonText,
          onPress: () => setSnackbar((prev) => ({ ...prev, visible: false })),
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {snackbar.message}
        </Text>
      </Snackbar>
    </ScrollView>
  );
};

export default EscanerScreen;

{
  /* Ancho (controla motor 1)
          <CustomSlider
            title="Ancho del elemento (Motor 1)"
            value={ancho}
            min={0}
            max={15}
            onChange={handleAnchoChange}
            unit="cm"
            step={0.5}
            thumbColor={colors.sliderThumb}
            minTrackColor={colors.sliderActive}
            maxTrackColor={colors.sliderTrack}
            textColor={colors.text}
          /> */
}

{
  /* Control de motor 1
        <Card style={styles.controlCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Control del Motor 1</Title>
            <Divider style={styles.divider} />
            
            <Text style={styles.cardText}>
              Control manual del motor que ajusta el ancho del elemento
            </Text>
            
            <View style={styles.motorActionsContainer}>
              <Button
                mode="contained"
                onPress={iniciarMotor}
                style={[styles.actionButton, styles.motorButton]}
                disabled={loadingMotor}
                loading={loadingMotor}
                labelStyle={styles.motorButtonLabel}
                icon="play"
              >
                Iniciar Motor 1
              </Button>
              
              <Button
                mode="contained"
                onPress={detenerMotor}
                style={[styles.actionButton, styles.motorButton]}
                disabled={loadingMotor}
                loading={loadingMotor}
                labelStyle={styles.motorButtonLabel}
                icon="stop"
              >
                Detener Motor 1
              </Button>
            </View>
          </Card.Content>
        </Card> */
}

{
  /* <View style={styles.alturaContainer}>
            <Text style={styles.cardTitle}>Ciclos:</Text>
            <Divider style={styles.divider} />
            <View style={styles.presetContainer}>
              {CICLOS_PRESETS.map((preset, index) => (
                <Button
                  key={index}
                  mode={altura === preset.value ? "contained" : "outlined"}
                  onPress={() => handleCicloPreset(preset.value)}
                  style={[
                    styles.presetButton,
                    ciclo === preset.value && styles.selectedPreset,
                  ]}
                  labelStyle={[
                    styles.presetLabel,
                    ciclo === preset.value && styles.selectedPresetLabel,
                  ]}
                >
                  {preset.label}
                </Button>
              ))}
            </View>
            <Text style={styles.currentAltura}>Ciclo actual: {ciclo}</Text>
          </View> */
}
