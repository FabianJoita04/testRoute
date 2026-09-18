using Microsoft.EntityFrameworkCore;
using RouteOptimizer.Core.Entities;

namespace RouteOptimizer.Infrastructure.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<BusRoute> BusRoutes { get; set; }
        public DbSet<BusStop> BusStops { get; set; }
        public DbSet<Bus> Buses { get; set; }
        public DbSet<TripRequest> TripRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure spatial properties
            modelBuilder.Entity<BusStop>()
                .Property(e => e.Location)
                .HasColumnType("geometry(Point, 4326)");

            modelBuilder.Entity<BusRoute>()
                .Property(e => e.Path)
                .HasColumnType("geometry(LineString, 4326)");

            modelBuilder.Entity<Bus>()
                .Property(e => e.CurrentLocation)
                .HasColumnType("geometry(Point, 4326)");

            modelBuilder.Entity<TripRequest>()
                .Property(e => e.OriginPoint)
                .HasColumnType("geometry(Point, 4326)");

            modelBuilder.Entity<TripRequest>()
                .Property(e => e.DestinationPoint)
                .HasColumnType("geometry(Point, 4326)");

            // Configure relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            modelBuilder.Entity<Bus>()
                .HasOne(b => b.CurrentRoute)
                .WithMany(r => r.Buses)
                .HasForeignKey(b => b.CurrentRouteId);

            modelBuilder.Entity<TripRequest>()
                .HasOne(t => t.User)
                .WithMany(u => u.TripRequests)
                .HasForeignKey(t => t.UserId);

            modelBuilder.Entity<TripRequest>()
                .HasOne(t => t.SelectedRoute)
                .WithMany()
                .HasForeignKey(t => t.SelectedRouteId);

            // Configure many-to-many relationship
            modelBuilder.Entity<BusRoute>()
                .HasMany(r => r.BusStops)
                .WithMany(s => s.BusRoutes)
                .UsingEntity(j => j.ToTable("RouteStops"));

            // Configure indexes
            modelBuilder.Entity<BusStop>()
                .HasIndex(s => s.Location)
                .HasMethod("gist");

            modelBuilder.Entity<BusRoute>()
                .HasIndex(r => r.Path)
                .HasMethod("gist");

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
