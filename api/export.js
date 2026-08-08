import { sql } from "./_lib/db.js";
import { cors, checkAuth } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!checkAuth(req)) return res.status(401).json({ error: "Não autorizado" });

  const db = sql();

  try {
    const rows = await db`SELECT * FROM submissions ORDER BY created_at DESC`;
    const h = "ID,Data,Nome,CPF,Telefone,Tipo PIX,Chave PIX,Fatura,Cashback,Status,IP,UserAgent,Obs\n";
    const csv = rows.map(r => {
      const dt = new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      return `${r.id},"${dt}","${r.nome}","${r.cpf_formatted}","${r.phone}","${r.pix_type}","${r.pix_key}",${r.valor_fatura},${r.cashback},"${r.status}","${r.ip || ""}","${(r.user_agent || "").replace(/"/g, "")}","${(r.notes || "").replace(/"/g, '""')}"`;
    }).join("\n");

    await db`INSERT INTO activity_log (action, details) VALUES ('export_csv', ${rows.length + " registros"})`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=cashpix-export.csv");
    res.send("\uFEFF" + h + csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
