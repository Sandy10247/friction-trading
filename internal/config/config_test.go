package config_test

import (
	"testing"

	"friction-trading/internal/config"
)

func TestLoadConfig(t *testing.T) {
	c, err := config.LoadConfig("test")
	if err != nil {
		t.Error("Load Config Error :- ", err)
	}

	if c == nil {
		t.Error("Config Nil :- ", err)
	}
}
