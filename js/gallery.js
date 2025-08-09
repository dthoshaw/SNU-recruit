// gallery.js
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('pnmModal');
    const modalOverlay = document.getElementById('modalOverlay');
    let selectedPnm = null;
    let selectedCard = null;

    async function fetchPnms() {
        const { data, error } = await supabase.from('pnms').select('*');
        if (error) { console.error(error); return []; }
        return data || [];
    }

    async function fetchComments(pnmId) {
        const { data, error } = await supabase.from('comments').select('*').eq('pnm_id', pnmId).order('created_at', { ascending: true });
        if (error) { console.error(error); return []; }
        return data || [];
    }

    async function addComment(pnmId, body) {
        const { error } = await supabase.from('comments').insert([{ pnm_id: pnmId, body }]);
        if (error) { console.error(error); alert('Failed to add comment'); }
    }

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
        selectedCard?.classList.remove('selected');
        selectedCard = null;
    }

    async function renderGallery() {
        gallery.innerHTML = '';
        const pnms = await fetchPnms();
        const filter = document.getElementById('bidFilter')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'number-asc';

        let working = pnms.filter(pnm => {
            if (filter === 'bid') return pnm.bid === 'bid';
            if (filter === 'no-bid') return pnm.bid === 'no-bid';
            return true;
        });

        const toNumber = (val) => { const n = Number(val); return Number.isFinite(n) ? n : 0; };
        const byFirst = (name = '') => (name || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
        const byLast = (name = '') => { const parts = (name || '').trim().split(/\s+/); return (parts[parts.length - 1] || '').toLowerCase(); };

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
                <span class=\"pnm-number-badge\">#${pnm.number}</span>
                <img src=\"${pnm.photo}\" alt=\"${pnm.name}\">
                <h3>${pnm.name}</h3>
            `;

            card.addEventListener('mouseenter', () => card.classList.add('selected'));
            card.addEventListener('mouseleave', () => { if (card !== selectedCard) card.classList.remove('selected'); });

            card.addEventListener('click', async () => {
                if (selectedCard && selectedCard !== card) selectedCard.classList.remove('selected');
                selectedCard = card;
                card.classList.add('selected');
                selectedPnm = pnm;
                await populateModal(pnm);
                openModal();
            });

            gallery?.appendChild(card);
        });
    }

    async function populateModal(pnm) {
        document.getElementById('pnm-name').textContent = pnm.name;
        document.getElementById('pnm-number').textContent = pnm.number;
        document.getElementById('pnm-gpa').textContent = pnm.gpa;
        const comments = await fetchComments(pnm.id);
        document.getElementById('comments').innerHTML = comments.map(c => `<div class=\"comment\">${c.body}</div>`).join('');
    }

    window.closeSidebar = function() { closeModal(); };

    document.getElementById('commentForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const comment = this.querySelector('textarea').value;
        if (!selectedPnm?.id) return;
        await addComment(selectedPnm.id, comment);
        await populateModal(selectedPnm);
        this.reset();
    });

    document.getElementById('bidFilter')?.addEventListener('change', renderGallery);
    document.getElementById('sortBy')?.addEventListener('change', renderGallery);

    modalOverlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    renderGallery();
});