// api/login.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method not allowed
  }

  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try {
      const { password } = JSON.parse(body);
      if (password === process.env.SITE_PASSWORD) {
        // Session cookie (no Max-Age), expires when browser session ends
        // Note: client-side will manage per-tab auth via sessionStorage
        const base = `Path=/; SameSite=Lax; Secure`;
        const serverCookie = `siteAuth=1; HttpOnly; ${base}`;
        res.setHeader('Set-Cookie', serverCookie);
        res.status(200).json({ ok: true });
      } else {
        res.status(401).json({ ok: false });
      }
    } catch (err) {
      res.status(400).json({ ok: false });
    }
  });
}
