package server

import (
	"log"
	"os/exec"
)

func openBrowser(url string) {
	if err := exec.Command("open", url).Start(); err != nil {
		log.Fatal(err)
	}
}
