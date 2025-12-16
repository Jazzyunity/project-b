// On importe une fonction utilitaire depuis un autre fichier
import { checkApiStatus } from './api.js';

const statusEl = document.getElementById('status-message');
const btn = document.getElementById('fetch-btn');

// Gestionnaire d'événement
btn.addEventListener('click', async () => {
    statusEl.textContent = "Vérification en cours...";
    
    const data = await checkApiStatus();
    
    if (data) {
        // Sécurité : .textContent empêche l'exécution de code malveillant (XSS)
        statusEl.textContent = `Réponse du serveur : ${data.message}`;
        statusEl.style.color = "green";
    } else {
        statusEl.textContent = "Erreur de connexion au serveur.";
        statusEl.style.color = "red";
    }
});