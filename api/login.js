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
        const oneDay = 60 * 60 * 24;
        const base = `Path=/; SameSite=Lax; Max-Age=${oneDay}; Secure`;
        // HttpOnly cookie (for server-side protection if needed)
        const serverCookie = `siteAuth=1; HttpOnly; ${base}`;
        // Readable cookie so the front-end can detect auth status
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
