package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
)

var (
	mainTemplate = template.Must(template.ParseFiles("index.html"))
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	http.HandleFunc("/", handler)

	static := http.StripPrefix("/static", http.FileServer(http.Dir("static")))
	http.Handle("/static/", static)

	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	if err := mainTemplate.Execute(w, nil); err != nil {
		log.Printf("Error executing template: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}
