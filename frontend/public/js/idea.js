const genesisFeed = document.getElementById('genesisFeed');
const conceptCounter = document.getElementById('conceptCounter');

// Initial load
document.addEventListener('DOMContentLoaded', fetchGenesis);

async function fetchGenesis() {
    try {
        // Appel vers votre endpoint backend (ex: /api/genesis)
        const response = await fetch('/api/genesis');
        const data = await response.json(); // Array of objects from Postgres

        renderFeed(data);
        conceptCounter.textContent = `Showing ${data.length} concepts`;
    } catch (error) {
        console.error("Fetch Error:", error);
        genesisFeed.innerHTML = '<p class="text-danger">Failed to load matrix data.</p>';
    }
}

function renderFeed(concepts) {
    genesisFeed.innerHTML = '';

    concepts.forEach(item => {
        const isSocrate = item.protocol === 'socrate';

        // On construit le HTML dynamiquement
        // Note : Pour Socrate, on n'injecte PAS la description réelle dans le DOM
        const card = document.createElement('div');
        card.className = 'idea-card';

        card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="fw-bold text-white mb-1">${item.title}</h5>
                            <span class="${isSocrate ? 'text-primary' : 'text-muted'} x-small fw-bold" style="font-size: 0.7rem; letter-spacing: 1px;">
                                ${isSocrate ? 'SOCRATE PROTOCOL' : 'PUBLIC DOMAIN'}
                            </span>
                        </div>
                        <div class="status-icon ${isSocrate ? 'status-socrate' : 'status-public'}">
                            <i class="bi ${isSocrate ? 'bi-shield-lock-fill' : 'bi-unlock'}"></i>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        ${isSocrate ? `
                            <div class="protected-placeholder">
                                <i class="bi bi-lock-fill"></i>
                                <span>Sovereign Content Shielded</span>
                            </div>
                            <div class="security-line"></div>
                            <div class="security-line security-line-short"></div>
                        ` : `
                            <p class="idea-description mt-3">${item.description}</p>
                        `}
                    </div>

                    <div class="d-flex align-items-center mt-3 text-muted small">
                        <span class="me-3"><i class="bi bi-tag-fill text-primary"></i> ${item.genre}</span>
                        <span><i class="bi bi-clock"></i> ${item.time_ago}</span>
                    </div>
                `;

        genesisFeed.appendChild(card);
    });
}

// Form Submission logic
document.getElementById('genesisForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newIdea = {
        title: document.getElementById('inputTitle').value,
        description: document.getElementById('inputDescription').value,
        protocol: document.getElementById('inputSocrate').checked ? 'socrate' : 'public',
        genre: document.getElementById('inputGenre').value
    };

    try {
        const response = await fetch('/api/v1/game/submit-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newIdea)
        });

        if (response.ok) {
            // Refresh feed after creation
            fetchGenesis();
            // Close Modal
            bootstrap.Modal.getInstance(document.getElementById('genesisModal')).hide();
        }
    } catch (error) {
        console.error("Submission error:", error);
    }
});