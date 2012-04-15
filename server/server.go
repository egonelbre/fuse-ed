package main

import (
	_ "fmt"
	"net/http"
	"html/template"
)

const (
	ClientDir = "client/"
	ServerDir = "server/"
	StaticDir = "static/"
)

var (
	mainTemplate, _ = template.ParseFiles(ClientDir + "index.html")
	errorTemplate, _ = template.ParseFiles(ServerDir + "error.html")
)

func init() {
	http.HandleFunc("/", errorHandler(handler))
}

func errorHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if e := recover(); e != nil {
				w.WriteHeader(500)
				errorTemplate.Execute(w, e)
			}
		}()
		fn(w, r)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	mainTemplate.Execute(w, nil)
}

