// ═══════════════════════════════════════════
//  musicAi — server.js
//  Backend proxy verso l'API di Anthropic (Claude)
//  Epicode Full Stack AI 2026
// ═══════════════════════════════════════════

const express = require('express');
const path = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// La API key resta SOLO qui sul server, mai esposta al browser.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json());

// Serve i file statici del frontend (index.html, css, js)
app.use(express.static(path.join(__dirname, '..')));

// ───────────────────────────────────────────
//  ENDPOINT: genera playlist
//  Il frontend chiama POST /api/playlist con { mood }
// ───────────────────────────────────────────
app.post('/api/playlist', async (req, res) => {
  const mood = (req.body.mood || '').trim();

  if (!mood) {
    return res.status(400).json({ error: 'Mood mancante' });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key non configurata sul server' });
  }

  const prompt = `Sei un DJ esperto e curatore musicale. L'utente descrive il suo mood o situazione: "${mood}".

Crea una playlist di 8 brani reali ed esistenti perfetti per questo mood. Varia generi ed epoche in modo coerente con l'atmosfera.

Rispondi SOLO con un oggetto JSON valido, senza testo prima o dopo, senza backtick markdown. Formato esatto:
{
  "name": "nome creativo e accattivante della playlist (max 4 parole)",
  "description": "una frase che cattura l'atmosfera della playlist",
  "tracks": [
    { "title": "titolo brano", "artist": "artista" }
  ]
}`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Errore API Anthropic:', apiRes.status, errText);
      return res.status(502).json({ error: 'Errore dalla API di Anthropic' });
    }

    const data = await apiRes.json();

    // Estrai il testo dalla risposta
    let text = (data.content || [])
      .map(b => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    // Pulisci eventuali backtick markdown
    text = text.replace(/```json|```/g, '').trim();

    let playlist;
    try {
      playlist = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Risposta AI non in formato valido' });
    }

    // Restituisci la playlist al frontend
    res.json({
      name:        playlist.name || 'Playlist senza nome',
      description: playlist.description || '',
      tracks:      Array.isArray(playlist.tracks) ? playlist.tracks : []
    });

  } catch (err) {
    console.error('Errore server:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// ───────────────────────────────────────────
//  AVVIO
// ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🎧 musicAi server attivo su http://localhost:${PORT}\n`);
  if (!ANTHROPIC_API_KEY) {
    console.warn('  ⚠️  ANTHROPIC_API_KEY non trovata: crea il file .env (vedi .env.example)\n');
  }
});