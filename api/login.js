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
        // Session cookies (no Max-Age), expire when the browser session ends
        const base = `Path=/; SameSite=Lax; Secure`;
        // HttpOnly cookie (server-side)
        const serverCookie = `siteAuth=1; HttpOnly; ${base}`;
        // Readable cookie (client-side check)
        const clientCookie = `siteAuthClient=1; ${base}`;
        res.setHeader('Set-Cookie', [serverCookie, clientCookie]);
        res.status(200).json({ ok: true });
      } else {
        res.status(401).json({ ok: false });
      }
    } catch (err) {
      res.status(400).json({ ok: false });
    }
  });
}
