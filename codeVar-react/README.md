# ⚽ CodeVAR — AI Football Referee

Progetto finale · Epicode Full Stack AI 2026
Simulatore VAR in **React + Vite**: analizza azioni di gioco in 3D e prendi
decisioni arbitrali corrette.

## Funzionalità

- **Login / Registrazione / Ospite** (autenticazione locale via localStorage)
- **Selezione squadra** — 7 squadre fittizie con stemmi SVG originali e colori dedicati
- **Dashboard** con profilo, livello VAR, statistiche e barra di progresso
- **Partita** da 10 azioni, senza timer
- **Azioni 3D** (Three.js): fuorigioco, rigore, fallo/cartellino, gol
- **Controlli replay**: play, pausa, frame +/-, velocità 0.25x/0.5x/1x, timeline
- **3 telecamere**: Broadcast, Linea VAR, Aerea
- **Punteggio** +10 a decisione corretta, precisione, riepilogo finale
- **Progressione livelli**: Rookie → National → Elite → International → World VAR
- **Classifica** top 100 giocatori (salvata in locale)

## Avvio

Serve Node.js 18+. Dalla cartella `codevar-react/`:

```bash
npm install
npm run dev
```

Apri l'URL mostrato (di solito http://localhost:5173).

## Architettura

```
src/
├── main.jsx                 punto di avvio
├── App.jsx                  router tra le pagine (in base allo stato auth)
├── index.css                stili globali + palette
├── context/
│   └── AuthContext.jsx      login, registrazione, ospite, progressi (localStorage)
├── data/
│   ├── teams.js             squadre fittizie
│   ├── levels.js            progressione livelli VAR
│   └── actionGenerator.js   genera le azioni 3D (verdetto da posizione reale)
├── components/
│   ├── Scene3D.jsx          scena Three.js (campo, stickman, palla, replay)
│   ├── MatchGame.jsx        quiz 10 azioni + controlli replay + decisioni
│   └── TeamCrest.jsx        stemma SVG generato
└── pages/
    ├── Login.jsx
    ├── TeamSelect.jsx
    ├── Dashboard.jsx
    ├── MatchPage.jsx
    └── Leaderboard.jsx
```

## Note tecniche (utili per l'esame)

- **Fuorigioco corretto**: il verdetto NON è casuale. L'attaccante è posizionato
  in modo che all'istante del passaggio (`keyT`) si trovi esattamente nella
  posizione che determina il verdetto, calcolato confrontando la sua X con la
  linea dell'ultimo difensore. Così ciò che vedi e ciò che il gioco valuta
  coincidono sempre.
- **CSS Modules**: ogni componente ha stile isolato (`*.module.css`).
- **Stato globale**: `AuthContext` con Context API, persistenza in localStorage.
- **Squadre fittizie**: nessun logo o marchio ufficiale (evita problemi di copyright).

## Limiti noti / prossimi passi

- Gli stickman sono modelli geometrici semplici (non personaggi realistici).
- La classifica è locale; per renderla globale servirebbe un backend + database.
