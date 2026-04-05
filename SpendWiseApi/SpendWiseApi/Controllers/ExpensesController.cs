using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpendWiseApi.Models;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ExpenseAnalysisService _analysisService;

    public ExpensesController(AppDbContext context, ExpenseAnalysisService analysisService)
    {
        _context = context;
        _analysisService = analysisService;
    }

    [HttpPost]
    public async Task<IActionResult> AddExpense(Expense expense)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        return Ok(expense);
    }

    [HttpGet]
    public async Task<IActionResult> GetExpenses()
    {
        var data = await _context.Expenses
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("analyze")]
    public async Task<IActionResult> Analyze()
    {
        var expenses = await _context.Expenses.ToListAsync();
        var analysis = await _analysisService.AnalyzeExpensesAsync(expenses);
        return Ok(new { analysis });
    }
}