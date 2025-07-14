const ESP32_BASE_URL = "http://192.168.4.1";



export const engineOneServices = {
    startEngine: async (id: number) => {
        await fetch(`${ESP32_BASE_URL}/start1`)
    }
}