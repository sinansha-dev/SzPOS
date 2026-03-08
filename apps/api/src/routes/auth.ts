import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  return res.json({
    accessToken: "dev-access-token",
    refreshToken: "dev-refresh-token",
    user: {
      id: "user_01",
      name: "Admin",
      role: "admin",
      email
    }
  });
});
