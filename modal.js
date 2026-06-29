// Modal logic for "My Works" section
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('works-modal');
    const modalTrigger = document.getElementById('my-works-link');
    const closeBtn = document.querySelector('.works-modal-close');
    const cardsContainer = document.querySelector('.works-cards-container');
    const statsContainer = document.querySelector('.works-stats-container');

    // Stats data
    const statsData = [
        { label: "Projects", value: 2 },
        { label: "Live Products", value: 1 },
        { label: "Coming Soon", value: 1 },
        { label: "Technologies", value: 12, suffix: "+" }
    ];

    // Render Stats
    function renderStats() {
        statsContainer.innerHTML = statsData.map(stat => `
            <div class="stat-box">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value" data-target="${stat.value}">0${stat.suffix || ''}</div>
            </div>
        `).join('');
    }

    // Animate Stats
    function animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(el => {
            const target = parseInt(el.getAttribute('data-target'));
            const suffix = el.textContent.replace(/[0-9]/g, '');
            let current = 0;
            const inc = target / 30; // 30 frames
            
            const updateCounter = () => {
                current += inc;
                if (current < target) {
                    el.textContent = Math.ceil(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    el.textContent = target + suffix;
                }
            };
            updateCounter();
        });
    }

    // Render Projects
    function renderProjects() {
        if (!typeof myProjects !== 'undefined') {
            cardsContainer.innerHTML = myProjects.map(project => `
                <div class="project-card ${project.featured ? 'featured-card' : ''}">
                    ${project.ribbon ? `<div class="project-ribbon">${project.ribbon}</div>` : ''}
                    <div class="project-card-glass">
                        <div class="project-header">
                            <h3 class="project-title">
                                ${project.title}
                                ${project.status.text === 'Live' ? `<span class="live-pulse"></span>` : ''}
                            </h3>
                            <span class="status-badge ${project.status.color}">
                                <span class="status-dot ${project.status.dot}"></span>
                                ${project.status.text}
                            </span>
                        </div>
                        <p class="project-desc">${project.description}</p>
                        <div class="tech-stack">
                            ${project.technologies.map(tech => `<span class="tech-chip">${tech}</span>`).join('')}
                        </div>
                        <div class="project-footer">
                            <a href="${project.button.url}" 
                               ${project.button.disabled ? 'disabled' : 'target="_blank" rel="noopener noreferrer"'}
                               class="btn ${project.button.disabled ? 'btn-disabled' : 'btn-primary'} btn-glow"
                               title="${project.button.tooltip}">
                               ${project.button.text} ${project.button.disabled ? '' : '<i class="fas fa-external-link-alt"></i>'}
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Modal Interactions
    function openModal(e) {
        if (e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        renderProjects();
        renderStats();
        setTimeout(animateStats, 300); // Slight delay for animation
        
        // Trap focus
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    modalTrigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
