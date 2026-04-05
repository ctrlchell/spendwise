using SpendWiseApi.Models;
using System.Net.Http.Json;
using System.Text.Json;

public class ExpenseAnalysisService
{
    private readonly HttpClient _http;

    public ExpenseAnalysisService(HttpClient http)
    {
        _http = http;
    }

    public async Task<string> AnalyzeExpenses(List<Expense> expenses)
    {
        if (expenses == null || !expenses.Any())
            return "No expenses yet!";

        var payload = new
        {
            expenses = expenses.Select(e => new
            {
                e.Note,
                e.Amount,
                e.Category,
                e.Date
            })
        };

        var prompt = $@"
You are a smart spending assistant.

Analyze the expenses and return ONLY JSON in this format:

{{
  ""essential"": [],
  ""optional"": [],
  ""luxury"": [],
  ""highestPriority"": """",
  ""overspendingPatterns"": [],
  ""advice"": []
}}

Rules:
- Essential = necessary for survival, health, work, bills, transport, rent, groceries
- Optional = non-essential but reasonable spending, like eating out occasionally or small personal items
- Luxury = non-essential, high-cost, aesthetic, impulse, or lifestyle spending that can be postponed

Important:
- Transport to work should usually be essential
- Groceries should usually be essential
- Aesthetic or decorative purchases are usually luxury or optional depending on amount
- Use the note, category, and amount together before deciding

Tasks:
1. classify each expense as essential, optional, or luxury
2. identify the highest-priority spending
3. point out any overspending patterns
4. give short practical advice

Expense data:
{JsonSerializer.Serialize(payload)}

Keep the response clear, concise, and helpful.
";      

        var response = await _http.PostAsJsonAsync(
            "http://localhost:11434/api/generate",
            new
            {
                model = "gemma:2b",
                prompt = prompt,
                stream = false
            });

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();

        return result.GetProperty("response").GetString() ?? "Could not analyze expenses.";
    }

    public async Task<string> AnalyzeExpensesAsync(List<Expense> expenses)
    {
        return await AnalyzeExpenses(expenses);
    }
}