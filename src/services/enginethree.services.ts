const ESP32_BASE_URL = "http://192.168.4.1";

export const engineThreeServices = {
    startEngine: async () => {
        await fetch(`${ESP32_BASE_URL}/start3`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_BASE_URL}/stop3`)
    }
}