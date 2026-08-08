import { sql } from "./_lib/db.js";
import { cors } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { sid } = req.body;
  if (!sid) return res.status(400).end();

  const db = sql();
  const ip = req.headers["x-forwarded-for"] || "";
  const ua = (req.headers["user-agent"] || "").slice(0, 200);

  try {
    // Upsert sessão
    await db`INSERT INTO active_sessions (sid, ip, user_agent, first_seen, last_ping)
      VALUES (${sid}, ${ip}, ${ua}, NOW(), NOW())
      ON CONFLICT (sid) DO UPDATE SET last_ping = NOW(), ip = ${ip}, user_agent = ${ua}`;

    // Visita diária por IP único
    await db`INSERT INTO daily_visits (ip, user_agent, visit_date)
      VALUES (${ip}, ${ua}, CURRENT_DATE)
      ON CONFLICT (ip, visit_date) DO NOTHING`;

    // Limpa inativos
    await db`DELETE FROM active_sessions WHERE last_ping < NOW() - INTERVAL '45 seconds'`;

    res.json({ ok: true });
  } catch { res.json({ ok: true }); }
}
