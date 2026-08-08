import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });

  const db = sql();
  const { status, search } = req.query;

  try {
    let rows;
    if (status && status !== "todos" && search) {
      rows = await db`SELECT * FROM submissions WHERE status = ${status} AND (nome ILIKE ${"%" + search + "%"} OR cpf ILIKE ${"%" + search + "%"}) ORDER BY created_at DESC LIMIT 100`;
    } else if (status && status !== "todos") {
      rows = await db`SELECT * FROM submissions WHERE status = ${status} ORDER BY created_at DESC LIMIT 100`;
    } else if (search) {
      rows = await db`SELECT * FROM submissions WHERE nome ILIKE ${"%" + search + "%"} OR cpf ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT 100`;
    } else {
      rows = await db`SELECT * FROM submissions ORDER BY created_at DESC LIMIT 100`;
    }

    const data = rows.map(r => ({
      ...r,
      valor_fatura: Number(r.valor_fatura),
      cashback: Number(r.cashback),
      created_at: new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    }));

    // Stats
    const [{ total }] = await db`SELECT COUNT(*)::int as total FROM submissions`;
    const [{ pendente }] = await db`SELECT COUNT(*)::int as pendente FROM submissions WHERE status = 'pendente'`;
    const [{ pago }] = await db`SELECT COUNT(*)::int as pago FROM submissions WHERE status = 'pago'`;
    const [{ rejeitado }] = await db`SELECT COUNT(*)::int as rejeitado FROM submissions WHERE status = 'rejeitado'`;
    const [{ sum }] = await db`SELECT COALESCE(SUM(cashback), 0)::float as sum FROM submissions`;
    const [{ hoje }] = await db`SELECT COUNT(*)::int as hoje FROM submissions WHERE created_at::date = CURRENT_DATE`;

    res.json({ data, total: data.length, stats: { total, pendente, pago, rejeitado, totalCashback: sum, hoje } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
