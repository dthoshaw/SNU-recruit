// voting.js
document.addEventListener('DOMContentLoaded', () => {
    let currentIndex = -1; // -1 denotes intro screen (0th starting place)
    let pnms = JSON.parse(localStorage.getItem('pnms')) || [];

    const introScreen = document.getElementById('introScreen');
    const votingScreen = document.getElementById('votingScreen');
    const controls = document.getElementById('controls');

    function setVisibility() {
        if (currentIndex === -1) {
            introScreen?.classList.remove('hidden');
            votingScreen?.classList.add('hidden');
            controls?.classList.add('hidden');
        } else {
            introScreen?.classList.add('hidden');
            votingScreen?.classList.remove('hidden');
            controls?.classList.remove('hidden');
        }
    }

    window.startVoting = function() {
        // Jump to first PNM
        if (pnms.length > 0) {
            currentIndex = 0;
            updateDisplay();
        }
    };

    function updateDisplay() {
        // Update visibility first
        setVisibility();

        const atIntro = currentIndex === -1;
        document.getElementById('backButton').disabled = atIntro || currentIndex === 0;
        document.getElementById('nextButton').disabled = atIntro || currentIndex >= pnms.length - 1;

        // Progress: show 0/total at intro; otherwise (index+1)/total
        const progressPercent = pnms.length
            ? (atIntro ? 0 : (((currentIndex + 1) / pnms.length) * 100))
            : 0;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = atIntro
            ? `0/${pnms.length}`
            : `${pnms.length ? currentIndex + 1 : 0}/${pnms.length}`;

        if (!atIntro && currentIndex < pnms.length) {
            const pnm = pnms[currentIndex];
            document.getElementById('voting-photo').src = pnm.photo || '';
            document.getElementById('voting-name').textContent = pnm.name || '';
            document.getElementById('voting-number').textContent = pnm.number || '';
            document.getElementById('voting-gpa').textContent = pnm.gpa || '';
            document.getElementById('voting-comments').innerHTML = (pnm.comments || [])
                .map(c => `<div class="comment-item">${c}</div>`).join('');
        }

        const bidButton = document.querySelector('.bid-button');
        const noBidButton = document.querySelector('.no-bid-button');
        bidButton?.classList.remove('active');
        noBidButton?.classList.remove('active');

        const currentPnm = pnms[currentIndex] || {};
        if (!atIntro && currentPnm.bid === 'bid') {
            bidButton?.classList.add('active');
        } else if (!atIntro && currentPnm.bid === 'no-bid') {
            noBidButton?.classList.add('active');
        }
    }

    window.vote = function(decision) {
        if (currentIndex === -1) return; // ignore on intro
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
        if (currentIndex === -1 && direction > 0) {
            // from intro -> first PNM
            currentIndex = 0;
        } else {
            currentIndex = Math.max(0, Math.min(pnms.length - 1, currentIndex + direction));
        }
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