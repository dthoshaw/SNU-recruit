// gallery.js
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const sidebar = document.getElementById('sidebar');
    let selectedPnm = null;

    function renderGallery() {
        gallery.innerHTML = '';
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        const filter = document.getElementById('bidFilter')?.value || 'all';

        const filteredPnms = pnms.filter(pnm => {
            if (filter === 'bid') return pnm.bid === "bid";
            if (filter === 'no-bid') return pnm.bid === "no-bid";
            return true;
        });

        filteredPnms.forEach(pnm => {
            const card = document.createElement('div');
            card.className = 'pnm-card';
            card.innerHTML = `
                <img src="${pnm.photo}">
                <h3>${pnm.name}</h3>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.pnm-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedPnm = pnm;
                sidebar?.classList.add('active');
                document.getElementById('pnm-name').textContent = pnm.name;
                document.getElementById('pnm-number').textContent = pnm.number;
                document.getElementById('pnm-gpa').textContent = pnm.gpa;
                document.getElementById('comments').innerHTML = pnm.comments
                    .map(c => `<div class="comment">${c}</div>`).join('');
            });
            
            gallery?.appendChild(card);
        });
    }

    window.closeSidebar = function() {
        sidebar?.classList.remove('active');
    };

    // Comment form submission
    document.getElementById('commentForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const comment = this.querySelector('textarea').value;
        const pnms = JSON.parse(localStorage.getItem('pnms'));
        const index = pnms.findIndex(p => p.id === selectedPnm.id);
        
        if (index !== -1) {
            pnms[index].comments.push(comment);
            localStorage.setItem('pnms', JSON.stringify(pnms));
            renderGallery();
            this.reset();
        }
    });

    // Bid filter change
    document.getElementById('bidFilter')?.addEventListener('change', renderGallery);

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar?.contains(e.target) && !e.target.closest('.pnm-card')) {
            closeSidebar();
        }
    });

    // Initial render
    renderGallery();
});