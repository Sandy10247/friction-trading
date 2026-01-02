package server

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"

	"friction-trading/internal/database"

	_ "github.com/joho/godotenv/autoload"
	kiteconnect "github.com/zerodha/gokiteconnect/v4"
	kiteticker "github.com/zerodha/gokiteconnect/v4/ticker"
)

type Server struct {
	port int
	db   database.Service

	// Zerodha Kite
	KiteClient  *kiteconnect.Client
	AccessToken string // Access token for Kite Connect API 🔥
	ApiKey      string // API Key for Kite
	ApiSecret   string // API Secret for Kite

	// Ticker
	ticker          *kiteticker.Ticker
	tickCtxCancelFn context.CancelFunc

	// Base Context
	ctx context.Context
}

func NewServer() *http.Server {
	port, err := strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	kc := kiteconnect.New(os.Getenv("KITE_API_KEY"))

	NewServer := &Server{
		port:        port,
		db:          database.New(),
		KiteClient:  kc,
		AccessToken: os.Getenv("KITE_ACCESS_TOKEN"),
		ApiKey:      os.Getenv("KITE_API_KEY"),
		ApiSecret:   os.Getenv("KITE_API_SECRET"),
		ctx:         context.Background(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		ConnContext: func(ctx context.Context, c net.Conn) context.Context {
			return context.WithValue(ctx, "remoteAddr", c.RemoteAddr().String())
		},
		BaseContext: func(l net.Listener) context.Context {
			return NewServer.ctx
		},
	}

	return server
}
