const ESP32_BASE_URL = "http://192.168.4.1";


export const engineTwoServices = {
    startEngine: async() => {
        await fetch(`${ESP32_BASE_URL}/start2`)
    },
    stopEngine: async () => {
        await fetch(`${ESP32_BASE_URL}/stop2`)
    }
}