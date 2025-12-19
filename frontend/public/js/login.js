document.addEventListener('DOMContentLoaded', () => {
    // Éléments de bascule
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const subtitle = document.getElementById('auth-subtitle');

    const btnToRegister = document.getElementById('link-to-register');
    const btnToLogin = document.getElementById('link-to-login');

    // Fonction de switch
    const toggleAuth = () => {
        loginSection.classList.toggle('hidden');
        registerSection.classList.toggle('hidden');

        if (loginSection.classList.contains('hidden')) {
            subtitle.innerText = "Rejoignez la communauté ProjectB";
        } else {
            subtitle.innerText = "Accédez à l'incubateur de concepts";
        }
    };

    // Écouteurs d'événements (SANS onclick dans le HTML)
    if (btnToRegister) btnToRegister.addEventListener('click', toggleAuth);
    if (btnToLogin) btnToLogin.addEventListener('click', toggleAuth);
});