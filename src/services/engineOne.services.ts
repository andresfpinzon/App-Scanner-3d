import { ESP32_URL } from "../utils/constantes"



export const engineOneServices = {
    startEngine: async () => {
        await fetch(`${ESP32_URL}/startRight1`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_URL}/startLeft1`)
    }
}