const layouts = {
    navbar: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="/index.html">
                <i class="bi bi-controller text-primary me-2"></i>Project<span class="text-primary">B</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item">
                        <a class="nav-link" href="/index.html">Accueil</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/events.html">Événements</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/submit.html">Proposer un jeu</a>
                    </li>
                    <li id="authLinks" class="nav-item ms-lg-3">
                        </li>
                </ul>
            </div>
        </div>
    </nav>`,

    footer: `
    <footer class="bg-dark text-white border-top border-secondary py-3 mt-auto">
        <div class="container">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div class="mb-2 mb-md-0">
                    <span class="fw-bold small">Project<span class="text-primary">B</span></span>
                    <span class="text-muted small ms-2">© 2025</span>
                </div>
                
                <div class="d-flex align-items-center">
                    <a href="#" class="text-white-50 me-3 hover-white" title="Discord">
                        <i class="bi bi-discord fs-5"></i>
                    </a>
                    <a href="#" class="text-white-50 me-3 hover-white" title="Github">
                        <i class="bi bi-github fs-5"></i>
                    </a>
                    <div class="vr bg-secondary me-3 d-none d-md-block" style="height: 15px;"></div>
                    <span class="badge rounded-pill bg-dark border border-secondary text-white-50 fw-light" style="font-size: 0.7rem;">v1.0.4</span>
                </div>
            </div>
        </div>
    </footer>`
};

function initLayout() {
    const body = document.body;

    // 1. Injection
    body.insertAdjacentHTML('afterbegin', layouts.navbar);
    body.insertAdjacentHTML('beforeend', layouts.footer);

    // 2. Détection du lien actif
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active', 'fw-bold');
        }
    });

    // 3. Gestion dynamique du bouton Auth
    const authContainer = document.getElementById('authLinks');
    const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('token='));

    if (isLoggedIn) {
        authContainer.innerHTML = `
            <div class="dropdown">
                <a class="btn btn-outline-dark dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle"></i> Mon Compte
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow">
                    <li><a class="dropdown-item" href="/profile.html">Mon Profil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Déconnexion</a></li>
                </ul>
            </div>`;

        document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/v1/auth/logout');
            window.location.href = '/login.html';
        });
    } else {
        authContainer.innerHTML = `
            <a class="btn btn-primary" href="/login.html">Connexion</a>`;
    }

    // 4. Initialisation forcée de Bootstrap pour le menu mobile
    if (typeof bootstrap !== 'undefined') {
        const menu = document.getElementById('navbarNav');
        if (menu) new bootstrap.Collapse(menu, { toggle: false });
    }
}

document.addEventListener('DOMContentLoaded', initLayout);