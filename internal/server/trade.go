// Sperate all Trading Routes
package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	kiteconnect "github.com/zerodha/gokiteconnect/v4"
	kitemodels "github.com/zerodha/gokiteconnect/v4/models"
	kiteticker "github.com/zerodha/gokiteconnect/v4/ticker"

	"friction-trading/internal/database"
	. "friction-trading/internal/utils"
)

var ErrNoRowsFound = errors.New("no rows in result set")

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
			max(Abs(candles[i].High-prevClose), Abs(candles[i].Low-prevClose)))
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

func sumCandleData(candleData []Candle) float64 {
	total := 0.0
	for _, val := range candleData {
		total += val.LastPrice
	}
	return float64(total)
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

// Watch Nifty 50 Option
func (s *Server) watchNifty50OptionHandler(w http.ResponseWriter, r *http.Request) {
	// Create new Kite ticker instance
	s.ticker = kiteticker.New(s.config.Kite.API_KEY, s.AccessToken)

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

// fetch All Instruments and Store them in "instruments" table
func (s *Server) fetchAllInstruments(w http.ResponseWriter, r *http.Request) {
	instruments, err := s.KiteClient.GetInstruments()
	if err != nil {
		http.Error(w, "Error Fetching Instruments", http.StatusBadRequest)
		return
	}

	// Get Instruments Count
	count, err := s.Store.CountInstruments(r.Context())

	// Truncate Existing Table with rows
	if count > 0 {
		if _, err = s.Store.TruncateInstrument(r.Context()); err != nil && ErrNoRowsFound.Error() != err.Error() {
			log.Printf("Error Truncate Instrument :- %v\n", err)
			http.Error(w, "Error Truncate Instrument", http.StatusBadRequest)
			return
		}
	}

	for _, item := range instruments {
		insertInstrumentParam := database.InsertInstrumentParams{
			InstrumentToken: int64(item.InstrumentToken),
			ExchangeToken:   int64(item.ExchangeToken),
			Tradingsymbol:   item.Tradingsymbol,
			Name:            item.Name,
			LastPrice:       item.LastPrice,
			Expiry: pgtype.Timestamp{
				Time:             item.Expiry.Time,
				Valid:            true, // Mark as valid (not NULL)
				InfinityModifier: pgtype.Finite,
			},
			Strike:         item.StrikePrice,
			TickSize:       item.TickSize,
			LotSize:        item.LotSize,
			InstrumentType: item.InstrumentType,
			Segment:        item.Segment,
			Exchange:       item.Exchange,
		}

		_, err := s.Store.InsertInstrument(r.Context(), insertInstrumentParam)
		if err != nil {
			log.Printf("Error InsertInstrument :- %v,\nInstrument :- %#v\n", err, insertInstrumentParam)
			http.Error(w, "Error InsertInstrument to DB", http.StatusBadRequest)
			return
		}
	}

	// Get Instruments Count
	count, err = s.Store.CountInstruments(r.Context())
	if err != nil {
		http.Error(w, "Error CountInstruments Instruments", http.StatusBadRequest)
		return
	}

	// Save Instruments in File
	_, _ = w.Write([]byte(fmt.Sprintf("%v", count)))
}

// Symbol Search API :- v1
func (s *Server) searchSymbol(w http.ResponseWriter, r *http.Request) {
	// Search Pattern
	searchPattern := "%{TERM}%"

	// Extract Search Query Params
	searchText := r.URL.Query().Get("text")

	// construct the Search String
	finalSearchTerm := strings.ReplaceAll(searchPattern, "{TERM}", searchText)

	// Make the DB hit for Results
	results, err := s.Store.SearchSymbol(r.Context(), finalSearchTerm)
	if err != nil {
		log.Printf("Error searchMarket :- %v\n", err)
		http.Error(w, "Error searchMarket ", http.StatusInternalServerError)
		return
	}

	// Send the Response
	resp := map[string][]*database.Instrument{}
	resp["results"] = results

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Printf("error handling JSON marshal. Err: %v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	_, _ = w.Write(jsonResp)
}
