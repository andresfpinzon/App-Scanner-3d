import { ESP32_URL } from "../utils/constantes"



export const engineOneServices = {
    startEngine: async () => {
        await fetch(`${ESP32_URL}/start1`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_URL}/stop1`)
    }
}