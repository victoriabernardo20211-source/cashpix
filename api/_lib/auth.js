import jwt from "jsonwebtoken";

export function signToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "60m" });
}

export function checkAuth(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return false;
  try { jwt.verify(h.slice(7), process.env.JWT_SECRET); return true; }
  catch { return false; }
}

export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}
