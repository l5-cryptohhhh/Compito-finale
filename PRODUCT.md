# codeVar — Carriera Arbitrale

register: product

Gioco web (vanilla JS + Three.js, nessun bundler): l'utente è l'arbitro VAR.
Due modalità: Carriera (batti 8 allenatori-boss dirigendo le loro partite:
fase live simulata + episodi VAR su fuorigioco/rigore/rosso) e Classica
(le 10 azioni fuorigioco originali). La verità di ogni episodio è geometrica
e verificabile a schermo, mai hardcoded.

Utente tipo: studente/giocatore casual su desktop o telefono, sessioni brevi,
ambiente qualsiasi. Tema scuro navy + oro già committato (broadcast TV/VAR).

Superfici: auth, mappa allenatori, schermo partita (canvas 3D + HUD + replay
con 3 telecamere selezionabili), risultati. Backend Express opzionale in
`server/` con fallback totale su localStorage.
