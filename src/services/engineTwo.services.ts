import { ESP32_URL } from "../utils/constantes"


export const engineTwoServices = {
    startEngine: async() => {
        await fetch(`${ESP32_URL}/start2`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_URL}/stop2`)
    }
}