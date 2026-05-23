import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, historyTable } from "@workspace/db";
import {
  ListHistoryResponse,
  AddHistoryBody,
  DeleteHistoryParams,
  ListHistoryResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(historyTable)
    .orderBy(desc(historyTable.createdAt))
    .limit(100);

  res.json(
    ListHistoryResponse.parse(
      items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }))
    )
  );
});

router.post("/history", async (req, res): Promise<void> => {
  const parsed = AddHistoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(historyTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(
    ListHistoryResponseItem.parse({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })
  );
});

router.delete("/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteHistoryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(historyTable)
    .where(eq(historyTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "History item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
