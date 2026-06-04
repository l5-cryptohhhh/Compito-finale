// ═══════════════════════════════════════════
//  musicAi — script.js
//  Mood DJ · Epicode Full Stack AI 2026
// ═══════════════════════════════════════════

const STORAGE_KEY        = 'musicAi_playlists';
const SPOTIFY_CID_KEY    = 'musicAi_spotify_cid';
const SPOTIFY_TOKEN_KEY  = 'musicAi_spotify_token';
const SPOTIFY_PENDING    = 'musicAi_pending_pl';

let currentPlaylist = null;

const QUICK_MOODS = [
  'Concentrazione', 'Malinconia', 'Energia pura',
  'Relax serale', 'Nostalgia anni 90', 'Allenamento',
  'Notte in città', 'Pioggia e caffè', 'Viaggio on the road',
  'Festa tra amici', 'Jazz serale', 'Hip-hop motivazionale'
];

const SURPRISE_MOODS = [
  'euforia da temporale estivo',
  'nostalgia di un viaggio mai fatto',
  'sabato notte in una metropoli al neon',
  'malinconia dolce di domenica pomeriggio',
  'carica adrenalinica prima di una sfida',
  'calma profonda al risveglio in montagna',
  'romanticismo cinematografico sotto la pioggia',
  'concentrazione totale a notte fonda',
  'leggerezza di una giornata senza pensieri',
  'nostalgia anni 80 in una notte d\'estate',
  'energia da primo caffè del mattino',
  'vibes lo-fi per studiare tardi la sera'
];

const COVER_PALETTES = [
  ['#c8102e','#3a0a12'],['#1a1a2e','#c8102e'],['#2c1810','#c8102e'],
  ['#0a0a0a','#5a0a18'],['#1f1f24','#8e0c20'],['#2a0a0a','#e01233'],
  ['#101820','#c8102e'],['#1a0e1a','#a01028'],['#0d1b2a','#c8102e'],
  ['#1a1a0a','#8e7020'],['#0a1a0a','#206820'],['#1a0a1a','#7820a0']
];

const COVER_ICONS = [
  '<svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="9" stroke="white" stroke-width="2"/><circle cx="22" cy="22" r="2" fill="white"/></svg>',
  '<svg viewBox="0 0 44 44" fill="none"><path d="M14 12v20a4 4 0 11-2.5-3.7V16l16-3v15a4 4 0 11-2.5-3.7V10L14 12z" fill="white"/></svg>',
  '<svg viewBox="0 0 44 44" fill="none"><rect x="8" y="16" width="4" height="12" rx="2" fill="white"/><rect x="16" y="10" width="4" height="24" rx="2" fill="white"/><rect x="24" y="14" width="4" height="16" rx="2" fill="white"/><rect x="32" y="18" width="4" height="8" rx="2" fill="white"/></svg>',
  '<svg viewBox="0 0 44 44" fill="none"><path d="M22 8c-6 6-10 9-10 16a10 10 0 1020 0c0-7-4-10-10-16z" fill="white"/></svg>'
];

// ─────────────────────────────────────────────────────────────
//  DATABASE MUSICALE ESTESO
// ─────────────────────────────────────────────────────────────
const MUSIC_DB = {
  rilassante: {
    label: 'Calma & Relax',
    names: ['Onde Lente','Respiro Profondo','Quiete','Soft Focus','Nebbia Serena'],
    desc: 'Suoni morbidi per rallentare e ritrovare la calma.',
    tracks: [
      { title: 'Weightless', artist: 'Marconi Union' },
      { title: 'An Ending (Ascent)', artist: 'Brian Eno' },
      { title: 'Saman', artist: 'Ólafur Arnalds' },
      { title: 'Re:Stacks', artist: 'Bon Iver' },
      { title: 'Avril 14th', artist: 'Aphex Twin' },
      { title: 'Holocene', artist: 'Bon Iver' },
      { title: 'Intro', artist: 'The xx' },
      { title: 'Night Owl', artist: 'Galimatias' },
      { title: 'Saturn', artist: 'Stevie Wonder' },
      { title: 'Bloom', artist: 'The Paper Kites' },
      { title: 'Gymnopédie No.1', artist: 'Erik Satie' },
      { title: 'Motion Picture Soundtrack', artist: 'Radiohead' },
      { title: 'Amsterdam', artist: 'Gregory Alan Isakov' },
      { title: 'Fade Into You', artist: 'Mazzy Star' },
      { title: 'Everything\'s Not Lost', artist: 'Coldplay' }
    ]
  },
  energia: {
    label: 'Carica Totale',
    names: ['Adrenalina','Pieno Regime','Boost','No Limits','Turbo'],
    desc: 'Ritmo alto e spinta per darti la massima energia.',
    tracks: [
      { title: 'Till I Collapse', artist: 'Eminem' },
      { title: 'Stronger', artist: 'Kanye West' },
      { title: 'Power', artist: 'Kanye West' },
      { title: 'Believer', artist: 'Imagine Dragons' },
      { title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis' },
      { title: 'Uprising', artist: 'Muse' },
      { title: 'Seven Nation Army', artist: 'The White Stripes' },
      { title: 'HUMBLE.', artist: 'Kendrick Lamar' },
      { title: 'Lose Yourself', artist: 'Eminem' },
      { title: 'Eye of the Tiger', artist: 'Survivor' },
      { title: 'Thunderstruck', artist: 'AC/DC' },
      { title: 'Jump', artist: 'Van Halen' },
      { title: 'Sabotage', artist: 'Beastie Boys' },
      { title: 'Welcome to the Jungle', artist: 'Guns N\' Roses' },
      { title: 'Run the World (Girls)', artist: 'Beyoncé' }
    ]
  },
  workout: {
    label: 'Gym Mode',
    names: ['Beast Mode','Pump It','Iron & Fire','Sweat Session','Rep by Rep'],
    desc: 'BPM alti e testi motivazionali per allenarti al massimo.',
    tracks: [
      { title: 'Power', artist: 'Kanye West' },
      { title: 'Numb/Encore', artist: 'Jay-Z & Linkin Park' },
      { title: 'Remember the Name', artist: 'Fort Minor' },
      { title: 'Pump It', artist: 'Black Eyed Peas' },
      { title: 'Run the World (Girls)', artist: 'Beyoncé' },
      { title: 'Jump', artist: 'Kriss Kross' },
      { title: 'Started From the Bottom', artist: 'Drake' },
      { title: 'Work B**ch', artist: 'Britney Spears' },
      { title: 'Fighter', artist: 'Christina Aguilera' },
      { title: 'Stronger (What Doesn\'t Kill You)', artist: 'Kelly Clarkson' },
      { title: 'Till I Collapse', artist: 'Eminem' },
      { title: 'Levels', artist: 'Avicii' },
      { title: 'Turn Down for What', artist: 'DJ Snake' },
      { title: 'Centuries', artist: 'Fall Out Boy' },
      { title: 'Hall of Fame', artist: 'The Script ft. Will.i.am' }
    ]
  },
  malinconia: {
    label: 'Cuore Sospeso',
    names: ['Malinconia','Luci Soffuse','Sotto la Pioggia','Ricordi','Mareggiata'],
    desc: 'Brani intensi per i momenti più riflessivi.',
    tracks: [
      { title: 'Skinny Love', artist: 'Bon Iver' },
      { title: 'The Night We Met', artist: 'Lord Huron' },
      { title: 'Liability', artist: 'Lorde' },
      { title: 'Motion Sickness', artist: 'Phoebe Bridgers' },
      { title: 'Fix You', artist: 'Coldplay' },
      { title: 'Exit Music (For a Film)', artist: 'Radiohead' },
      { title: 'Hurt', artist: 'Johnny Cash' },
      { title: 'Nude', artist: 'Radiohead' },
      { title: 'Someone Like You', artist: 'Adele' },
      { title: 'All I Want', artist: 'Kodaline' },
      { title: 'Be Still', artist: 'The Killers' },
      { title: 'When the Party\'s Over', artist: 'Billie Eilish' },
      { title: 'Falling', artist: 'Harry Styles' },
      { title: 'The Death of Peace of Mind', artist: 'Bad Omens' },
      { title: 'Chasing Cars', artist: 'Snow Patrol' }
    ]
  },
  concentrazione: {
    label: 'Deep Focus',
    names: ['Flusso','Mente Lucida','Deep Work','Concentrato','Zero Distrazioni'],
    desc: 'Sottofondi minimali per restare concentrato a lungo.',
    tracks: [
      { title: 'Strobe', artist: 'deadmau5' },
      { title: 'Opus', artist: 'Eric Prydz' },
      { title: 'Teardrop', artist: 'Massive Attack' },
      { title: 'Svefn-g-englar', artist: 'Sigur Rós' },
      { title: 'Open Eye Signal', artist: 'Jon Hopkins' },
      { title: 'Innerbloom', artist: 'RÜFÜS DU SOL' },
      { title: 'Nightcall', artist: 'Kavinsky' },
      { title: 'Experience', artist: 'Ludovico Einaudi' },
      { title: 'Comptine d\'Un Autre Été', artist: 'Yann Tiersen' },
      { title: 'Divenire', artist: 'Ludovico Einaudi' },
      { title: 'Music For Airports 1/1', artist: 'Brian Eno' },
      { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi' },
      { title: 'Rainy Day', artist: 'Ólafur Arnalds' },
      { title: 'Canyon', artist: 'Mike McGregor' },
      { title: 'Lost in Thought', artist: 'Olafur Arnalds' }
    ]
  },
  festa: {
    label: 'Party Mode',
    names: ['Notte al Neon','Pista Libera','Saturday Night','Vibrazioni','Floor Filler'],
    desc: 'Hit ballabili per accendere la serata.',
    tracks: [
      { title: 'One More Time', artist: 'Daft Punk' },
      { title: 'Get Lucky', artist: 'Daft Punk' },
      { title: 'Levels', artist: 'Avicii' },
      { title: 'Don\'t Start Now', artist: 'Dua Lipa' },
      { title: 'Blinding Lights', artist: 'The Weeknd' },
      { title: 'Titanium', artist: 'David Guetta ft. Sia' },
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
      { title: 'I Gotta Feeling', artist: 'Black Eyed Peas' },
      { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake' },
      { title: 'Shake It Off', artist: 'Taylor Swift' },
      { title: 'Sorry', artist: 'Justin Bieber' },
      { title: 'Lean On', artist: 'Major Lazer' },
      { title: 'Happy', artist: 'Pharrell Williams' },
      { title: 'Thinking About You', artist: 'Calvin Harris' },
      { title: 'Turn Down for What', artist: 'DJ Snake ft. Lil Jon' }
    ]
  },
  nostalgia: {
    label: 'Throwback',
    names: ['Macchina del Tempo','Anni d\'Oro','Vecchi Tempi','Retro','Flashback'],
    desc: 'Un tuffo nei brani che hanno segnato un\'epoca.',
    tracks: [
      { title: 'Wonderwall', artist: 'Oasis' },
      { title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
      { title: 'Bitter Sweet Symphony', artist: 'The Verve' },
      { title: 'Karma Police', artist: 'Radiohead' },
      { title: 'Mr. Brightside', artist: 'The Killers' },
      { title: 'Losing My Religion', artist: 'R.E.M.' },
      { title: 'Zombie', artist: 'The Cranberries' },
      { title: 'Creep', artist: 'Radiohead' },
      { title: 'Yellow', artist: 'Coldplay' },
      { title: 'Ironic', artist: 'Alanis Morissette' },
      { title: 'Black Hole Sun', artist: 'Soundgarden' },
      { title: 'Under the Bridge', artist: 'Red Hot Chili Peppers' },
      { title: 'No Scrubs', artist: 'TLC' },
      { title: 'Waterfalls', artist: 'TLC' },
      { title: '...Baby One More Time', artist: 'Britney Spears' }
    ]
  },
  romantico: {
    label: 'Cuore & Anima',
    names: ['Solo Noi Due','Sotto le Stelle','Romanticismo','Battiti','Primo Ballo'],
    desc: 'Atmosfere intime e avvolgenti per momenti speciali.',
    tracks: [
      { title: 'At Last', artist: 'Etta James' },
      { title: 'Lover', artist: 'Taylor Swift' },
      { title: 'Adorn', artist: 'Miguel' },
      { title: 'Best Part', artist: 'Daniel Caesar ft. H.E.R.' },
      { title: 'Make You Feel My Love', artist: 'Adele' },
      { title: 'Thinking Out Loud', artist: 'Ed Sheeran' },
      { title: 'La Vie En Rose', artist: 'Édith Piaf' },
      { title: 'All of Me', artist: 'John Legend' },
      { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley' },
      { title: 'A Thousand Years', artist: 'Christina Perri' },
      { title: 'Perfect', artist: 'Ed Sheeran' },
      { title: 'Kiss Me', artist: 'Ed Sheeran' },
      { title: 'You Are the Best Thing', artist: 'Ray LaMontagne' },
      { title: 'Speechless', artist: 'Dan + Shay' },
      { title: 'Sunday Morning', artist: 'Maroon 5' }
    ]
  },
  jazz: {
    label: 'Jazz & Soul',
    names: ['Blue Note','Fumo e Jazz','Late Night Club','Smooth Session','After Hours'],
    desc: 'Standard jazz e soul per serate eleganti e atmosfere raffinate.',
    tracks: [
      { title: 'So What', artist: 'Miles Davis' },
      { title: 'Take Five', artist: 'Dave Brubeck Quartet' },
      { title: 'Fly Me to the Moon', artist: 'Frank Sinatra' },
      { title: 'My Favorite Things', artist: 'John Coltrane' },
      { title: 'Round Midnight', artist: 'Thelonious Monk' },
      { title: 'Autumn Leaves', artist: 'Bill Evans Trio' },
      { title: 'Feeling Good', artist: 'Nina Simone' },
      { title: 'Summertime', artist: 'Ella Fitzgerald' },
      { title: 'What a Wonderful World', artist: 'Louis Armstrong' },
      { title: 'Girl from Ipanema', artist: 'Stan Getz & João Gilberto' },
      { title: 'Blue in Green', artist: 'Miles Davis' },
      { title: 'Come Away with Me', artist: 'Norah Jones' },
      { title: 'Don\'t Know Why', artist: 'Norah Jones' },
      { title: 'On the Sunny Side of the Street', artist: 'Billie Holiday' },
      { title: 'Nature Boy', artist: 'Nat King Cole' }
    ]
  },
  hip_hop: {
    label: 'Hip-Hop',
    names: ['Street Vibes','Mic Drop','Flow Pesante','Bar for Bar','Concrete Jungle'],
    desc: 'Rap e hip-hop con flow intenso e liriche che colpiscono.',
    tracks: [
      { title: 'HUMBLE.', artist: 'Kendrick Lamar' },
      { title: 'God\'s Plan', artist: 'Drake' },
      { title: 'All Eyes on Me', artist: '2Pac' },
      { title: 'Juicy', artist: 'The Notorious B.I.G.' },
      { title: 'New York State of Mind', artist: 'Nas' },
      { title: 'C.R.E.A.M.', artist: 'Wu-Tang Clan' },
      { title: 'Good Kid', artist: 'Kendrick Lamar' },
      { title: 'Hotline Bling', artist: 'Drake' },
      { title: 'Alright', artist: 'Kendrick Lamar' },
      { title: 'The Message', artist: 'Grandmaster Flash' },
      { title: 'Lose Yourself', artist: 'Eminem' },
      { title: 'Run the City', artist: 'J. Cole' },
      { title: 'Power', artist: 'Kanye West' },
      { title: 'Mo Money Mo Problems', artist: 'The Notorious B.I.G.' },
      { title: 'Rap God', artist: 'Eminem' }
    ]
  },
  rock: {
    label: 'Rock',
    names: ['Volume al Massimo','Distorsione Pura','Headbanger','Classic Rock','Riff Eterni'],
    desc: 'Rock duro e alternative per chi ha bisogno di chitarre e adrenalina.',
    tracks: [
      { title: 'Bohemian Rhapsody', artist: 'Queen' },
      { title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
      { title: 'Hotel California', artist: 'Eagles' },
      { title: 'Comfortably Numb', artist: 'Pink Floyd' },
      { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses' },
      { title: 'Enter Sandman', artist: 'Metallica' },
      { title: 'Back in Black', artist: 'AC/DC' },
      { title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
      { title: 'Paranoid Android', artist: 'Radiohead' },
      { title: 'Under the Bridge', artist: 'Red Hot Chili Peppers' },
      { title: 'Black', artist: 'Pearl Jam' },
      { title: 'Tonight, Tonight', artist: 'The Smashing Pumpkins' },
      { title: 'Learning to Fly', artist: 'Pink Floyd' },
      { title: 'Everlong', artist: 'Foo Fighters' },
      { title: 'All Along the Watchtower', artist: 'Jimi Hendrix' }
    ]
  },
  indie: {
    label: 'Indie & Folk',
    names: ['Città in Bici','Camera da Letto','Indie Feelings','Folk Morbido','Sunday Afternoon'],
    desc: 'Indie pop, folk e alternative per chi ama la musica autentica.',
    tracks: [
      { title: 'Electric Feel', artist: 'MGMT' },
      { title: 'Dog Days Are Over', artist: 'Florence + the Machine' },
      { title: 'Little Lion Man', artist: 'Mumford & Sons' },
      { title: 'Ho Hey', artist: 'The Lumineers' },
      { title: 'Home', artist: 'Edward Sharpe & the Magnetic Zeros' },
      { title: 'Budapest', artist: 'George Ezra' },
      { title: 'Stubborn Love', artist: 'The Lumineers' },
      { title: 'I Will Wait', artist: 'Mumford & Sons' },
      { title: 'In My Daughter\'s Eyes', artist: 'Martina McBride' },
      { title: 'Shake It Out', artist: 'Florence + the Machine' },
      { title: 'Renegades', artist: 'X Ambassadors' },
      { title: 'Something Good Can Work', artist: 'Two Door Cinema Club' },
      { title: 'Feel It Still', artist: 'Portugal. The Man' },
      { title: 'Ophelia', artist: 'The Lumineers' },
      { title: 'Pompeii', artist: 'Bastille' }
    ]
  },
  electronic: {
    label: 'Electronic',
    names: ['404 Not Found','Neon Matrix','Digital Pulse','Techno Dreams','Warehouse'],
    desc: 'Elettronica e techno per chi vuole vibrare a frequenze alte.',
    tracks: [
      { title: 'Around the World', artist: 'Daft Punk' },
      { title: 'Sandstorm', artist: 'Darude' },
      { title: 'Blue (Da Ba Dee)', artist: 'Eiffel 65' },
      { title: 'Insomnia', artist: 'Faithless' },
      { title: 'Kernkraft 400', artist: 'Zombie Nation' },
      { title: 'Children', artist: 'Robert Miles' },
      { title: 'Better Off Alone', artist: 'Alice Deejay' },
      { title: 'Nightcall', artist: 'Kavinsky' },
      { title: 'Save the World', artist: 'Swedish House Mafia' },
      { title: 'What Is Love', artist: 'Haddaway' },
      { title: 'Clarity', artist: 'Zedd ft. Foxes' },
      { title: 'Show Me Love', artist: 'Robin S' },
      { title: 'Seek Bromance', artist: 'Avicii' },
      { title: 'Don\'t You Worry Child', artist: 'Swedish House Mafia' },
      { title: 'Beautiful Now', artist: 'Zedd ft. Jon Bellion' }
    ]
  },
  classica: {
    label: 'Musica Classica',
    names: ['Adagio','Al Concerto','Note Senza Tempo','Gran Sala','Silenzio e Suono'],
    desc: 'Grandi compositori senza tempo per momenti di pura bellezza.',
    tracks: [
      { title: 'Clair de Lune', artist: 'Claude Debussy' },
      { title: 'Moonlight Sonata', artist: 'Ludwig van Beethoven' },
      { title: 'The Four Seasons - Spring', artist: 'Antonio Vivaldi' },
      { title: 'Für Elise', artist: 'Ludwig van Beethoven' },
      { title: 'Canon in D', artist: 'Johann Pachelbel' },
      { title: 'Symphony No. 9 - Ode to Joy', artist: 'Ludwig van Beethoven' },
      { title: 'Requiem - Lacrimosa', artist: 'Wolfgang Amadeus Mozart' },
      { title: 'Ride of the Valkyries', artist: 'Richard Wagner' },
      { title: 'Air on the G String', artist: 'Johann Sebastian Bach' },
      { title: 'Ave Maria', artist: 'Franz Schubert' },
      { title: 'Nocturne Op. 9 No. 2', artist: 'Frédéric Chopin' },
      { title: 'Rhapsody in Blue', artist: 'George Gershwin' },
      { title: 'Gymnopédie No.1', artist: 'Erik Satie' },
      { title: 'Bolero', artist: 'Maurice Ravel' },
      { title: 'The Swan', artist: 'Camille Saint-Saëns' }
    ]
  },
  mattina: {
    label: 'Buongiorno',
    names: ['Alba Nuova','Primo Caffè','Morning Glow','Sveglia Dolce','Inizio Perfetto'],
    desc: 'Suoni luminosi e positivi per partire bene con la giornata.',
    tracks: [
      { title: 'Here Comes the Sun', artist: 'The Beatles' },
      { title: 'Good as Hell', artist: 'Lizzo' },
      { title: 'Walking on Sunshine', artist: 'Katrina and the Waves' },
      { title: 'Morning', artist: 'Ólafur Arnalds' },
      { title: 'Golden Hour', artist: 'JVKE' },
      { title: 'Lovely Day', artist: 'Bill Withers' },
      { title: 'Don\'t Stop Me Now', artist: 'Queen' },
      { title: 'Happy', artist: 'Pharrell Williams' },
      { title: 'Shake It Off', artist: 'Taylor Swift' },
      { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake' },
      { title: 'Stir It Up', artist: 'Bob Marley' },
      { title: 'Good Morning', artist: 'Kanye West' },
      { title: 'Rise Up', artist: 'Andra Day' },
      { title: 'Best Day of My Life', artist: 'American Authors' },
      { title: 'I\'m Yours', artist: 'Jason Mraz' }
    ]
  },
  notte: {
    label: 'Notte Fonda',
    names: ['3:00 AM','Luci Spente','After Midnight','Notte Profonda','Insonnia'],
    desc: 'Atmosfere notturne per chi è sveglio quando tutti dormono.',
    tracks: [
      { title: 'Night Owl', artist: 'Galimatias' },
      { title: 'Nightcall', artist: 'Kavinsky' },
      { title: 'After Dark', artist: 'Mr.Kitty' },
      { title: 'Drive', artist: 'Incubus' },
      { title: 'Midnight City', artist: 'M83' },
      { title: 'Midnight Rain', artist: 'Taylor Swift' },
      { title: 'Lights', artist: 'Ellie Goulding' },
      { title: 'Night Changes', artist: 'One Direction' },
      { title: 'The Night We Met', artist: 'Lord Huron' },
      { title: 'Cigarettes After Sex', artist: 'Cigarettes After Sex' },
      { title: 'Slow Dancing in the Dark', artist: 'Joji' },
      { title: 'Demons', artist: 'Imagine Dragons' },
      { title: 'Stay', artist: 'Rihanna ft. Mikky Ekko' },
      { title: 'In the Wee Small Hours of the Morning', artist: 'Frank Sinatra' },
      { title: 'Lost in Japan', artist: 'Shawn Mendes' }
    ]
  },
  viaggio: {
    label: 'On the Road',
    names: ['Strada Aperta','Autostrada','Road Trip','Chilometri','Orizzonte Lontano'],
    desc: 'Compagni perfetti per ogni chilometro percorso.',
    tracks: [
      { title: 'Life is a Highway', artist: 'Tom Cochrane' },
      { title: 'Born to Run', artist: 'Bruce Springsteen' },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey' },
      { title: 'Take It Easy', artist: 'Eagles' },
      { title: 'Fast Car', artist: 'Tracy Chapman' },
      { title: 'Mr. Blue Sky', artist: 'Electric Light Orchestra' },
      { title: 'Africa', artist: 'Toto' },
      { title: 'Free Fallin\'', artist: 'Tom Petty' },
      { title: 'The Road Goes Ever On', artist: 'Billy Boyd' },
      { title: 'Highway to Hell', artist: 'AC/DC' },
      { title: 'Go Your Own Way', artist: 'Fleetwood Mac' },
      { title: 'Come Away with Me', artist: 'Norah Jones' },
      { title: 'Ride', artist: 'Twenty One Pilots' },
      { title: 'Midnight Rider', artist: 'The Allman Brothers Band' },
      { title: 'Country Roads', artist: 'John Denver' }
    ]
  },
  estate: {
    label: 'Summer Vibes',
    names: ['Mare Azzurro','Estate Eterna','Sole e Sale','Spiaggia','Golden Summer'],
    desc: 'Calore, sole e ritmi estivi per sentirsi sempre in vacanza.',
    tracks: [
      { title: 'Cruel Summer', artist: 'Taylor Swift' },
      { title: 'In the Summertime', artist: 'Mungo Jerry' },
      { title: 'Summerboy', artist: 'Lady Gaga' },
      { title: 'Summer Nights', artist: 'John Travolta & Olivia Newton-John' },
      { title: 'Blister in the Sun', artist: 'Violent Femmes' },
      { title: 'Boys of Summer', artist: 'Don Henley' },
      { title: 'Summer of \'69', artist: 'Bryan Adams' },
      { title: 'All Summer Long', artist: 'Kid Rock' },
      { title: 'California Gurls', artist: 'Katy Perry ft. Snoop Dogg' },
      { title: 'Surfin\' USA', artist: 'The Beach Boys' },
      { title: 'Good Vibrations', artist: 'The Beach Boys' },
      { title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee' },
      { title: 'Con Calma', artist: 'Daddy Yankee & Snow' },
      { title: 'La Bamba', artist: 'Ritchie Valens' },
      { title: 'Island in the Sun', artist: 'Weezer' }
    ]
  },
  italiana: {
    label: 'Musica Italiana',
    names: ['Bel Paese','Cantautorato','Classici Italiani','Italia in Musica','Chitarra e Sole'],
    desc: 'Il meglio della musica italiana, dai grandi cantautori alle hit moderne.',
    tracks: [
      { title: 'Azzurro', artist: 'Adriano Celentano' },
      { title: 'Il Pescatore', artist: 'Fabrizio De André' },
      { title: 'La Donna Cannone', artist: 'Francesco De Gregori' },
      { title: 'Almeno tu nell\'Universo', artist: 'Mia Martini' },
      { title: 'Con te partirò', artist: 'Andrea Bocelli' },
      { title: 'Generale', artist: 'Francesco De Gregori' },
      { title: 'Volare', artist: 'Domenico Modugno' },
      { title: 'Caruso', artist: 'Lucio Dalla' },
      { title: 'Zucchero', artist: 'Zucchero' },
      { title: 'Ancora qui', artist: 'Elisa' },
      { title: 'La notte', artist: 'Arisa' },
      { title: 'Rolls Royce', artist: 'Achille Lauro' },
      { title: 'Solitudine', artist: 'Laura Pausini' },
      { title: 'Ci vuole un fiore', artist: 'Sergio Endrigo' },
      { title: 'Grande grande grande', artist: 'Mina' }
    ]
  },
  lofi: {
    label: 'Lo-Fi Study',
    names: ['Lo-Fi Beats','Study with Rain','Chill Hop','Campus Vibes','Notebook & Coffee'],
    desc: 'Beats lo-fi e atmosfere morbide per studiare senza distrazioni.',
    tracks: [
      { title: 'Lofi Hip Hop Radio', artist: 'ChilledCow' },
      { title: 'Snowman', artist: 'Sia' },
      { title: 'Coffee Shop', artist: 'Beabadoobee' },
      { title: 'Cozy', artist: 'Tomppabeats' },
      { title: 'Chill Lofi Beat', artist: 'Lo-Fi Harry' },
      { title: 'Daydream', artist: 'Joji' },
      { title: 'Aesthetic', artist: 'Xilo' },
      { title: 'Stardew Valley Main Theme', artist: 'ConcernedApe' },
      { title: 'Slow Motion', artist: 'Daniel Caesar' },
      { title: 'Soft Spoken', artist: 'Boy Pablo' },
      { title: 'Bloom', artist: 'The Paper Kites' },
      { title: 'Here', artist: 'Alessia Cara' },
      { title: 'Lost in the Light', artist: 'Bahamas' },
      { title: 'Latch (Acoustic)', artist: 'Sam Smith' },
      { title: 'Waves', artist: 'Mr. Probz' }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
//  RILEVAMENTO MOOD AVANZATO
// ─────────────────────────────────────────────────────────────
const KEYWORD_MAP = [
  { cat: 'lofi',           keys: ['lofi','lo-fi','lo fi','studio','studiare','esame','esami','lezione','campus','library','biblioteca','chill hop','beat'] },
  { cat: 'rilassante',     keys: ['rilass','calm','relax','stacc','tranquill','pace','dorm','serale','chill','pioggia','caffè','legger','riposo','spa','meditaz','respir','yoga','zen','quiete','lento','morbid'] },
  { cat: 'workout',        keys: ['gym','palestra','allena','corsa','correre','fitness','crossfit','squat','pesi','cardio','hiit','sport','run','sweat'] },
  { cat: 'energia',        keys: ['energ','caric','sfida','motivaz','adrenalina','forza','euforia','potenza','grinta','boost','hype','fuoco','determinaz'] },
  { cat: 'malinconia',     keys: ['malinc','trist','pesant','giù','pensier','rifless','solitud','cuore spezzato','abbandono','perdita','nostalg pain','depresso','pianto','lacrime','addio','lutto'] },
  { cat: 'concentrazione', keys: ['concentr','focus','lavor','notte fonda','produttiv','flusso','codice','programm','scrivere','lavoro','ufficio','deepwork','flow state'] },
  { cat: 'festa',          keys: ['festa','party','ball','serata','sabato','discot','neon','amici','divert','celebraz','compleanno','ballo','club','after'] },
  { cat: 'nostalgia',      keys: ['nostalg','ann','90','80','70','vecch','ricord','epoca','passato','retro','infanzia','gioventù','tempi andati','flashback'] },
  { cat: 'romantico',      keys: ['amor','romant','innamor','cuore','lei','lui','cena','stelle','tenerezza','coccol','fidanzat','valentin','coppia','matrimonio','primo appuntamento'] },
  { cat: 'jazz',           keys: ['jazz','soul','blues','swing','bossa','sax','tromba','club','fumo','cocktail','eleganza','lounge','bebop','hammond','crooner'] },
  { cat: 'hip_hop',        keys: ['rap','hip hop','hip-hop','trap','flow','rime','barre','beat','freestyle','mic','street','urban','drill','grime'] },
  { cat: 'rock',           keys: ['rock','metal','chitarra','riff','headbang','punk','grunge','hard','alternative','alt rock','classic rock','banda','distorsione'] },
  { cat: 'indie',          keys: ['indie','folk','acustic','cantautore','alternativ','bedroom pop','shoegaze','art pop','lo-fi rock','singer-songwriter'] },
  { cat: 'electronic',     keys: ['electronic','techno','rave','edm','house','trance','dj','synth','elektro','club electronic','warehouse','festival','bpm'] },
  { cat: 'classica',       keys: ['classi','orchestra','sinfoni','opera','pianista','violino','cello','bach','beethoven','mozart','chopin','debussy','vivaldi'] },
  { cat: 'mattina',        keys: ['mattina','mattino','colazione','sveglia','alba','aurora','inizio','primo','buongiorno','giornata inizia','positiv','fresc','energiz morning'] },
  { cat: 'notte',          keys: ['notte','midnight','nottata','insonnia','buio','stelle','luna','dopo mezzanotte','3am','4am','late night','notturno'] },
  { cat: 'viaggio',        keys: ['viaggio','road trip','macchina','auto','guidare','autostrada','km','destinazione','partire','fuga','avventura','esplorare','treno','aereo'] },
  { cat: 'estate',         keys: ['estate','spiaggia','mare','sole','caldo','vacanza','bikini','ombrellone','abbronzatura','estate','tropical','summer','piscina'] },
  { cat: 'italiana',       keys: ['italian','italia','sanremo','cantautori','de andrè','battisti','celentano','dalla','vasco','morricone','bocelli','pausini','italiano'] }
];

function detectCategory(mood) {
  const m = mood.toLowerCase();
  const scores = {};
  for (const entry of KEYWORD_MAP) {
    scores[entry.cat] = 0;
    for (const k of entry.keys) if (m.includes(k)) scores[entry.cat]++;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : 'rilassante';
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function localGenerate(mood) {
  const cat = detectCategory(mood);
  const db = MUSIC_DB[cat];
  const name = db.names[Math.floor(Math.random() * db.names.length)];
  return {
    id: Date.now(),
    mood,
    name,
    description: db.desc,
    tracks: shuffle(db.tracks).slice(0, 10),
    createdAt: new Date().toISOString()
  };
}

// ─────────────────────────────────────────────────────────────
//  STORAGE
// ─────────────────────────────────────────────────────────────
function loadPlaylists() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function savePlaylists(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  updateNavCount();
}
function updateNavCount() {
  document.getElementById('nav-count').textContent = loadPlaylists().length;
}

// ─────────────────────────────────────────────────────────────
//  COPERTINE
// ─────────────────────────────────────────────────────────────
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function coverStyleFor(seed) {
  const palette = COVER_PALETTES[seed % COVER_PALETTES.length];
  const icon    = COVER_ICONS[seed % COVER_ICONS.length];
  return { grad: `linear-gradient(135deg, ${palette[1]} 0%, ${palette[0]} 100%)`, icon };
}

// ─────────────────────────────────────────────────────────────
//  NAVIGAZIONE
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    if (view === 'library') renderLibrary();
  });
});

function goToCreate() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-view="create"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-create').classList.add('active');
}

// ─────────────────────────────────────────────────────────────
//  SIDEBAR MOOD RAPIDI
// ─────────────────────────────────────────────────────────────
function renderQuickMoods() {
  const wrap = document.getElementById('quick-moods');
  wrap.innerHTML = '';
  QUICK_MOODS.forEach(m => {
    const el = document.createElement('button');
    el.className = 'quick-mood';
    el.textContent = m;
    el.addEventListener('click', () => {
      goToCreate();
      document.getElementById('mood-input').value = m;
      autoResize(document.getElementById('mood-input'));
      generatePlaylist();
    });
    wrap.appendChild(el);
  });
}

// ─────────────────────────────────────────────────────────────
//  INPUT
// ─────────────────────────────────────────────────────────────
const moodInput = document.getElementById('mood-input');
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}
moodInput.addEventListener('input', () => autoResize(moodInput));
moodInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generatePlaylist(); }
});
document.getElementById('generate-btn').addEventListener('click', generatePlaylist);
document.getElementById('surprise-btn').addEventListener('click', () => {
  const mood = SURPRISE_MOODS[Math.floor(Math.random() * SURPRISE_MOODS.length)];
  moodInput.value = mood;
  autoResize(moodInput);
  generatePlaylist();
});

// ─────────────────────────────────────────────────────────────
//  GENERAZIONE PLAYLIST
// ─────────────────────────────────────────────────────────────
async function generatePlaylist() {
  const mood = moodInput.value.trim();
  if (!mood) { showToast('Scrivi prima un mood'); moodInput.focus(); return; }

  document.getElementById('output-empty').style.display = 'none';
  document.getElementById('playlist-result').classList.remove('show');
  document.getElementById('output-loading').style.display = 'flex';
  document.getElementById('generate-btn').disabled = true;
  cycleLoadingText();

  try {
    const res = await fetch('/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood })
    });
    if (!res.ok) throw new Error('Backend non disponibile');
    const parsed = await res.json();
    currentPlaylist = {
      id: Date.now(),
      mood,
      name: parsed.name || 'Playlist senza nome',
      description: parsed.description || '',
      tracks: Array.isArray(parsed.tracks) && parsed.tracks.length ? parsed.tracks : localGenerate(mood).tracks,
      createdAt: new Date().toISOString()
    };
    clearInterval(loadingTimer);
    renderResult(currentPlaylist, false);
  } catch {
    currentPlaylist = localGenerate(mood);
    clearInterval(loadingTimer);
    renderResult(currentPlaylist, false);
  } finally {
    document.getElementById('output-loading').style.display = 'none';
    document.getElementById('generate-btn').disabled = false;
  }
}

let loadingTimer = null;
function cycleLoadingText() {
  const texts = ['L\'AI sta selezionando i brani…','Analizzo il tuo mood…','Curo l\'atmosfera giusta…','Quasi pronto…'];
  let i = 0;
  const el = document.getElementById('loading-text');
  el.textContent = texts[0];
  clearInterval(loadingTimer);
  loadingTimer = setInterval(() => { i = (i + 1) % texts.length; el.textContent = texts[i]; }, 1400);
}

// ─────────────────────────────────────────────────────────────
//  RENDER RISULTATO
// ─────────────────────────────────────────────────────────────
function renderResult(pl, isSaved) {
  const seed = hashString(pl.name + pl.mood);
  const { grad, icon } = coverStyleFor(seed);

  const tracksHtml = pl.tracks.map((t, i) => {
    const q = encodeURIComponent(`${t.title} ${t.artist}`);
    return `
      <div class="track" data-idx="${i}">
        <div class="track-idx">
          <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="track-play"><svg viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor"/></svg></span>
        </div>
        <div class="track-info">
          <div class="track-title">${escapeHtml(t.title)}</div>
          <div class="track-artist">${escapeHtml(t.artist)}</div>
        </div>
        <a class="track-link spotify" href="https://open.spotify.com/search/${q}" target="_blank" rel="noopener" title="Cerca su Spotify">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.496 17.278a.747.747 0 01-1.028.25c-2.815-1.719-6.357-2.108-10.529-1.155a.747.747 0 11-.333-1.456c4.563-1.043 8.477-.594 11.64 1.334a.747.747 0 01.25 1.027zm1.466-3.26a.934.934 0 01-1.286.307c-3.223-1.98-8.136-2.554-11.95-1.398a.934.934 0 01-1.144-.623.934.934 0 01.624-1.143c4.356-1.322 9.77-.681 13.449 1.593a.934.934 0 01.307 1.264zm.127-3.394c-3.868-2.297-10.249-2.509-13.94-1.388a1.12 1.12 0 01-.69-2.138c4.242-1.368 11.293-1.104 15.748 1.607a1.12 1.12 0 01-1.118 1.919z"/></svg>
        </a>
        <a class="track-link apple" href="https://music.apple.com/search?term=${q}" target="_blank" rel="noopener" title="Cerca su Apple Music">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208A6.15 6.15 0 00.05 5.08c-.02.27-.028.54-.028.81v12.226c.006.27.016.54.036.81a6.6 6.6 0 00.706 2.507c.547 1.174 1.458 2.01 2.64 2.53.77.34 1.58.5 2.42.55.15.01.3.02.45.02h12.248c.15 0 .3-.01.45-.02.84-.05 1.65-.21 2.42-.55 1.182-.52 2.093-1.356 2.64-2.53a6.6 6.6 0 00.706-2.507c.02-.27.03-.54.036-.81V6.81c0-.23-.007-.46-.016-.686zM12 18.655c-.515 0-.932-.417-.932-.932V9.813c0-.515.417-.932.932-.932s.932.417.932.932v7.91c0 .515-.417.932-.932.932zm-3.11-2.624c-.515 0-.932-.417-.932-.932V11.97c0-.515.417-.932.932-.932s.932.417.932.932v3.13c0 .515-.417.932-.932.932zm6.22 0c-.515 0-.932-.417-.932-.932V11.97c0-.515.417-.932.932-.932s.932.417.932.932v3.13c0 .515-.417.932-.932.932z"/></svg>
        </a>
        <button class="track-remove" data-remove="${i}" title="Rimuovi brano">
          <svg viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>`;
  }).join('');

  const savedClass = isSaved ? 'saved' : '';
  const saveLabel  = isSaved ? 'Salvata' : 'Salva';
  const saveIcon   = isSaved
    ? '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 16 16" fill="none"><path d="M4 3h8v11l-4-2.5L4 14V3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  const result = document.getElementById('playlist-result');
  result.innerHTML = `
    <div class="pl-card">
      <div class="pl-header">
        <div class="pl-cover" style="background:${grad}">
          <div class="pl-cover-noise"></div>
          <div class="pl-cover-icon">${icon}</div>
        </div>
        <div class="pl-meta">
          <div class="pl-kicker">// PLAYLIST GENERATA</div>
          <div class="pl-name">${escapeHtml(pl.name)}</div>
          <div class="pl-desc">${escapeHtml(pl.description)}</div>
          <div class="pl-mood-tag">🎯 ${escapeHtml(pl.mood)}</div>
        </div>
      </div>
      <div class="pl-tracks" id="pl-tracks">${tracksHtml}</div>

      <!-- Aggiungi brano -->
      <div class="add-track-bar">
        <button class="add-track-btn" id="add-track-btn">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Aggiungi brano
        </button>
        <div class="add-track-form" id="add-track-form">
          <input id="add-title"  class="add-input" type="text" placeholder="Titolo brano" autocomplete="off"/>
          <input id="add-artist" class="add-input" type="text" placeholder="Artista" autocomplete="off"/>
          <button class="add-confirm" id="add-confirm">Aggiungi</button>
          <button class="add-cancel"  id="add-cancel">Annulla</button>
        </div>
      </div>

      <div class="pl-footer">
        <button class="pl-action primary ${savedClass}" id="save-btn">
          ${saveIcon} <span>${saveLabel}</span>
        </button>
        <button class="pl-action spotify-export" id="spotify-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.496 17.278a.747.747 0 01-1.028.25c-2.815-1.719-6.357-2.108-10.529-1.155a.747.747 0 11-.333-1.456c4.563-1.043 8.477-.594 11.64 1.334a.747.747 0 01.25 1.027zm1.466-3.26a.934.934 0 01-1.286.307c-3.223-1.98-8.136-2.554-11.95-1.398a.934.934 0 01-1.144-.623.934.934 0 01.624-1.143c4.356-1.322 9.77-.681 13.449 1.593a.934.934 0 01.307 1.264zm.127-3.394c-3.868-2.297-10.249-2.509-13.94-1.388a1.12 1.12 0 01-.69-2.138c4.242-1.368 11.293-1.104 15.748 1.607a1.12 1.12 0 01-1.118 1.919z"/></svg>
          Salva su Spotify
        </button>
        <button class="pl-action apple-export" id="apple-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
          Apple Music
        </button>
        <button class="pl-action" id="regen-btn">
          <svg viewBox="0 0 16 16" fill="none"><path d="M13 8a5 5 0 11-1.5-3.5M13 3v2h-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Rigenera
        </button>
        <button class="pl-action" id="share-btn">
          <svg viewBox="0 0 16 16" fill="none"><path d="M11 5a2 2 0 100-2 2 2 0 000 2zM5 10a2 2 0 100-2 2 2 0 000 2zM11 15a2 2 0 100-2 2 2 0 000 2zM6.7 9l2.6 1.5M9.3 4.5L6.7 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Condividi
        </button>
      </div>
    </div>`;

  result.classList.add('show');
  document.getElementById('output-empty').style.display = 'none';

  // ── Rimuovi brano ──
  result.querySelectorAll('.track-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.remove);
      currentPlaylist.tracks.splice(idx, 1);
      renderResult(currentPlaylist, isSaved);
    });
  });

  // ── Aggiungi brano ──
  const addBtn    = document.getElementById('add-track-btn');
  const addForm   = document.getElementById('add-track-form');
  const addConfirm = document.getElementById('add-confirm');
  const addCancel  = document.getElementById('add-cancel');

  addBtn.addEventListener('click', () => {
    addForm.classList.add('open');
    addBtn.style.display = 'none';
    document.getElementById('add-title').focus();
  });
  addCancel.addEventListener('click', () => {
    addForm.classList.remove('open');
    addBtn.style.display = '';
    document.getElementById('add-title').value = '';
    document.getElementById('add-artist').value = '';
  });
  addConfirm.addEventListener('click', () => {
    const title  = document.getElementById('add-title').value.trim();
    const artist = document.getElementById('add-artist').value.trim();
    if (!title || !artist) { showToast('Inserisci titolo e artista'); return; }
    currentPlaylist.tracks.push({ title, artist });
    renderResult(currentPlaylist, isSaved);
  });
  document.getElementById('add-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('add-artist').focus();
  });
  document.getElementById('add-artist').addEventListener('keydown', e => {
    if (e.key === 'Enter') addConfirm.click();
  });

  // ── Salva in libreria ──
  const saveBtn = document.getElementById('save-btn');
  if (!isSaved) {
    saveBtn.addEventListener('click', () => savePlaylist(currentPlaylist, saveBtn));
  }

  // ── Spotify ──
  document.getElementById('spotify-btn').addEventListener('click', () => exportToSpotify(currentPlaylist));

  // ── Apple Music ──
  document.getElementById('apple-btn').addEventListener('click', () => exportToAppleMusic(currentPlaylist));

  // ── Rigenera ──
  document.getElementById('regen-btn').addEventListener('click', () => {
    moodInput.value = pl.mood;
    generatePlaylist();
  });

  // ── Condividi ──
  document.getElementById('share-btn').addEventListener('click', () => sharePlaylist(pl));
}

// ─────────────────────────────────────────────────────────────
//  SALVA / CONDIVIDI
// ─────────────────────────────────────────────────────────────
function savePlaylist(pl, btn) {
  const list = loadPlaylists();
  if (list.some(p => p.id === pl.id)) { showToast('Playlist già salvata'); return; }
  list.unshift(pl);
  savePlaylists(list);
  btn.classList.add('saved');
  btn.querySelector('span').textContent = 'Salvata';
  btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>Salvata</span>';
  showToast('Salvata nella tua libreria');
}

function sharePlaylist(pl) {
  const text = [
    `🎧 ${pl.name} — by musicAi`, pl.description, '',
    ...pl.tracks.map((t, i) => `${i + 1}. ${t.title} — ${t.artist}`),
    '', `Mood: ${pl.mood}`
  ].join('\n');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Playlist copiata negli appunti'))
      .catch(() => showToast('Impossibile copiare'));
  } else {
    showToast('Copia non supportata');
  }
}

// ─────────────────────────────────────────────────────────────
//  EXPORT APPLE MUSIC
// ─────────────────────────────────────────────────────────────
function exportToAppleMusic(pl) {
  // Apre modal con link per ogni brano
  showAppleMusicModal(pl);
}

function showAppleMusicModal(pl) {
  const existing = document.getElementById('apple-modal');
  if (existing) existing.remove();

  const linksHtml = pl.tracks.map((t, i) => {
    const q = encodeURIComponent(`${t.title} ${t.artist}`);
    return `<div class="am-track">
      <span class="am-num">${String(i+1).padStart(2,'0')}</span>
      <span class="am-info"><strong>${escapeHtml(t.title)}</strong> — ${escapeHtml(t.artist)}</span>
      <a href="https://music.apple.com/search?term=${q}" target="_blank" rel="noopener" class="am-link">Apri</a>
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'apple-modal';
  modal.className = 'export-modal';
  modal.innerHTML = `
    <div class="export-modal-box">
      <div class="export-modal-head">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
        <span>Apri su Apple Music</span>
        <button class="export-modal-close" id="am-close">✕</button>
      </div>
      <p class="export-modal-desc">Clicca su ogni brano per aprirlo direttamente su Apple Music.</p>
      <div class="am-tracks">${linksHtml}</div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.getElementById('am-close').addEventListener('click', () => modal.remove());
}

// ─────────────────────────────────────────────────────────────
//  SPOTIFY OAUTH PKCE
// ─────────────────────────────────────────────────────────────
async function generateVerifier() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function getSpotifyToken() {
  try {
    const s = JSON.parse(localStorage.getItem(SPOTIFY_TOKEN_KEY));
    if (s && s.expiry > Date.now()) return s.token;
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    return null;
  } catch { return null; }
}

async function spotifyLogin(pendingPlaylist) {
  const clientId = localStorage.getItem(SPOTIFY_CID_KEY);
  if (!clientId) { openSettingsModal(); return; }

  if (pendingPlaylist) sessionStorage.setItem(SPOTIFY_PENDING, JSON.stringify(pendingPlaylist));

  const verifier   = await generateVerifier();
  const challenge  = await generateChallenge(verifier);
  sessionStorage.setItem('sp_verifier', verifier);

  const redirectUri = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    client_id: clientId, response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'playlist-modify-public playlist-modify-private',
    code_challenge_method: 'S256', code_challenge: challenge
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function handleSpotifyCallback() {
  const params   = new URLSearchParams(window.location.search);
  const code     = params.get('code');
  if (!code) return;

  window.history.replaceState({}, document.title, window.location.pathname);

  const clientId    = localStorage.getItem(SPOTIFY_CID_KEY);
  const verifier    = sessionStorage.getItem('sp_verifier');
  const redirectUri = window.location.origin + window.location.pathname;

  try {
    const body = new URLSearchParams({
      client_id: clientId, grant_type: 'authorization_code',
      code, redirect_uri: redirectUri, code_verifier: verifier
    });
    const res  = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify({
        token: data.access_token, expiry: Date.now() + data.expires_in * 1000
      }));
      const pending = sessionStorage.getItem(SPOTIFY_PENDING);
      sessionStorage.removeItem(SPOTIFY_PENDING);
      if (pending) await exportToSpotify(JSON.parse(pending));
    } else {
      showToast('Errore autenticazione Spotify');
    }
  } catch {
    showToast('Errore connessione Spotify');
  }
}

async function exportToSpotify(pl) {
  const token = getSpotifyToken();
  if (!token) { await spotifyLogin(pl); return; }

  showToast('Connessione a Spotify…');

  try {
    // Profilo utente
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!profileRes.ok) {
      localStorage.removeItem(SPOTIFY_TOKEN_KEY);
      await spotifyLogin(pl);
      return;
    }
    const profile = await profileRes.json();

    // Crea playlist
    const createRes = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pl.name, description: `${pl.description} — via musicAi`, public: false })
    });
    const created = await createRes.json();

    showToast('Ricerca brani su Spotify…');

    // Cerca ogni brano
    const uris = [];
    for (const t of pl.tracks) {
      const q = encodeURIComponent(`track:${t.title} artist:${t.artist}`);
      const sr = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sd = await sr.json();
      const uri = sd.tracks?.items?.[0]?.uri;
      if (uri) uris.push(uri);
    }

    // Aggiungi brani
    if (uris.length > 0) {
      await fetch(`https://api.spotify.com/v1/playlists/${created.id}/tracks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris })
      });
    }

    showToast(`✓ Playlist su Spotify! (${uris.length}/${pl.tracks.length} brani)`);
    window.open(`https://open.spotify.com/playlist/${created.id}`, '_blank');

  } catch (e) {
    console.error(e);
    showToast('Errore esportazione Spotify');
  }
}

// ─────────────────────────────────────────────────────────────
//  MODAL IMPOSTAZIONI SPOTIFY
// ─────────────────────────────────────────────────────────────
function openSettingsModal() {
  const existing = document.getElementById('settings-modal');
  if (existing) { existing.classList.add('open'); return; }

  const modal = document.createElement('div');
  modal.id = 'settings-modal';
  modal.className = 'export-modal open';
  const saved = localStorage.getItem(SPOTIFY_CID_KEY) || '';
  modal.innerHTML = `
    <div class="export-modal-box settings-box">
      <div class="export-modal-head">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.496 17.278a.747.747 0 01-1.028.25c-2.815-1.719-6.357-2.108-10.529-1.155a.747.747 0 11-.333-1.456c4.563-1.043 8.477-.594 11.64 1.334a.747.747 0 01.25 1.027zm1.466-3.26a.934.934 0 01-1.286.307c-3.223-1.98-8.136-2.554-11.95-1.398a.934.934 0 01-1.144-.623.934.934 0 01.624-1.143c4.356-1.322 9.77-.681 13.449 1.593a.934.934 0 01.307 1.264zm.127-3.394c-3.868-2.297-10.249-2.509-13.94-1.388a1.12 1.12 0 01-.69-2.138c4.242-1.368 11.293-1.104 15.748 1.607a1.12 1.12 0 01-1.118 1.919z"/></svg>
        <span>Connetti Spotify</span>
        <button class="export-modal-close" id="settings-close">✕</button>
      </div>
      <div class="settings-body">
        <p>Per salvare le playlist su Spotify, inserisci il tuo <strong>Client ID</strong>.</p>
        <ol class="settings-steps">
          <li>Vai su <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a></li>
          <li>Crea una nuova app (nome qualsiasi)</li>
          <li>Aggiungi come Redirect URI: <code id="redirect-uri-text"></code></li>
          <li>Copia il Client ID qui sotto</li>
        </ol>
        <input id="spotify-cid-input" class="settings-input" type="text"
          placeholder="Incolla qui il tuo Spotify Client ID" value="${escapeHtml(saved)}"/>
        <div class="settings-actions">
          <button class="settings-save" id="settings-save">Salva e connetti</button>
          <button class="settings-clear" id="settings-logout" ${saved ? '' : 'style="display:none"'}>Disconnetti</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('redirect-uri-text').textContent = window.location.origin + window.location.pathname;

  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.getElementById('settings-close').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('settings-save').addEventListener('click', async () => {
    const cid = document.getElementById('spotify-cid-input').value.trim();
    if (!cid) { showToast('Inserisci il Client ID'); return; }
    localStorage.setItem(SPOTIFY_CID_KEY, cid);
    modal.classList.remove('open');
    showToast('Client ID salvato. Autenticazione…');
    if (currentPlaylist) await spotifyLogin(currentPlaylist);
  });
  document.getElementById('settings-logout').addEventListener('click', () => {
    localStorage.removeItem(SPOTIFY_CID_KEY);
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    modal.remove();
    showToast('Disconnesso da Spotify');
  });
}

// Icona impostazioni nella sidebar
document.getElementById('settings-btn').addEventListener('click', openSettingsModal);

// ─────────────────────────────────────────────────────────────
//  LIBRERIA
// ─────────────────────────────────────────────────────────────
function renderLibrary() {
  const list = loadPlaylists();
  const grid = document.getElementById('library-grid');
  const empty = document.getElementById('library-empty');
  const clearBtn = document.getElementById('clear-all-btn');

  if (list.length === 0) {
    grid.innerHTML = ''; empty.style.display = 'flex'; clearBtn.style.display = 'none'; return;
  }
  empty.style.display = 'none'; clearBtn.style.display = 'block';

  grid.innerHTML = list.map(pl => {
    const seed = hashString(pl.name + pl.mood);
    const { grad, icon } = coverStyleFor(seed);
    const date = new Date(pl.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    return `
      <div class="lib-card" data-id="${pl.id}">
        <div class="lib-cover" style="background:${grad}">
          <div class="pl-cover-noise"></div>
          <div class="lib-cover-icon">${icon}</div>
        </div>
        <div class="lib-del" data-del="${pl.id}" title="Elimina">
          <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="lib-name">${escapeHtml(pl.name)}</div>
        <div class="lib-info">${pl.tracks.length} BRANI · ${date.toUpperCase()}</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.lib-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.lib-del')) return;
      const pl = loadPlaylists().find(p => p.id === Number(card.dataset.id));
      if (pl) { goToCreate(); currentPlaylist = pl; document.getElementById('output-loading').style.display = 'none'; renderResult(pl, true); }
    });
  });

  grid.querySelectorAll('.lib-del').forEach(del => {
    del.addEventListener('click', e => {
      e.stopPropagation();
      savePlaylists(loadPlaylists().filter(p => p.id !== Number(del.dataset.del)));
      renderLibrary(); showToast('Playlist eliminata');
    });
  });
}

document.getElementById('clear-all-btn').addEventListener('click', () => {
  if (!loadPlaylists().length) return;
  savePlaylists([]); renderLibrary(); showToast('Libreria svuotata');
});

// ─────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────
renderQuickMoods();
updateNavCount();
handleSpotifyCallback();
