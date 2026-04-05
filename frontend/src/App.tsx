import { FormEvent, useEffect, useMemo, useState } from 'react';

type Expense = {
  id: number;
  amount: number;
  category: string;
  note?: string | null;
  date: string;
};

type NewExpense = {
  amount: string;
  category: string;
  note: string;
  date: string;
};

const initialForm: NewExpense = {
  amount: '',
  category: '',
  note: '',
  date: new Date().toISOString().slice(0, 10)
};

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [form, setForm] = useState<NewExpense>(initialForm);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

  async function fetchExpenses() {
    setLoadingExpenses(true);
    setError('');

    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Unable to load expenses');
      }

      const data = (await response.json()) as Expense[];
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error loading expenses');
    } finally {
      setLoadingExpenses(false);
    }
  }

  useEffect(() => {
    void fetchExpenses();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        note: form.note || null,
        date: new Date(form.date).toISOString()
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Unable to save expense');
      }

      setForm(initialForm);
      await fetchExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error saving expense');
    } finally {
      setSaving(false);
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/expenses/analyze');
      if (!response.ok) {
        throw new Error('Unable to analyze expenses');
      }

      const data = (await response.json()) as { analysis: string };
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error analyzing expenses');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">SpendWise Dashboard</h1>
        <p className="text-slate-600">React + TypeScript + Tailwind frontend connected to your SpendWise API.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Add Expense</h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Amount</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
                min="0"
                step="0.01"
                required
                type="number"
                value={form.amount}
                onChange={(event) => setForm((previous) => ({ ...previous, amount: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Category</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
                required
                value={form.category}
                onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Date</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
                required
                type="date"
                value={form.date}
                onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Note</span>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-sky-500 focus:ring"
                rows={3}
                value={form.note}
                onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))}
              />
            </label>

            <button
              className="w-full rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Expenses</h2>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium">
              Total: <span className="font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          {loadingExpenses ? (
            <p className="text-slate-500">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-slate-500">No expenses yet. Add one to get started.</p>
          ) : (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li key={expense.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-lg font-bold text-sky-700">${expense.amount.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                  {expense.note && <p className="mt-1 text-sm text-slate-700">{expense.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">AI Analysis</h2>
          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={analyzing || expenses.length === 0}
            onClick={() => void runAnalysis()}
            type="button"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Spending'}
          </button>
        </div>

        {analysis ? <p className="whitespace-pre-wrap text-slate-700">{analysis}</p> : <p className="text-slate-500">Run analysis to get personalized insights.</p>}
      </section>

      {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </main>
  );
}

export default App;
