const ESP32_BASE_URL = "http://192.168.137.100"; 

export const Esp32Service = {
  startMotor: async (id: number) => {
    await fetch(`${ESP32_BASE_URL}/start${id}`);
  },

  stopMotor: async (id: number) => {
    await fetch(`${ESP32_BASE_URL}/stop${id}`);
  }
};

