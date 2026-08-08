import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });

  const db = sql();
  const { type } = req.query;

  try {
    // Log de atividades
    if (type === "log") {
      const rows = await db`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100`;
      const formatted = rows.map(r => ({
        ...r, created_at: new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      }));
      return res.json(formatted);
    }

    // Limpa inativos
    await db`DELETE FROM active_sessions WHERE last_ping < NOW() - INTERVAL '45 seconds'`;

    // Online agora
    const sessions = await db`SELECT * FROM active_sessions`;
    const onlineList = sessions.map(s => ({
      ip: s.ip, ua: s.user_agent,
      since: new Date(s.first_seen).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      duration: Math.round((Date.now() - new Date(s.first_seen).getTime()) / 60000) + " min",
    }));

    // Visitas hoje
    const [{ count: todayVisits }] = await db`SELECT COUNT(*)::int as count FROM daily_visits WHERE visit_date = CURRENT_DATE`;

    // Últimos 7 dias
    const [{ count: weekVisits }] = await db`SELECT COUNT(*)::int as count FROM daily_visits WHERE visit_date >= CURRENT_DATE - INTERVAL '7 days'`;

    res.json({ online: sessions.length, todayVisits, weekVisits, onlineList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
