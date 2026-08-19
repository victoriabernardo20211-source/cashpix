import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const db = sql();

  try {
    if (req.method === "PUT") {
      if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });
      const rows = await db`SELECT data FROM settings WHERE id = 1`;
      const current = rows[0]?.data || {};
      const merged = { ...current, ...req.body };
      await db`UPDATE settings SET data = ${JSON.stringify(merged)}::jsonb WHERE id = 1`;
      await db`INSERT INTO activity_log (action, details) VALUES ('settings', 'Configurações atualizadas')`;
      return res.json({ ok: true });
    }

    const rows = await db`SELECT data FROM settings WHERE id = 1`;
    const settings = rows[0]?.data || {};
    
    // Injeta variáveis do ambiente
    if (process.env.CONSULTANT_PHONE) settings.consultant_phone = process.env.CONSULTANT_PHONE;
    if (process.env.CONSULTANT_MSG) settings.consultant_wa_msg = process.env.CONSULTANT_MSG;
    if (process.env.CONSULTANT_BTN) settings.consultant_btn = process.env.CONSULTANT_BTN;
    
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
