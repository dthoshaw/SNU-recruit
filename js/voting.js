// voting.js
document.addEventListener('DOMContentLoaded', () => {
    let currentIndex = 0;
    let pnms = JSON.parse(localStorage.getItem('pnms')) || [];

    // Toggle fullscreen mode
    window.toggleFullscreen = function() {
        const fullscreenContainer = document.getElementById('fullscreenMode');
        if (fullscreenContainer.style.display === 'flex') {
            fullscreenContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        } else {
            fullscreenContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            updateFullscreenDisplay();
        }
    };

    function updateFullscreenDisplay() {
        const pnm = pnms[currentIndex] || {};
        document.getElementById('fs-photo').src = pnm.photo || '';
        document.getElementById('fs-name').textContent = pnm.name || '';
        document.getElementById('fs-number').textContent = pnm.number || '';
        document.getElementById('fs-gpa').textContent = pnm.gpa || '';
        
        const commentsHTML = (pnm.comments || [])
            .map(c => `<div class="comment-item">${c}</div>`)
            .join('') || '<div class="comment-item">No comments yet</div>';
        
        document.getElementById('fs-comments').innerHTML = commentsHTML;
    }

    function updateDisplay() {
        document.getElementById('backButton').disabled = currentIndex === 0;
        document.getElementById('nextButton').disabled = currentIndex >= pnms.length - 1;

        const progressPercent = (currentIndex / pnms.length) * 100;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = 
            `${currentIndex + 1}/${pnms.length}`;

        if (currentIndex < pnms.length) {
            const pnm = pnms[currentIndex];
            document.getElementById('voting-photo').src = pnm.photo || '';
            document.getElementById('voting-name').textContent = pnm.name;
            document.getElementById('voting-number').textContent = pnm.number;
            document.getElementById('voting-gpa').textContent = pnm.gpa;
            document.getElementById('voting-comments').innerHTML = pnm.comments
                .map(c => `<div class="comment-item">${c}</div>`).join('');
        }

        const bidButton = document.querySelector('.bid-button');
        const noBidButton = document.querySelector('.no-bid-button');
        bidButton?.classList.remove('active');
        noBidButton?.classList.remove('active');

        const currentPnm = pnms[currentIndex] || {};
        if (currentPnm.bid === 'bid') {
            bidButton?.classList.add('active');
        } else if (currentPnm.bid === 'no-bid') {
            noBidButton?.classList.add('active');
        }

        if (document.getElementById('fullscreenMode').style.display === 'flex') {
            updateFullscreenDisplay();
        }
    }

    window.vote = function(decision) {
        const currentPnm = pnms[currentIndex];
        if (!currentPnm) return;

        if (currentPnm.bid === decision) {
            currentPnm.bid = null;
            currentPnm.bidStatus = null;
        } else {
            currentPnm.bid = decision;
            currentPnm.bidStatus = decision === 'bid';
        }

        localStorage.setItem('pnms', JSON.stringify(pnms));
        updateDisplay();
        showResults();
    };

    window.navigate = function(direction) {
        currentIndex = Math.max(0, Math.min(pnms.length - 1, currentIndex + direction));
        updateDisplay();
    };

    window.updateVote = function(id, decision) {
        const index = pnms.findIndex(p => p.id === id);
        const pnm = pnms[index];
        if (!pnm) return;

        if (pnm.bid === decision) {
            pnm.bid = null;
            pnm.bidStatus = null;
        } else {
            pnm.bid = decision;
            pnm.bidStatus = decision === 'bid';
        }

        localStorage.setItem('pnms', JSON.stringify(pnms));
        showResults();
        if (index === currentIndex) updateDisplay();
    };

    function showResults() {
        const total = pnms.length;
        const bids = pnms.filter(p => p.bid === 'bid').length;
        const noBids = pnms.filter(p => p.bid === 'no-bid').length;
        const undecided = total - bids - noBids;

        document.querySelector('.counter.total strong').textContent = total;
        document.querySelector('.counter.bids strong').textContent = bids;
        document.querySelector('.counter.no-bids strong').textContent = noBids;
        document.querySelector('.counter.undecided strong').textContent = undecided;

        document.getElementById('results').innerHTML = pnms.map(pnm => `
            <div class="result-item ${pnm.bid || 'unvoted'}">
                <div class="pnm-info">
                    <span class="pnm-number">#${pnm.number}</span>
                    <span class="pnm-name">${pnm.name}</span>
                </div>
                <div class="result-buttons">
                    <button onclick="updateVote('${pnm.id}', 'bid')" 
                        class="vote-button bid-button ${pnm.bid === 'bid' ? 'active' : ''}">Bid</button>
                    <button onclick="updateVote('${pnm.id}', 'no-bid')" 
                        class="vote-button no-bid-button ${pnm.bid === 'no-bid' ? 'active' : ''}">No Bid</button>
                </div>
            </div>
        `).join('');
    }

    // Initial setup
    updateDisplay();
    showResults();
});