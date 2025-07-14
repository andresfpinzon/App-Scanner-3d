import { ESP32_URL } from "../utils/constantes";


export const engineThreeServices = {
    startEngine: async () => {
        await fetch(`${ESP32_URL}/start3`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_URL}/stop3`)
    }
}