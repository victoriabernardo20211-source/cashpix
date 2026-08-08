import { sql } from "./_lib/db.js";
import { cors, signToken } from "./_lib/auth.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { user, password } = req.body;
  if (user === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    const token = signToken();
    const db = sql();
    await db`INSERT INTO activity_log (action, details) VALUES ('login', 'Admin logou')`;
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: "Credenciais inválidas" });
}
