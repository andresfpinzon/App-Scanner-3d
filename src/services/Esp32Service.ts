const ESP32_BASE_URL = "http://192.168.4.1";

export const Esp32Service = {
  startMotor: async (id: number) => {
    await fetch(`${ESP32_BASE_URL}/start${id}`);
  },

  stopMotor: async (id: number) => {
    await fetch(`${ESP32_BASE_URL}/stop${id}`);
  },

  setAngulo: async (angle: number) => {
    await fetch(`${ESP32_BASE_URL}/set?angle=${angle}`);
  },

  getAngulo: async (): Promise<number | null> => {
  try {
    const response = await fetch(`${ESP32_BASE_URL}/get`);
    const data = await response.json();
    return data.angle ?? null;
  } catch (error) {
    console.warn("Error al obtener el ángulo actual del ESP32", error);
    return null;
  }
}

};

