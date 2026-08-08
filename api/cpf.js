import { cors } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { cpf } = req.query;
  if (!cpf || cpf.replace(/\D/g, "").length !== 11) return res.status(400).json({ error: "CPF inválido" });

  try {
    const raw = cpf.replace(/\D/g, "");
    const r = await fetch(`${process.env.CPF_API_URL}?cpf=${raw}&token=${process.env.CPF_API_TOKEN}`);
    const data = await r.json();
    if (data?.body?.name) return res.json({ nome: data.body.name });
    res.status(404).json({ error: "Não encontrado" });
  } catch { res.status(500).json({ error: "Erro API" }); }
}
