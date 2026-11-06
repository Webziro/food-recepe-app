import { ENV } from "../config/env.js";

export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    return res.status(503).json({ error: "Authentication service is not configured" });
  }

  try {
    const response = await fetch(`${ENV.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await response.json();
    if (!user?.id) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.authUser = user;
    next();
  } catch (error) {
    console.error("Authentication verification failed:", error.message);
    res.status(503).json({ error: "Authentication service unavailable" });
  }
}