package utils

import (
	"log"
	"os/exec"
)

func Abs(a float64) float64 {
	if a < 0 {
		return -a
	}
	return a
}

func OpenBrowser(url string) {
	if err := exec.Command("open", url).Start(); err != nil {
		log.Fatal(err)
	}
}
