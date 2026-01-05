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
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}
