// On importe une fonction utilitaire depuis un autre fichier
import { fetchData } from './api.js';

document.querySelectorAll('.nav-link').forEach(link => {
    if (window.location.pathname.includes(link.getAttribute('href'))) {
        link.classList.add('active'); // Bootstrap rendra ce lien 100% blanc
    }
});