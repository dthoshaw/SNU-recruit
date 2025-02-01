document.addEventListener('DOMContentLoaded', () => {
    let isProcessing = false;

    // Image compression function
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => callback(reader.result);
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', 0.7);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Form submission handler
    document.getElementById('pnmForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const editId = this.dataset.editId;

        if (isProcessing) return;

        // Validate form inputs
        const name = document.getElementById('name').value.trim();
        const number = document.getElementById('number').value;
        const gpa = document.getElementById('gpa').value;
        const file = document.getElementById('photo').files[0];

        // Validation checks
        if (!name || !number || !gpa) {
            alert('Name, PNM Number, and GPA are required!');
            return;
        }

        if (isNaN(gpa) || parseFloat(gpa) > 5.0 || parseFloat(gpa) < 0) {
            alert('Please enter a valid GPA between 0-5.0');
            return;
        }

        if (!editId && !file) {
            alert('Please upload a photo for the new PNM.');
            return;
        }

        isProcessing = true;
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = editId ? 'Updating...' : 'Adding...';

        const processPNM = (compressedPhoto) => {
            const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
            
            if (editId) {
                const index = pnms.findIndex(p => p.id == editId);
                if (index === -1) return;
                
                pnms[index] = {
                    ...pnms[index],
                    name: name,
                    number: number,
                    gpa: gpa,
                    photo: compressedPhoto || this.dataset.existingPhoto
                };
            } else {
                pnms.push({
                    id: Date.now(),
                    name: name,
                    number: number,
                    gpa: gpa,
                    photo: compressedPhoto,
                    comments: [],
                    bidStatus: null
                });
            }

            localStorage.setItem('pnms', JSON.stringify(pnms));
            this.reset();
            document.getElementById('fileName').textContent = 'No file chosen';
            resetFormState(submitBtn);
            delete this.dataset.editId;
            delete this.dataset.existingPhoto;
            submitBtn.querySelector('span').textContent = 'Add PNM';
            renderAdminList();
            alert(editId ? 'PNM updated successfully!' : 'PNM added successfully!');
        };

        if (file) {
            compressImage(file, processPNM);
        } else if (editId) {
            processPNM(null);
        }
    });

    // PNM List Management
    function renderAdminList() {
        const container = document.getElementById('adminPnmList');
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        
        container.innerHTML = pnms.map(pnm => `
            <div class="pnm-item" data-id="${pnm.id}">
                <div class="pnm-actions">
                    <button class="edit-btn" onclick="openEditForm('${pnm.id}')">Edit</button>
                    <button class="delete-btn" onclick="deletePnm('${pnm.id}')">Remove</button>
                </div>
                <img src="${pnm.photo}" class="admin-thumb" alt="${pnm.name}">
                <h4>${pnm.name}</h4>
                <p>#${pnm.number} | GPA: ${pnm.gpa}</p>
                <p>Status: ${pnm.bidStatus !== null ? 
                    (pnm.bidStatus ? 'Bid' : 'No-Bid') : 'Pending'}</p>
            </div>
        `).join('');

        document.getElementById('totalPnms').textContent = pnms.length;
        document.getElementById('avgGpa').textContent = pnms.length > 0 
            ? (pnms.reduce((sum, p) => sum + parseFloat(p.gpa), 0) / pnms.length).toFixed(2)
            : '0.00';
    }

    window.deletePnm = function(id) {
        if (!confirm('Delete this PNM permanently?')) return;
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        const filtered = pnms.filter(p => p.id != id);
        localStorage.setItem('pnms', JSON.stringify(filtered));
        renderAdminList();
        alert('PNM deleted successfully!');
    };

    window.openEditForm = function(id) {
        const pnms = JSON.parse(localStorage.getItem('pnms')) || [];
        const pnm = pnms.find(p => p.id == id);
        
        if (!pnm) return;
        
        document.getElementById('name').value = pnm.name;
        document.getElementById('number').value = pnm.number;
        document.getElementById('gpa').value = pnm.gpa;
        document.getElementById('fileName').textContent = 'Using existing photo';
        
        const form = document.getElementById('pnmForm');
        form.dataset.editId = id;
        form.dataset.existingPhoto = pnm.photo;
        form.querySelector('button[type="submit"] span').textContent = 'Update PNM';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // File input handler
    document.getElementById('photo')?.addEventListener('change', function(e) {
        document.getElementById('fileName').textContent = 
            this.files[0]?.name || 'No file chosen';
    });

    // Clear storage
    document.querySelector('.clear-btn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
            localStorage.clear();
            alert('All data has been cleared!');
            location.reload();
        }
    });

    // Helper function
    function resetFormState(submitBtn) {
        isProcessing = false;
        submitBtn.disabled = false;
    }

    // Initial render
    renderAdminList();
});