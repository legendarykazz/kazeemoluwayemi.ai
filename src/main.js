// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else {
    htmlElement.setAttribute('data-theme', systemTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// Scroll Animations
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

// GitHub Projects Fetching
async function fetchGitHubRepos() {
    const username = 'legendarykazz';
    const repoContainer = document.getElementById('github-repos');
    if (!repoContainer) return;

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        if (!response.ok) throw new Error('Failed to fetch');

        const repos = await response.json();
        repoContainer.innerHTML = '';

        repos.forEach(repo => {
            if (repo.fork) return;
            const repoCard = document.createElement('div');
            repoCard.className = 'github-card';
            repoCard.innerHTML = `
                <div class="github-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="repo-icon"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    <h4><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h4>
                </div>
                <p>${repo.description || 'No description available.'}</p>
                <div class="github-card-footer">
                    <span class="repo-lang">${repo.language || 'Code'}</span>
                    <span class="repo-stars">${repo.stargazers_count} stars</span>
                </div>
            `;
            repoContainer.appendChild(repoCard);
        });
    } catch (error) {
        repoContainer.innerHTML = '<p class="error">GitHub projects unavailable.</p>';
    }
}

// Mermaid Initialization
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        padding: 50
    }
});

// Modal System
const modal = createModal();
document.body.appendChild(modal);

function createModal() {
    const m = document.createElement('div');
    m.id = 'workflow-modal';
    m.className = 'modal';
    m.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Workflow</h3>
                <div class="modal-actions">
                    <button class="btn secondary toggle-view" data-view="visual">View Code</button>
                    <button class="close-modal">&times;</button>
                </div>
            </div>
            <div class="modal-body">
                <div id="visual-content" class="mermaid-container"></div>
                <pre id="json-content" class="hidden-json"></pre>
            </div>
            <div class="modal-footer">
                <button class="btn secondary copy-btn">Copy JSON</button>
            </div>
        </div>
    `;

    m.querySelector('.close-modal').addEventListener('click', () => m.classList.remove('active'));
    m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('active'); });

    m.querySelector('.toggle-view').addEventListener('click', (e) => {
        const visual = document.getElementById('visual-content');
        const json = document.getElementById('json-content');
        const isVisual = e.target.getAttribute('data-view') === 'visual';

        if (isVisual) {
            visual.style.display = 'none';
            json.style.display = 'block';
            e.target.textContent = 'View Visual';
            e.target.setAttribute('data-view', 'json');
        } else {
            visual.style.display = 'block';
            json.style.display = 'none';
            e.target.textContent = 'View Code';
            e.target.setAttribute('data-view', 'visual');
        }
    });

    m.querySelector('.copy-btn').addEventListener('click', () => {
        const json = m.querySelector('#json-content').textContent;
        navigator.clipboard.writeText(json).then(() => {
            const btn = m.querySelector('.copy-btn');
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy JSON'; }, 2000);
        });
    });

    return m;
}

// Improved n8n to Mermaid conversion
function n8nToMermaid(n8nJson) {
    let mermaidText = 'graph LR\n';
    const nodes = n8nJson.nodes || [];
    const connections = n8nJson.connections || {};

    // Map to keep track of safe IDs
    const idMap = {};
    nodes.forEach((node, index) => {
        const safeId = `node_${index}`;
        idMap[node.name] = safeId;
        const label = node.name.replace(/["]/g, "'");
        // Style based on type
        let shape = `["${label}"]`;
        if (node.type.includes('trigger')) shape = `(("${label}"))`;
        if (node.type.includes('AI') || node.type.includes('Agent')) shape = `> "${label}" ]`;

        mermaidText += `  ${safeId}${shape}\n`;
    });

    // Connections
    for (const [sourceName, sourceConns] of Object.entries(connections)) {
        const sourceId = idMap[sourceName];
        if (!sourceId) continue;

        if (sourceConns.main) {
            sourceConns.main.forEach(outputs => {
                outputs.forEach(target => {
                    const targetId = idMap[target.node];
                    if (targetId) {
                        mermaidText += `  ${sourceId} --> ${targetId}\n`;
                    }
                });
            });
        }
    }

    return mermaidText;
}

async function showWorkflow(workflowId) {
    const visualContainer = document.getElementById('visual-content');
    const jsonContainer = document.getElementById('json-content');
    const modalTitle = document.getElementById('modal-title');
    const toggleBtn = modal.querySelector('.toggle-view');

    visualContainer.innerHTML = '<div class="loading-spinner">Rendering workflow...</div>';
    jsonContainer.textContent = '';
    visualContainer.style.display = 'block';
    jsonContainer.style.display = 'none';
    toggleBtn.textContent = 'View Code';
    toggleBtn.setAttribute('data-view', 'visual');

    modal.classList.add('active');

    try {
        const response = await fetch('./n8n_workflows.json');
        const data = await response.json();
        const info = data.workflows.find(w => w.id === workflowId);

        if (info) {
            modalTitle.textContent = info.name;
            const wfResponse = await fetch(`./src/workflows/${info.file}`);
            if (wfResponse.ok) {
                const wfData = await wfResponse.json();
                jsonContainer.textContent = JSON.stringify(wfData, null, 2);
                const mermaidCode = n8nToMermaid(wfData);
                const { svg } = await mermaid.render(`svg-${workflowId}`, mermaidCode);
                visualContainer.innerHTML = svg;
            }
        }
    } catch (error) {
        console.error(error);
        visualContainer.innerHTML = '<p class="error">Failed to render workflow.</p>';
    }
}

// Automation Library Logic
let allWorkflows = [];

async function loadLibrary() {
    const libraryGrid = document.getElementById('automation-library');
    if (!libraryGrid) return;

    try {
        const response = await fetch('./n8n_workflows.json');
        const data = await response.json();
        allWorkflows = data.workflows;
        renderLibrary(allWorkflows);
    } catch (error) {
        libraryGrid.innerHTML = '<p class="error">Library failed to load.</p>';
    }
}

function renderLibrary(workflows) {
    const libraryGrid = document.getElementById('automation-library');
    libraryGrid.innerHTML = '';

    workflows.forEach((wf, index) => {
        const card = document.createElement('div');
        card.className = 'automation-card';
        // Apply staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="category-tag">${wf.category || 'Utility'}</div>
            <h4>${wf.name}</h4>
            <p>${wf.description}</p>
            <button class="btn primary small view-workflow" data-workflow="${wf.id}">Explore Workflow</button>
        `;
        libraryGrid.appendChild(card);
    });
}

// Search & Filter
document.getElementById('library-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allWorkflows.filter(wf =>
        wf.name.toLowerCase().includes(term) ||
        wf.description.toLowerCase().includes(term) ||
        wf.category.toLowerCase().includes(term)
    );
    renderLibrary(filtered);
});

document.getElementById('category-filters')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const category = e.target.getAttribute('data-filter');
        const filtered = category === 'all'
            ? allWorkflows
            : allWorkflows.filter(wf => wf.category === category);
        renderLibrary(filtered);
    }
});

// Event Delegation for links
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-workflow')) {
        e.preventDefault();
        showWorkflow(e.target.getAttribute('data-workflow'));
    }
});

// Init everything
fetchGitHubRepos();
loadLibrary();
