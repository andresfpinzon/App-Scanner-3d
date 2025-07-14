import { Motor } from "../models/EscanerModel";
import { engineFourServices } from "../services/engineFour.services";

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
    await engineFourServices.startMotor(motor.id);
  },

  detenerMotor: async (motor: Motor) => {
    await engineFourServices.stopMotor(motor.id);
  }
};
