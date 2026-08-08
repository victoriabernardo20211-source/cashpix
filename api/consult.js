import { sql } from "./_lib/db.js";
import { cors } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ error: "CPF inválido" });

  const db = sql();
  const raw = cpf.replace(/\D/g, "");

  try {
    const rows = await db`SELECT * FROM submissions WHERE cpf = ${raw} ORDER BY created_at DESC LIMIT 1`;
    if (rows.length > 0) {
      const r = rows[0];
      r.created_at = new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      return res.json({ found: true, data: r });
    }
    res.json({ found: false });
  } catch { res.json({ found: false }); }
}
