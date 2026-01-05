package server

import (
	"encoding/json"
	"log"
	"net/http"
)

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
		log.Printf("error handling JSON marshal. Err: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	_, _ = w.Write(jsonResp)
}

// Get Positions
func (s *Server) positionsHandler(w http.ResponseWriter, r *http.Request) {
	userPositions, err := s.KiteClient.GetPositions()
	if err != nil {
		// send error response
		http.Error(w, "Error fetching user Positions", http.StatusInternalServerError)
		return
	}

	jsonResp, err := json.Marshal(userPositions)
	if err != nil {
		log.Printf("error handling JSON marshal. Err: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	_, _ = w.Write(jsonResp)
}
