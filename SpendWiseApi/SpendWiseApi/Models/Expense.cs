 namespace SpendWiseApi.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = "";
        public string? Note { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
