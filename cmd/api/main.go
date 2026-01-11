package main

import (
	"fmt"
	"log"
	"net/http"

	"friction-trading/internal/server"

	"friction-trading/internal/config"
)

func main() {
	configLoaded, err := config.LoadConfig("")
	if err != nil {
		log.Fatalf("Err :- Failed to Load Config %v", err)
	}

	newServer := server.NewServer(configLoaded)

	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool, 1)

	// Run graceful shutdown in a separate goroutine
	go server.GracefulShutdown(newServer, done, configLoaded)

	err = newServer.HttpServer.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}

	// Wait for the graceful shutdown to complete
	<-done
	log.Println("Graceful shutdown complete.")
}
