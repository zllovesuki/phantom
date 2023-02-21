package specter

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewAssetHandler() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.NoCache)
	r.Get("/specter.log", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, specterLogFile)
	})

	return r
}
