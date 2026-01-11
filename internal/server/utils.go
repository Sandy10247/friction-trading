package server

import (
	"context"
	"log"
	"os/signal"
	"syscall"
	"time"

	"friction-trading/internal/config"
)

func GracefulShutdown(server *Server, done chan bool, c *config.Config) {
	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Listen for the interrupt signal.
	<-ctx.Done()

	log.Println("shutting down gracefully, press Ctrl+C again to force")
	stop() // Allow Ctrl+C to force shutdown

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.HttpServer.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	// Close DB Connection
	err := server.Store.Close()
	if err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	log.Println("Server Down 🔴")

	// Notify the main goroutine that the shutdown is complete
	done <- true
}
