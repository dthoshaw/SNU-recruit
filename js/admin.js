document.addEventListener('DOMContentLoaded', () => {
    let isProcessing = false;

    // --- Supabase helpers ---
    async function fetchPnms() {
        const { data, error } = await supabase.from('pnms').select('*').order('number', { ascending: true });
        if (error) { console.error(error); alert('Error loading PNMs'); return []; }
        return data || [];
    }

    async function uploadPhotoAndGetUrl(fileOrBlob, originalName) {
        if (!fileOrBlob) return null;
        const safeName = (originalName || 'photo').replace(/\s+/g, '_');
        const path = `pnms/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
        const options = {
            contentType: (fileOrBlob.type || 'image/jpeg'),
            cacheControl: '3600',
            upsert: true
        };
        const { error: upErr } = await supabase.storage.from('photos').upload(path, fileOrBlob, options);
        if (upErr) {
            console.error('Supabase upload error:', upErr);
            alert(`Photo upload failed: ${upErr.message || upErr}`);
            return null;
        }
        const { data } = supabase.storage.from('photos').getPublicUrl(path);
        return data?.publicUrl || null;
    }

    async function insertPnm({ name, number, gpa, photoUrl }) {
        const { data, error } = await supabase.from('pnms').insert([{ name, number: Number(number), gpa: Number(gpa), photo: photoUrl }]).select('*').single();
        if (error) { console.error(error); alert('Failed to add PNM'); return null; }
        return data;
    }

    async function updatePnm(id, { name, number, gpa, photoUrl }) {
        const payload = { name, number: Number(number), gpa: Number(gpa) };
        if (photoUrl) payload.photo = photoUrl;
        const { error } = await supabase.from('pnms').update(payload).eq('id', id);
        if (error) { console.error(error); alert('Failed to update PNM'); return false; }
        return true;
    }

    async function deletePnmRemote(id) {
        const { error } = await supabase.from('pnms').delete().eq('id', id);
        if (error) { console.error(error); alert('Failed to delete PNM'); return false; }
        return true;
    }

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
                    callback(blob);
                }, 'image/jpeg', 0.7);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Form submission handler
    document.getElementById('pnmForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const editId = this.dataset.editId;

        if (isProcessing) return;

        // Validate form inputs
        const name = document.getElementById('name').value.trim();
        const number = document.getElementById('number').value;
        const gpa = document.getElementById('gpa').value;
        const file = document.getElementById('photo').files[0];

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

        let photoUrl = null;
        try {
            if (file) {
                // Compress and upload
                await new Promise((resolve, reject) => {
                    compressImage(file, async (blob) => {
                        try {
                            // Ensure we pass a Blob with proper type
                            const uploadBlob = new Blob([blob], { type: 'image/jpeg' });
                            photoUrl = await uploadPhotoAndGetUrl(uploadBlob, file.name);
                            resolve();
                        } catch (err) { reject(err); }
                    });
                });
            }

            if (editId) {
                await updatePnm(editId, { name, number, gpa, photoUrl });
                alert('PNM updated successfully!');
            } else {
                await insertPnm({ name, number, gpa, photoUrl });
                alert('PNM added successfully!');
            }

            this.reset();
            document.getElementById('fileName').textContent = 'No file chosen';
            delete this.dataset.editId;
            delete this.dataset.existingPhoto;
            submitBtn.querySelector('span').textContent = 'Add PNM';
            await renderAdminList();
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred');
        } finally {
            isProcessing = false;
            submitBtn.disabled = false;
        }
    });

    // PNM List Management
    async function renderAdminList() {
        const container = document.getElementById('adminPnmList');
        const pnms = await fetchPnms();
        
        container.innerHTML = pnms.map(pnm => `
            <div class="pnm-item" data-id="${pnm.id}">
                <div class="pnm-actions">
                    <button class="edit-btn" onclick="openEditForm('${pnm.id}')">Edit</button>
                    <button class="delete-btn" onclick="deletePnm('${pnm.id}')">Remove</button>
                </div>
                <img src="${pnm.photo}" class="admin-thumb" alt="${pnm.name}">
                <h4>${pnm.name}</h4>
                <p>#${pnm.number} | GPA: ${pnm.gpa}</p>
                <p>Status: ${pnm.bid === 'bid' ? 'Bid' : (pnm.bid === 'no-bid' ? 'No-Bid' : 'Pending')}</p>
            </div>
        `).join('');

        document.getElementById('totalPnms').textContent = pnms.length;
        document.getElementById('avgGpa').textContent = pnms.length > 0 
            ? (pnms.reduce((sum, p) => sum + Number(p.gpa || 0), 0) / pnms.length).toFixed(2)
            : '0.00';
    }

    window.deletePnm = async function(id) {
        if (!confirm('Delete this PNM permanently?')) return;
        const ok = await deletePnmRemote(id);
        if (ok) {
            await renderAdminList();
            alert('PNM deleted successfully!');
        }
    };

    window.openEditForm = async function(id) {
        const pnms = await fetchPnms();
        const pnm = pnms.find(p => p.id === id);
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

    // Clear all data (dangerous)
    document.querySelector('.clear-btn')?.addEventListener('click', async function() {
        if (!confirm('Are you sure you want to delete ALL PNMs? This cannot be undone!')) return;
        const { error } = await supabase.from('pnms').delete().neq('id', null);
        if (error) { console.error(error); alert('Failed to clear PNMs'); return; }
        alert('All PNMs deleted');
        await renderAdminList();
    });

    // Initial render
    renderAdminList();
});