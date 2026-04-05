using Microsoft.EntityFrameworkCore;
using SpendWiseApi.Models;

public class AppDbContext : DbContext
{
    public DbSet<Expense> Expenses => Set<Expense>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}