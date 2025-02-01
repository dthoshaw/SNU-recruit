// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// LocalStorage helper functions
const Storage = {
    getPnms: () => JSON.parse(localStorage.getItem('pnms')) || [],
    savePnms: (pnms) => localStorage.setItem('pnms', JSON.stringify(pnms)),
    clearStorage: () => {
        if(confirm('Are you sure you want to delete ALL data?')) {
            localStorage.clear();
            location.reload();
        }
    }
};