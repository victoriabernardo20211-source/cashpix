import { sql } from "./_lib/db.js";
import { cors } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { cpf, nome, phone, pixType, pixKey, valorFatura, cashback, fileName } = req.body;
  if (!cpf || !nome || !pixKey || !valorFatura) return res.status(400).json({ error: "Dados incompletos" });

  const db = sql();
  const ua = (req.headers["user-agent"] || "").slice(0, 300);
  const ip = req.headers["x-forwarded-for"] || "";

  try {
    const rows = await db`INSERT INTO submissions
      (cpf, cpf_formatted, nome, phone, pix_type, pix_key, valor_fatura, cashback, file_name, user_agent, ip)
      VALUES (${cpf.replace(/\D/g, "")}, ${cpf}, ${nome}, ${phone || ""}, ${pixType || ""},
              ${pixKey}, ${valorFatura}, ${cashback}, ${fileName || ""}, ${ua}, ${ip})
      RETURNING id`;

    await db`INSERT INTO activity_log (action, details)
      VALUES ('nova_solicitacao', ${nome + " - R$ " + Number(cashback).toFixed(2)})`;

    res.json({ ok: true, id: rows[0]?.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
