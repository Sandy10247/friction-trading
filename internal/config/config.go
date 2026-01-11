package config

import (
	"fmt"
	"log"
	"os"

	"github.com/huml-lang/go-huml"
)

// Hold All Env Variable
type Config struct {
	Server struct {
		Port string `huml:"PORT"`
		Env  string `huml:"ENV"`
	} `huml:"server"`

	Database struct {
		Host     string `huml:"HOST"`
		Port     string `huml:"PORT"`
		DB       string `huml:"DB"`
		Username string `huml:"USERNAME"`
		Password string `huml:"PASSWORD"`
		Schema   string `huml:"SCHEMA"`
		SSLMode  string `huml:"SSLMODE"`
	} `huml:"databasee"`

	Kite struct {
		API_KEY    string `huml:"API_KEY"`
		API_SECRET string `huml:"API_SECRET"`
		Token      string `huml:"Token"`
	} `huml:"kite"`
}

// Load Config
func LoadConfig(env string) (*Config, error) {
	if env == "" {
		env = "local"
	}

	// Read File data
	file := fmt.Sprintf("%v.huml", env)
	b, err := os.ReadFile(file)
	if err != nil {
		return nil, fmt.Errorf("Error :- failed to read file")
	}

	var c Config
	err = huml.Unmarshal(b, &c)
	if err != nil {
		log.Fatalf("Failed to umarshall :- %v\n", err)
		return nil, fmt.Errorf("Error :- Failed to umarshall :- %v", err)
	}

	return &c, nil
}
