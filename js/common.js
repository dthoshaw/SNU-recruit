(async function () {
  // Per-tab auth flag
  const TAB_AUTH_KEY = 'siteAuthTab';

  function hasTabAuth() {
    try { return sessionStorage.getItem(TAB_AUTH_KEY) === '1'; } catch { return false; }
  }

  if (hasTabAuth()) return;

  const input = prompt("Enter password:");
  if (!input) {
    document.body.innerHTML = "<h1>Access denied</h1>";
    throw new Error("Access denied");
  }

  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: input })
  });

  if (r.ok) {
    // Set per-tab flag so this tab remains authorized until it closes
    try { sessionStorage.setItem(TAB_AUTH_KEY, '1'); } catch {}
    location.reload();
  } else {
    document.body.innerHTML = "<h1>Access denied</h1>";
    throw new Error("Access denied");
  }
})();


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