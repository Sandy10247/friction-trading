package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"friction-trading/internal/config"

	"github.com/jackc/pgx/v5"
)

// Service represents a service that interacts with a database.
type Service interface {
	// Health returns a map of health status information.
	// The keys and values in the map are service-specific.
	Health() map[string]string

	// Close terminates the database connection.
	// It returns an error if the connection cannot be closed.
	Close() error
}

type service struct {
	db *pgx.Conn
}

type Store interface {
	Querier
	Close() error
	Health() map[string]string
}

type ConduitStore struct {
	*Queries // implements Querier
	db       *pgx.Conn
}

func NewStore(db *pgx.Conn) Store {
	return &ConduitStore{
		db:      db,
		Queries: New(db),
	}
}

func DSN(c *config.Config) string {
	return "host=" + c.Database.Host +
		" port=" + c.Database.Port +
		" user=" + c.Database.Username +
		" password=" + c.Database.Password +
		" dbname=" + c.Database.DB +
		" sslmode=" + c.Database.SSLMode
}

func Connect(c *config.Config) *pgx.Conn {
	// Use conf.Database to constrct the connection string and connect to the database
	connectionDsn := DSN(c)

	// Example using pgx to connect to PostgreSQL
	conn, err := pgx.Connect(context.Background(), connectionDsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	// Test the connection
	err = conn.Ping(context.Background())
	if err != nil {
		log.Fatalf("Unable to ping the database: %v\n", err)
	}

	return conn
}

// Health checks the health of the database connection by pinging the database.
// It returns a map with keys indicating various health statistics.
func (s *ConduitStore) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	// Ping the database
	err := s.db.Ping(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	return stats
}

// Close closes the database connection.
// It logs a message indicating the disconnection from the specific database.
// If the connection is successfully closed, it returns nil.
// If an error occurs while closing the connection, it returns the error.
func (s *ConduitStore) Close() error {
	log.Printf("Disconnected from database: ")
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	return s.db.Close(ctx)
}
