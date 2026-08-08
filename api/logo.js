import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const db = sql();

  // GET — serve logo
  if (req.method === "GET") {
    try {
      const rows = await db`SELECT data, mime_type FROM files WHERE key = 'logo'`;
      if (!rows[0]?.data) return res.status(404).end();
      const match = rows[0].data.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (!match) return res.status(500).end();
      res.setHeader("Content-Type", rows[0].mime_type || "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(Buffer.from(match[1], "base64"));
    } catch { return res.status(404).end(); }
  }

  // POST — upload (admin)
  if (req.method === "POST") {
    if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Sem imagem" });

    const match = image.match(/^data:image\/(png|jpg|jpeg|webp|gif|svg\+xml);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: "Formato inválido" });

    const mime = `image/${match[1]}`;
    try {
      await db`INSERT INTO files (key, data, mime_type) VALUES ('logo', ${image}, ${mime})
        ON CONFLICT (key) DO UPDATE SET data = ${image}, mime_type = ${mime}`;

      const url = `/api/logo?t=${Date.now()}`;
      const rows = await db`SELECT data FROM settings WHERE id = 1`;
      const current = rows[0]?.data || {};
      current.logo_url = url;
      await db`UPDATE settings SET data = ${JSON.stringify(current)}::jsonb WHERE id = 1`;
      await db`INSERT INTO activity_log (action, details) VALUES ('logo', 'Logo atualizado')`;

      return res.json({ ok: true, url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).end();
}
