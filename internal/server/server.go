package server

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"strconv"
	"time"

	kiteconnect "github.com/zerodha/gokiteconnect/v4"
	kiteticker "github.com/zerodha/gokiteconnect/v4/ticker"

	"friction-trading/internal/config"
	"friction-trading/internal/database"
)

type Server struct {
	port int
	db   database.Service

	// Zerodha Kite
	KiteClient    *kiteconnect.Client
	AccessToken   string // Access token for Kite Connect API 🔥
	ApiKey        string // API Key for Kite
	ApiSecret     string // API Secret for Kite
	AccessTokenCh chan string

	// Ticker
	ticker          *kiteticker.Ticker
	tickCtxCancelFn context.CancelFunc

	// Base Context
	ctx context.Context

	// Config
	config *config.Config
}

func NewServer(c *config.Config) *http.Server {
	port, err := strconv.Atoi(c.Server.Port)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	kc := kiteconnect.New(c.Kite.API_KEY)

	NewServer := &Server{
		port:          port,
		db:            database.New(c),
		KiteClient:    kc,
		ctx:           context.Background(),
		AccessTokenCh: make(chan string, 1),
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
