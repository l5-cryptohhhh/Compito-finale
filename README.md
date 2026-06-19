# codeVar ⚽

Gioco quiz sul fuorigioco. L'utente veste i panni del **VAR** (Video Assistant
Referee) e, osservando 10 azioni simulate in 3D, deve decidere se l'attaccante
era in **fuorigioco** o in **posizione regolare** al momento del passaggio.

Progetto finale del corso Epicode.

## Funzionalità

- **Autenticazione** — registrazione / accesso (salvataggio in `localStorage`) o accesso come ospite.
- **10 azioni 3D** tutte diverse, renderizzate con Three.js (campo, stickmen, pallone, linea del fuorigioco).
- **Controlli replay** — play/pausa, avanti/indietro frame per frame, velocità 0.5x.
- **Linea del fuorigioco dinamica** — segue l'ultimo difensore e si congela esattamente al momento del passaggio.
- **Schermata risultati** — punteggio, grado arbitrale, animazione particellare e ripasso delle risposte sbagliate con spiegazione.
- **Responsive** — desktop, tablet (≤768px) e mobile (≤480px).

## Stack

- HTML / CSS / JavaScript vanilla (ES modules)
- [Three.js](https://threejs.org/) r184 per le animazioni 3D
- [Vite](https://vitejs.dev/) come dev server

## Struttura

```
index.html                 # 3 schermate: auth, gioco, risultati
assets/
  css/style.css            # stili + breakpoint responsive
  js/script.js             # logica: auth, scena 3D, scenari, game loop
  js/three.js              # build module Three.js (importa three.core.js)
  js/three.core.js         # core Three.js — necessario accanto a three.js
  img/var-bg.jpg           # sfondo schermata di login
```

## Avvio

Serve un server statico (gli ES module non si caricano da `file://`).

**Con Vite:**

```bash
npm install
npm run dev
```

Poi apri l'URL mostrato (default `http://localhost:5173`).

**In alternativa:** estensione *Live Server* di VS Code → "Go Live".

## Come si gioca

1. Registrati, accedi o entra come ospite.
2. Guarda l'azione. Usa i controlli per rivederla frame per frame o al rallentatore.
3. La linea rossa indica la posizione dell'ultimo difensore al momento del passaggio.
4. Scegli **FUORIGIOCO** o **NON IN FUORIGIOCO**.
5. Dopo 10 azioni ricevi punteggio, grado e il ripasso degli errori.

## Regola del fuorigioco (per chi giudica)

L'attaccante è in fuorigioco se, **nel momento esatto in cui parte il passaggio**,
si trova più vicino alla linea di porta avversaria sia del pallone sia del
penultimo avversario (di norma l'ultimo difensore di campo). Non basta superare
il portiere: servono **almeno due avversari** tra l'attaccante e la porta. In
caso di parità (in linea) il beneficio va all'attaccante.
