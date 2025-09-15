(async function () {
  function hasAuthCookie() {
    return document.cookie.split(';').some(c => c.trim().startsWith('siteAuthClient='));
  }
  if (hasAuthCookie()) return;

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
    // cookie set by server; reload to let cookie take effect
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