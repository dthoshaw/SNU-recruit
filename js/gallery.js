// gallery.js
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('pnmModal');
    const modalOverlay = document.getElementById('modalOverlay');
    let selectedPnm = null;
    let selectedCard = null;

    function openModal() {
        modal?.classList.remove('hidden');
        modal?.classList.add('active');
        modalOverlay?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal?.classList.add('hidden');
        modal?.classList.remove('active');
        modalOverlay?.classList.add('hidden');
        document.body.style.overflow = '';
        // Remove selected highlight when closing
        selectedCard?.classList.remove('selected');
        selectedCard = null;
    }

    function renderGallery() {
        gallery.innerHTML = '';
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        const filter = document.getElementById('bidFilter')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'number-asc';

        let working = pnms.filter(pnm => {
            if (filter === 'bid') return pnm.bid === "bid";
            if (filter === 'no-bid') return pnm.bid === "no-bid";
            return true;
        });

        // Sorts
        const toNumber = (val) => {
            const n = Number(val);
            return Number.isFinite(n) ? n : 0;
        };
        const byFirst = (name = '') => (name || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
        const byLast = (name = '') => {
            const parts = (name || '').trim().split(/\s+/);
            return (parts[parts.length - 1] || '').toLowerCase();
        };

        if (sortBy === 'number-asc') {
            working.sort((a, b) => toNumber(a.number) - toNumber(b.number));
        } else if (sortBy === 'first-asc') {
            working.sort((a, b) => byFirst(a.name).localeCompare(byFirst(b.name)));
        } else if (sortBy === 'last-asc') {
            working.sort((a, b) => byLast(a.name).localeCompare(byLast(b.name)));
        }

        working.forEach(pnm => {
            const card = document.createElement('div');
            card.className = 'pnm-card';
            card.innerHTML = `
                <span class="pnm-number-badge">#${pnm.number}</span>
                <img src="${pnm.photo}" alt="${pnm.name}">
                <h3>${pnm.name}</h3>
            `;

            // Hover highlight only
            card.addEventListener('mouseenter', () => card.classList.add('selected'));
            card.addEventListener('mouseleave', () => {
                if (card !== selectedCard) card.classList.remove('selected');
            });

            card.addEventListener('click', () => {
                // Highlight while modal open
                if (selectedCard && selectedCard !== card) selectedCard.classList.remove('selected');
                selectedCard = card;
                card.classList.add('selected');
                selectedPnm = pnm;
                populateModal(pnm);
                openModal();
            });

            gallery?.appendChild(card);
        });
    }

    function populateModal(pnm) {
        document.getElementById('pnm-name').textContent = pnm.name;
        document.getElementById('pnm-number').textContent = pnm.number;
        document.getElementById('pnm-gpa').textContent = pnm.gpa;
        document.getElementById('comments').innerHTML = (pnm.comments || [])
            .map(c => `<div class="comment">${c}</div>`).join('');
    }

    // Expose for close button compatibility
    window.closeSidebar = function() {
        closeModal();
    };

    // Comment form submission
    document.getElementById('commentForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const comment = this.querySelector('textarea').value;
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        const index = pnms.findIndex(p => p.id === selectedPnm?.id);

        if (index !== -1) {
            if (!Array.isArray(pnms[index].comments)) pnms[index].comments = [];
            pnms[index].comments.push(comment);
            localStorage.setItem('pnms', JSON.stringify(pnms));
            populateModal(pnms[index]);
            renderGallery();
            this.reset();
        }
    });

    // Filter and sort change
    document.getElementById('bidFilter')?.addEventListener('change', renderGallery);
    document.getElementById('sortBy')?.addEventListener('change', renderGallery);

    // Close modal when clicking overlay or pressing Escape
    modalOverlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Initial render
    renderGallery();
});