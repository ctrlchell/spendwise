// src/services/api.ts
const API_BASE = "https://localhost:7029/api";

export async function getExpenses() {
  const res = await fetch(`${API_BASE}/expenses`);
  if (!res.ok) throw new Error("failed to fetch expenses");
  return res.json();
}

export async function addExpense(expense: {
  amount: number;
  category: string;
  note?: string;
  date: string;
}) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });

  if (!res.ok) throw new Error("failed to add expense");
  return res.json();
}

export async function analyzeExpenses() {
  const res = await fetch(`${API_BASE}/expenses/analyze`);
  if (!res.ok) throw new Error("failed to analyze expenses");
  return res.json();
}