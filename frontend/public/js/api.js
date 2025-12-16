const API_URL = "http://localhost:3000/api";

export const fetchData = async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error("Erreur API:", error);
    }
};