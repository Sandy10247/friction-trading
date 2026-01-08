package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"friction-trading/internal/utils"
)

// check Auth
func AuthWithServerCtx(s *Server) func(http.Handler) http.Handler {
	auth := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// check for Server Auth Token
			if s.AccessToken != "" {
				// This is the "next function" call
				next.ServeHTTP(w, r)
				return
			}

			// timeout OCcurred Fuck off

			fmt.Printf("GONE 🔴")
			http.Error(w, "Not Authenticated", http.StatusUnauthorized)
		})
	}
	return auth
}

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// primary
	r.Get("/ping", s.HelloWorldHandler)

	// Health check
	r.Get("/health", s.healthHandler)

	// Login routes
	r.Post("/login", s.loginHandler)
	r.Get("/api/user/callback/kite/", s.loginCallbackHandler)

	r.Route(`/api`, func(r chi.Router) {
		// Check Whether AccessToken is Fetched or not
		r.Use(AuthWithServerCtx(s))

		// User Routes
		r.Get("/user/profile", s.profileHandler)
		r.Get("/user/positons", s.positionsHandler)

		// Trading Routes
		r.Get("/watch-nifty50-option", s.watchNifty50OptionHandler)
	})

	return r
}

// hello world handler
func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World, from Friction Trading V2 API"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// health handler
func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

// login
func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	// Login `URL from which request token can be obtained
	fmt.Println(s.KiteClient.GetLoginURL())

	// open browser for login
	utils.OpenBrowser(s.KiteClient.GetLoginURL())
	// Login URL from which request token can be obtained

	loginCtx, cancelFunc := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancelFunc()

	select {
	case <-loginCtx.Done():
		// timeout OCcurred Fuck off
		http.Error(w, "Login Not Completed ", http.StatusInternalServerError)
	case <-s.AccessTokenCh:
		// AccessToken received Complete Login Process
		resp := make(map[string]string)
		// Access Token Received,
		resp["message"] = "Login Completed 👍"
		// Respond to the client
		jsonResp, err := json.Marshal(resp)
		if err != nil {
			log.Fatalf("error handling JSON marshal. Err: %v", err)
		}
		_, _ = w.Write(jsonResp)
	}
}

// Login Callback Handler
func (s *Server) loginCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Extract the request token from the query parameters
	requestToken := r.URL.Query().Get("request_token")

	if requestToken == "" {
		http.Error(w, "Missing request token", http.StatusBadRequest)
		return
	}

	// Use the request token to get the access token
	data, err := s.KiteClient.GenerateSession(requestToken, s.ApiSecret)
	if err != nil {
		log.Fatalf("error generating session. Err: %v", err)
	}

	// Store the access token for future use
	s.AccessToken = data.AccessToken

	// set Access Token
	s.KiteClient.SetAccessToken(s.AccessToken)
	s.AccessTokenCh <- s.AccessToken

	// Respond to the client
	jsonResp, err := json.Marshal(map[string]string{"message": "Login Successful triggered"})
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}
