import { ESP32_URL } from "../utils/constantes";


export const engineFourServices = {
  startMotor: async (id: number) => {
    await fetch(`${ESP32_URL}/start${id}`);
  },

  stopMotor: async (id: number) => {
    await fetch(`${ESP32_URL}/stop${id}`);
  },

  setAngulo: async (angle: number) => {
    await fetch(`${ESP32_URL}/set?angle=${angle}`);
  },

  getAngulo: async (): Promise<number | null> => {
  try {
    const response = await fetch(`${ESP32_URL}/get`);
    const data = await response.json();
    return data.angle ?? null;
  } catch (error) {
    console.warn("Error al obtener el ángulo actual del ESP32", error);
    return null;
  }
}

};

