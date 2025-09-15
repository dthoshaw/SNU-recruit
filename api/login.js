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
        res.setHeader(
          'Set-Cookie',
          `siteAuth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`
        );
        res.status(200).json({ ok: true });
      } else {
        res.status(401).json({ ok: false });
      }
    } catch (err) {
      res.status(400).json({ ok: false });
    }
  });
}
