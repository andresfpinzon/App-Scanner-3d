import { Motor } from "../models/EscanerModel";
import { Esp32Service } from "../services/Esp32Service";

const TOTAL_MOTORES = 3;

export const EscanerController = {
  obtenerMotores: (): Motor[] => {
    return Array.from({ length: TOTAL_MOTORES }, (_, i) => ({
      id: i + 1,
      nombre: `Motor ${i + 1}`,
      activo: false
    }));
  },

  activarMotor: async (motor: Motor) => {
    await Esp32Service.startMotor(motor.id);
  },

  detenerMotor: async (motor: Motor) => {
    await Esp32Service.stopMotor(motor.id);
  }
};
