package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	kiteconnect "github.com/zerodha/gokiteconnect/v4"
	kitemodels "github.com/zerodha/gokiteconnect/v4/models"
	kiteticker "github.com/zerodha/gokiteconnect/v4/ticker"
)

// Candle represents a 5-minute OHLC candle.
type Candle struct {
	Timestamp time.Time
	Open      float64
	High      float64
	Low       float64
	Close     float64
	LastPrice float64
}

var candlesData []Candle

const SMA_PERIOD int = 10

var positionStatus string = "NONE"

// CalculateTR computes the True Range for each candle.
func CalculateTR(candles []Candle) []float64 {
	if len(candles) == 0 {
		return nil
	}
	tr := make([]float64, len(candles))
	tr[0] = candles[0].High - candles[0].Low // First TR is just High - Low
	for i := 1; i < len(candles); i++ {
		prevClose := candles[i-1].Close
		tr[i] = max(candles[i].High-candles[i].Low,
			max(abs(candles[i].High-prevClose), abs(candles[i].Low-prevClose)))
	}
	return tr
}

// CalculateATR computes the Average True Range (SMA of TR).
func CalculateATR(tr []float64, period int) []float64 {
	if period <= 0 || len(tr) == 0 {
		return nil
	}
	atr := make([]float64, len(tr))
	for i := 0; i < len(tr); i++ {
		start := max(0, i-period+1)
		sum := 0.0
		for j := start; j <= i; j++ {
			sum += tr[j]
		}
		count := float64(i - start + 1)
		atr[i] = sum / count
	}
	return atr
}

// CalculateSupertrend computes the Supertrend indicator.
func CalculateSupertrend(candles []Candle, atr []float64, multiplier float64) []float64 {
	if len(candles) != len(atr) || len(candles) == 0 {
		return nil
	}
	supertrend := make([]float64, len(candles))
	var direction int = 1 // 1 for uptrend (lower band), -1 for downtrend (upper band)

	for i := 0; i < len(candles); i++ {
		basic := (candles[i].High + candles[i].Low) / 2
		upper := basic + multiplier*atr[i]
		lower := basic - multiplier*atr[i]

		if i == 0 {
			supertrend[i] = lower // Start with lower band assuming uptrend
			continue
		}

		prevSuper := supertrend[i-1]
		if direction == 1 { // Uptrend: use lower band, but adjust if crossed
			supertrend[i] = max(lower, prevSuper)
			if candles[i].Close < supertrend[i] {
				direction = -1
				supertrend[i] = upper
			}
		} else { // Downtrend: use upper band
			supertrend[i] = min(upper, prevSuper)
			if candles[i].Close > supertrend[i] {
				direction = 1
				supertrend[i] = lower
			}
		}
	}
	return supertrend
}

// GenerateSignals produces BUY or SELL signals based on Supertrend.
// BUY when close > supertrend (start of uptrend), SELL when close < supertrend (start of downtrend).
// For each candle, signal is based on crossover from previous.
func GenerateSignals(candles []Candle, supertrend []float64) []string {
	if len(candles) != len(supertrend) || len(candles) < 2 {
		return nil
	}
	signals := make([]string, len(candles))
	for i := 1; i < len(candles); i++ {
		if candles[i-1].Close <= supertrend[i-1] && candles[i].Close > supertrend[i] {
			signals[i] = "BUY"
		} else if candles[i-1].Close >= supertrend[i-1] && candles[i].Close < supertrend[i] {
			signals[i] = "SELL"
		}
	}
	return signals
}

func min[T int | float64](a, b T) T {
	if a < b {
		return a
	}
	return b
}

func abs(a float64) float64 {
	if a < 0 {
		return -a
	}
	return a
}

func max[T int | float64](a, b T) T {
	if a > b {
		return a
	}
	return b
}

func sumCandleData(candleData []Candle) float64 {
	total := 0.0
	for _, val := range candleData {
		total += val.LastPrice
	}
	return float64(total)
}

// Supertrend Strategy
func Supertrend(candleData []Candle) {
	atrPeriod := 7    // Standard ATR period
	multiplier := 3.0 // Standard multiplier

	tr := CalculateTR(candlesData)
	atr := CalculateATR(tr, atrPeriod)
	supertrend := CalculateSupertrend(candlesData, atr, multiplier)
	signals := GenerateSignals(candlesData, supertrend)
	if len(signals) > 1 {
		for i, signal := range signals {
			if signal != "" {
				fmt.Printf("At %s (close %.4f): %s\n", candlesData[i].Timestamp.Format("2006-01-02 15:04"), candlesData[i].Close, signal)
			}
		}
	} else {
		fmt.Printf("No Signal....✊\n")
	}
}

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route(`/api`, func(r chi.Router) {
		// primary
		r.Get("/ping", s.HelloWorldHandler)

		// Login routes
		r.Post("/login", s.loginHandler)
		r.Get("/user/callback/kite/", s.loginCallbackHandler)
		r.Get("/check-login", s.checkLoginHandler)

		// User Routes
		r.Get("/user/profile", s.profileHandler)

		// Trading Routes
		r.Get("/watch-nifty50-option", s.watchNifty50OptionHandler)
	})

	// Health check
	r.Get("/health", s.healthHandler)

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
	resp := make(map[string]string)
	resp["message"] = "Login Successful"

	fmt.Println("Using existing request token from file")
	// Login `URL from which request token can be obtained
	fmt.Println(s.KiteClient.GetLoginURL())

	// open browser for login
	openBrowser(s.KiteClient.GetLoginURL())
	// Login URL from which request token can be obtained

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Login Callback Handler
func (s *Server) loginCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Extract the request token from the query parameters
	requestToken := r.URL.Query().Get("request_token")

	// pritn request token
	fmt.Printf("Request Token: %s\n", requestToken)

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

	// Respond to the client
	jsonResp, err := json.Marshal(map[string]string{"message": "Login Successful triggered"})
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Get profile Details
func (s *Server) profileHandler(w http.ResponseWriter, r *http.Request) {
	userProfile, err := s.KiteClient.GetUserProfile()
	if err != nil {
		// send error response
		http.Error(w, "Error fetching user profile", http.StatusInternalServerError)
		return
	}

	jsonResp, err := json.Marshal(userProfile)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Get Access Token
func (s *Server) checkLoginHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["access_token"] = s.AccessToken

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Watch Nifty 50 Option
func (s *Server) watchNifty50OptionHandler(w http.ResponseWriter, r *http.Request) {
	// Create new Kite ticker instance
	s.ticker = kiteticker.New(s.ApiKey, s.AccessToken)

	// read instrument token from env
	instToken := os.Getenv("TOKEN")

	// Assign callbacks
	s.ticker.OnError(onError)
	s.ticker.OnClose(onClose)
	s.ticker.OnConnect(onConnect(s, instToken))
	s.ticker.OnReconnect(onReconnect)
	s.ticker.OnNoReconnect(onNoReconnect)
	s.ticker.OnTick(onTick)
	s.ticker.OnOrderUpdate(onOrderUpdate)

	// Spin up a Goroutine to start the Server and Control it with Context Cacelletation
	go func() {
		s.ticker.ServeWithContext(s.ctx)
	}()
}

// Triggered when any error is raised
func onError(err error) {
	fmt.Println("Error: ", err)
}

// Triggered when websocket connection is closed
func onClose(code int, reason string) {
	fmt.Println("Close: ", code, reason)
}

// Triggered when connection is established and ready to send and accept data
func onConnect(s *Server, instToken string) func() {
	return func() {
		fmt.Println("Connected")
		fmt.Println("Subscribing to", instToken)

		into, err := strconv.Atoi(instToken)
		if err != nil {
			fmt.Println("err: ", err)
		}

		err = s.ticker.Subscribe([]uint32{uint32(into)})
		if err != nil {
			fmt.Println("err: ", err)
		}
		// Set subscription mode for given list of tokens
		// Default mode is Quote
		err = s.ticker.SetMode(kiteticker.ModeFull, []uint32{uint32(into)})
		if err != nil {
			fmt.Println("err: ", err)
		}

		fmt.Println("Subscribed to", instToken)
	}
}

// Triggered when tick is recevived
func onTick(tick kitemodels.Tick) {
	// Create Candle from tick
	candle := Candle{
		Timestamp: tick.Timestamp.Time,
		Close:     tick.OHLC.Close,
		Open:      tick.OHLC.Open,
		Low:       tick.OHLC.Low,
		High:      tick.OHLC.High,
		LastPrice: tick.LastPrice,
	}

	candlesData = append(candlesData, candle)

	// Execute Supertrend Pattern
	// Supertrend(candlesData)

	if len(candlesData) > SMA_PERIOD {
		candlesData = candlesData[1:]
	}

	if len(candlesData) == SMA_PERIOD {
		sma := sumCandleData(candlesData) / float64(SMA_PERIOD)
		fmt.Printf("LTP :- %.2f, | SMA :- %.2f\n", tick.LastPrice, sma)

		if tick.LastPrice > sma && positionStatus == "BEAR" {
			positionStatus = "BULL"
			fmt.Printf("BUY at :- %.2f\n", tick.LastPrice)
		}

		if tick.LastPrice < sma && positionStatus == "BULL" {
			positionStatus = "BEAR"
			fmt.Printf("SELL at :- %.2f\n", tick.LastPrice)
		}

		// Set inital status
		if positionStatus == "NONE" {
			if tick.LastPrice > sma {
				positionStatus = "BULL"
			} else {
				positionStatus = "BEAR"
			}
		}

	}
}

// Triggered when reconnection is attempted which is enabled by default
func onReconnect(attempt int, delay time.Duration) {
	fmt.Printf("Reconnect attempt %d in %fs\n", attempt, delay.Seconds())
}

// Triggered when maximum number of reconnect attempt is made and the program is terminated
func onNoReconnect(attempt int) {
	fmt.Printf("Maximum no of reconnect attempt reached: %d", attempt)
}

// Triggered when order update is received
func onOrderUpdate(order kiteconnect.Order) {
	fmt.Printf("Order: %s", order.OrderID)
}
