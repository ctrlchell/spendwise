namespace SpendWiseApi.Models
{
    public class ExpenseAnalysisResult
    {
        public List<Expense> Essential { get; set; } = new();
        public List<Expense> Optional { get; set; } = new();
        public List<Expense> Luxury { get; set; } = new();
        public string HighestPriority { get; set; } = string.Empty;
        public List<string> OverspendingPatterns { get; set; } = new();
        public string Advice { get; set; } = string.Empty;
        public string? RawText { get; set; }
    }
}