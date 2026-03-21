import { Router } from "express";
import { prisma } from "../services/store.js";

export const returnsRouter = Router();

returnsRouter.post("/", async (req, res) => {
  try {
    const id = `ret_${Date.now()}`;
    const payload = { id, ...req.body, status: "approved" };

    const returnRecord = await prisma.return.create({
      data: {
        id,
        payload
      }
    });

    return res.status(201).json(returnRecord.payload);
  } catch (error) {
    console.error("Error creating return:", error);
    return res.status(500).json({ error: "Failed to create return" });
  }
});

returnsRouter.get("/:id", async (req, res) => {
  try {
    const returnRecord = await prisma.return.findUnique({
      where: { id: req.params.id }
    });

    if (!returnRecord) {
      return res.status(404).json({ error: "Return not found" });
    }

    return res.json(returnRecord.payload);
  } catch (error) {
    console.error("Error fetching return:", error);
    return res.status(500).json({ error: "Failed to fetch return" });
  }
});
