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

    public async Task<ExpenseAnalysisResult> AnalyzeExpensesAsync(List<Expense> expenses)
    {
        if (expenses == null || !expenses.Any())
        {
            return new ExpenseAnalysisResult
            {
                Advice = "No expenses yet."
            };
        }

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
You are a strict personal finance assistant for a spending analysis app.

Your job is to analyze expenses and classify them realistically.

Return ONLY valid JSON in this exact format:

{{
  ""essential"": [],
  ""optional"": [],
  ""luxury"": [],
  ""highestPriority"": """",
  ""overspendingPatterns"": [],
  ""advice"": """"
}}

Classification rules:
- Essential = expenses necessary for survival, health, work, transport to work, bills, groceries, rent, utilities
- Optional = reasonable but non-essential spending, such as casual eating out, entertainment, subscriptions, or small comfort purchases
- Luxury = expensive, aesthetic, impulsive, avoidable, or postponable spending

Important behavior rules:
- Transport to work is essential
- Groceries are essential
- Eating out, shawarma, snacks, and takeout are optional unless clearly necessary
- Aesthetic purchases, decor, beauty extras, and trend-based shopping are usually luxury
- Do not classify based only on category; use note, amount, and category together
- Large non-essential purchases should be treated more seriously
- Be realistic, concise, and financially responsible
- Do not praise the user
- Do not give generic motivational advice
- Advice should be direct, specific, and practical

Expense data:
{JsonSerializer.Serialize(payload)}
";

        try
        {
            var response = await _http.PostAsJsonAsync(
                "http://localhost:11434/api/generate",
                new
                {
                    model = "qwen2.5:3b",
                    prompt,
                    stream = false
                });

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();

            if (!result.TryGetProperty("response", out var responseProperty))
            {
                return new ExpenseAnalysisResult
                {
                    Advice = "AI response was missing the expected field."
                };
            }

            var aiText = responseProperty.GetString();

            if (string.IsNullOrWhiteSpace(aiText))
            {
                return new ExpenseAnalysisResult
                {
                    Advice = "AI returned an empty response."
                };
            }

            aiText = aiText.Trim();

            try
            {
                var parsed = JsonSerializer.Deserialize<ExpenseAnalysisResult>(
                    aiText,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (parsed != null)
                {
                    return parsed;
                }

                return new ExpenseAnalysisResult
                {
                    Advice = "Could not parse AI analysis.",
                    RawText = aiText
                };
            }
            catch
            {
                return new ExpenseAnalysisResult
                {
                    Advice = "AI returned text instead of valid JSON.",
                    RawText = aiText
                };
            }
        }
        catch (Exception ex)
        {
            return new ExpenseAnalysisResult
            {
                Advice = "Analysis failed on the server.",
                RawText = ex.Message
            };
        }
    }
}