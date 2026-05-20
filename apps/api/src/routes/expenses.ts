import { Router } from "express";
import { prisma } from "../services/store.js";

const EXPENSE_CATEGORIES = ["Rent", "Salary", "Electricity", "Water", "Internet", "Supplies", "Maintenance", "Marketing", "Other"] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

function isValidCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

export const expensesRouter = Router();

expensesRouter.get("/meta", (_req, res) => {
  res.json({ categories: EXPENSE_CATEGORIES });
});

expensesRouter.get("/", async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const category = String(req.query.category ?? "").trim();
  const month = String(req.query.month ?? "").trim(); // YYYY-MM

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }

  if (category && isValidCategory(category)) {
    where.category = category;
  }

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where.expenseDate = { gte: start, lt: end };
  }

  const expenses = await prisma.expense.findMany({ where, orderBy: { expenseDate: "desc" } });
  res.json(expenses);
});

expensesRouter.get("/summary/monthly", async (req, res) => {
  const month = String(req.query.month ?? "").trim();
  const now = new Date();
  const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const target = /^\d{4}-\d{2}$/.test(month) ? month : defaultMonth;

  const start = new Date(`${target}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  const monthlyExpenses = await prisma.expense.findMany({ where: { expenseDate: { gte: start, lt: end } } });

  const totalAmount = monthlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const byCategory = monthlyExpenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + Number(item.amount);
    return acc;
  }, {});

  res.json({ month: target, totalAmount, expenseCount: monthlyExpenses.length, byCategory });
});

expensesRouter.get("/analytics", async (_req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { expenseDate: "asc" } });

  const totalsByMonth = expenses.reduce<Record<string, number>>((acc, item) => {
    const key = item.expenseDate.toISOString().slice(0, 7);
    acc[key] = (acc[key] ?? 0) + Number(item.amount);
    return acc;
  }, {});

  const totalsByCategory = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + Number(item.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(totalsByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  res.json({ totalsByMonth, totalsByCategory, topCategories, totalExpenseAmount: expenses.reduce((sum, e) => sum + Number(e.amount), 0) });
});

expensesRouter.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const category = String(body.category ?? "Other");
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid expense category" });
  }

  const expense = await prisma.expense.create({
    data: {
      id: String(body.id ?? `exp_${Date.now()}`),
      accountId: String(body.accountId ?? "default-account"),
      title: String(body.title ?? "Expense"),
      description: body.description ? String(body.description) : null,
      category,
      amount: Number(body.amount ?? 0),
      expenseDate: body.expenseDate ? new Date(String(body.expenseDate)) : new Date(),
      createdBy: String(body.createdBy ?? "system")
    }
  });
  res.status(201).json(expense);
});

expensesRouter.put("/:id", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (body.title !== undefined) patch.title = String(body.title);
  if (body.description !== undefined) patch.description = body.description ? String(body.description) : null;
  if (body.category !== undefined) {
    const c = String(body.category);
    if (!isValidCategory(c)) return res.status(400).json({ error: "Invalid expense category" });
    patch.category = c;
  }
  if (body.amount !== undefined) patch.amount = Number(body.amount);
  if (body.expenseDate !== undefined) patch.expenseDate = new Date(String(body.expenseDate));

  const updated = await prisma.expense.update({ where: { id: req.params.id }, data: patch });
  res.json(updated);
});

expensesRouter.delete("/:id", async (req, res) => {
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
