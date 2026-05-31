package server

import (
	"log"
	"net/http"
)

// Get Portfolio
func (s *Server) profileHandler(w http.ResponseWriter, r *http.Request) {
	userPortfolio, err := s.KiteClient.GetHoldings()
	if err != nil {
		// send error response
		log.Printf("Error fetching user userPortfolio. Err: %v\n", err)
		http.Error(w, "Error fetching user userPortfolio", http.StatusInternalServerError)
		return
	}

	userPositions, err := s.KiteClient.GetPositions()
	if err != nil {
		// send error response
		log.Printf("Error fetching user userPositions. Err: %v\n", err)
		http.Error(w, "Error fetching user userPositions", http.StatusInternalServerError)
		return
	}

	userMargins, err := s.KiteClient.GetUserMargins()
	if err != nil {
		// send error response
		log.Printf("Error fetching user userMargins. Err: %v\n", err)
		http.Error(w, "Error fetching user userMargins", http.StatusInternalServerError)
		return
	}

	userProfile, err := s.KiteClient.GetUserProfile()
	if err != nil {
		// send error response
		log.Printf("Error fetching user GetUserProfile. Err: %v\n", err)
		http.Error(w, "Error fetching user GetUserProfile", http.StatusInternalServerError)
		return
	}

	resp := map[string]any{
		"portfolio": userPortfolio,
		"positions": userPositions,
		"margins":   userMargins,
		"profile":   userProfile,
	}

	SendJSONResp(resp, nil, http.StatusOK, w)
}
