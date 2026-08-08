import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });

  const db = sql();

  try {
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      const rows = await db`SELECT nome FROM submissions WHERE id = ${id}`;
      await db`DELETE FROM submissions WHERE id = ${id}`;
      if (rows[0]) await db`INSERT INTO activity_log (action, details) VALUES ('deletado', ${rows[0].nome})`;
      return res.json({ ok: true });
    }

    if (req.method === "PATCH") {
      const { id, action, status, notes } = req.body;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });

      if (action === "status" && status) {
        await db`UPDATE submissions SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
        const rows = await db`SELECT nome FROM submissions WHERE id = ${id}`;
        await db`INSERT INTO activity_log (action, details) VALUES ('status', ${(rows[0]?.nome || id) + " → " + status})`;
        return res.json({ ok: true });
      }

      if (action === "notes") {
        await db`UPDATE submissions SET notes = ${notes || ""}, updated_at = NOW() WHERE id = ${id}`;
        return res.json({ ok: true });
      }
    }

    res.status(400).json({ error: "Ação inválida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
