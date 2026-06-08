/**
 * Dataset domande di Codebanda.
 * ------------------------------------------------------------------
 * Quiz musicale formato "rosco" (Pasapalabra) dedicato alla musica
 * dal 1990 al 2026. Ogni risposta inizia con la lettera indicata.
 *
 * Struttura di ogni domanda:
 *  - letter   : lettera dell'alfabeto a cui appartiene (A-Z)
 *  - category : categoria musicale (Pop, Rock, Rap, Dance, Sanremo...)
 *  - clue     : il testo dell'indizio (NON contiene la lettera: la UI
 *               mostra automaticamente "Con la lettera X: ...")
 *  - answer   : risposta "ufficiale" mostrata a video
 *  - accept   : (opzionale) varianti accettate oltre alla risposta.
 *               Il confronto è comunque tollerante: ignora maiuscole,
 *               accenti, punteggiatura e articoli iniziali (vedi utils).
 *
 * Il pool contiene molte domande per lettera: ogni partita ne pesca
 * UNA casuale per lettera, così le partite cambiano ogni volta.
 * Per aggiungere domande basta inserire nuovi oggetti in questo array.
 */

export const QUESTIONS = [
  // ============================== A ==============================
  { letter: 'A', category: 'Pop', clue: "Cantante donna degli ABBA, celebre anche come solista", answer: 'Agnetha', accept: ['Agnetha Fältskog'] },
  { letter: 'A', category: 'Pop', clue: "Cantante britannica degli album '21' e '25', voce di 'Hello'", answer: 'Adele' },
  { letter: 'A', category: 'Pop', clue: "Cantante canadese pop-punk di 'Complicated' e 'Sk8er Boi'", answer: 'Avril Lavigne', accept: ['Avril'] },
  { letter: 'A', category: 'EDM', clue: "DJ e producer svedese di 'Wake Me Up' e 'Levels'", answer: 'Avicii' },
  { letter: 'A', category: 'Soul', clue: "Cantante britannica di 'Rehab', album 'Back to Black'", answer: 'Amy Winehouse', accept: ['Amy'] },
  { letter: 'A', category: 'Pop', clue: "Popstar statunitense di 'thank u, next' e '7 rings'", answer: 'Ariana Grande', accept: ['Ariana'] },
  { letter: 'A', category: 'R&B', clue: "Cantante e pianista di 'No One' e 'If I Ain't Got You'", answer: 'Alicia Keys', accept: ['Alicia'] },
  { letter: 'A', category: 'Rock', clue: "Band hard rock USA di 'I Don't Want to Miss a Thing' (1998)", answer: 'Aerosmith' },
  { letter: 'A', category: 'Cantanti italiani', clue: "Artista provocatorio habitué di Sanremo, 'Rolls Royce'", answer: 'Achille Lauro', accept: ['Achille'] },
  { letter: 'A', category: 'Cantanti italiani', clue: "Cantante pop di 'Mon Amour' e 'Bellissima'", answer: 'Annalisa' },
  { letter: 'A', category: 'Rap', clue: "Gruppo rap italiano anni '90 con J-Ax e DJ Jad", answer: 'Articolo 31', accept: ['Articolo'] },
  { letter: 'A', category: 'Dance', clue: "Gruppo eurodance di 'Barbie Girl' (1997)", answer: 'Aqua' },
  { letter: 'A', category: 'Rock', clue: "Cantante canadese di 'Ironic' e 'You Oughta Know' (1995)", answer: 'Alanis Morissette', accept: ['Alanis'] },
  { letter: 'A', category: 'Electronic', clue: "Pioniere sperimentale dell'IDM e dell'elettronica", answer: 'Aphex Twin' },
  { letter: 'A', category: 'Rock', clue: "Band metal di Huntington Beach di 'Bat Country'", answer: 'Avenged Sevenfold' },

  // ============================== B ==============================
  { letter: 'B', category: 'R&B', clue: "Regina del pop di 'Single Ladies' e 'Halo'", answer: 'Beyoncé', accept: ['Beyonce'] },
  { letter: 'B', category: 'Pop', clue: "Principessa del pop di '...Baby One More Time' (1998)", answer: 'Britney Spears', accept: ['Britney'] },
  { letter: 'B', category: 'Rock', clue: "Band del New Jersey di 'It's My Life'", answer: 'Bon Jovi' },
  { letter: 'B', category: 'Rock', clue: "Band britpop rivale degli Oasis, 'Song 2'", answer: 'Blur' },
  { letter: 'B', category: 'Pop', clue: "Boy band USA di 'I Want It That Way'", answer: 'Backstreet Boys', accept: ['Backstreet'] },
  { letter: 'B', category: 'Pop', clue: "Cantante hawaiano di 'Uptown Funk' e 'Just the Way You Are'", answer: 'Bruno Mars', accept: ['Bruno'] },
  { letter: 'B', category: 'Pop', clue: "Cantante USA di 'bad guy' e 'Happier Than Ever'", answer: 'Billie Eilish', accept: ['Billie'] },
  { letter: 'B', category: 'Reggaeton', clue: "Artista portoricano, album 'Un Verano Sin Ti'", answer: 'Bad Bunny' },
  { letter: 'B', category: 'Hip Hop', clue: "Gruppo di 'I Gotta Feeling' con will.i.am e Fergie", answer: 'Black Eyed Peas' },
  { letter: 'B', category: 'Rock', clue: "Band pop-punk californiana di 'All the Small Things'", answer: 'Blink-182', accept: ['Blink', 'Blink 182'] },
  { letter: 'B', category: 'Cantanti italiani', clue: "Rapper italiana di 'Roma-Bangkok'", answer: 'Baby K' },
  { letter: 'B', category: 'Rock', clue: "Band metalcore britannica di Oli Sykes", answer: 'Bring Me the Horizon' },
  { letter: 'B', category: 'Rock', clue: "'The Boss', voce di 'Streets of Philadelphia' (1994)", answer: 'Bruce Springsteen', accept: ['Bruce', 'Springsteen'] },
  { letter: 'B', category: 'Rock', clue: "Cantautore USA del tormentone alternative 'Loser'", answer: 'Beck' },
  { letter: 'B', category: 'Afrobeats', clue: "Star afrobeats nigeriana di 'Last Last'", answer: 'Burna Boy' },
  { letter: 'B', category: 'Pop', clue: "Cantante di origini albanesi, 'I'm Good (Blue)'", answer: 'Bebe Rexha', accept: ['Bebe'] },

  // ============================== C ==============================
  { letter: 'C', category: 'Rock', clue: "Band britannica di 'Yellow' e 'Viva la Vida'", answer: 'Coldplay' },
  { letter: 'C', category: 'Pop', clue: "Icona pop di 'Believe' (1998), regina dell'autotune", answer: 'Cher' },
  { letter: 'C', category: 'EDM', clue: "DJ scozzese di 'Summer' e 'This Is What You Came For'", answer: 'Calvin Harris', accept: ['Calvin'] },
  { letter: 'C', category: 'Pop', clue: "Cantante USA di 'Genie in a Bottle'", answer: 'Christina Aguilera', accept: ['Christina'] },
  { letter: 'C', category: 'Rap', clue: "Rapper USA di 'Bodak Yellow' e 'WAP'", answer: 'Cardi B', accept: ['Cardi'] },
  { letter: 'C', category: 'Cantanti italiani', clue: "Cantautore ex Lùnapop, 'Poetica'", answer: 'Cesare Cremonini', accept: ['Cremonini', 'Cesare'] },
  { letter: 'C', category: 'Rock', clue: "Band irlandese di 'Zombie', voce Dolores O'Riordan", answer: 'Cranberries', accept: ['The Cranberries'] },
  { letter: 'C', category: 'Electronic', clue: "Duo big beat britannico di 'Block Rockin' Beats'", answer: 'Chemical Brothers' },
  { letter: 'C', category: 'Pop', clue: "Cantante britannica di 'Boom Clap', album 'Brat' (2024)", answer: 'Charli XCX', accept: ['Charli'] },
  { letter: 'C', category: 'Cantanti italiani', clue: "Cantautore indie di 'Pesto' e 'Oroscopo'", answer: 'Calcutta' },
  { letter: 'C', category: 'Rap', clue: "Rapper italiano dai testi ironici, 'Vieni a ballare in Puglia'", answer: 'Caparezza' },
  { letter: 'C', category: 'Pop', clue: "Cantante canadese del tormentone 'Call Me Maybe'", answer: 'Carly Rae Jepsen', accept: ['Carly Rae', 'Carly'] },
  { letter: 'C', category: 'Hip Hop', clue: "Gruppo hip hop di 'Insane in the Brain'", answer: 'Cypress Hill' },
  { letter: 'C', category: 'Rap', clue: "Rapper di 'Gangsta's Paradise' (1995)", answer: 'Coolio' },
  { letter: 'C', category: 'Hip Hop', clue: "Alter ego musicale di Donald Glover, 'This Is America'", answer: 'Childish Gambino', accept: ['Childish'] },
  { letter: 'C', category: 'Pop', clue: "Cantante USA rivelazione 2024 con 'Good Luck, Babe!'", answer: 'Chappell Roan', accept: ['Chappell'] },

  // ============================== D ==============================
  { letter: 'D', category: 'EDM', clue: "Duo francese mascherato di 'Get Lucky' e 'One More Time'", answer: 'Daft Punk' },
  { letter: 'D', category: 'EDM', clue: "DJ francese di 'Titanium' e 'When Love Takes Over'", answer: 'David Guetta', accept: ['Guetta', 'David'] },
  { letter: 'D', category: 'Pop', clue: "Cantante britannica di 'Levitating' e 'New Rules'", answer: 'Dua Lipa', accept: ['Dua'] },
  { letter: 'D', category: 'Rap', clue: "Rapper canadese di 'God's Plan' e 'Hotline Bling'", answer: 'Drake' },
  { letter: 'D', category: 'Pop', clue: "Band synth-pop britannica di 'Enjoy the Silence'", answer: 'Depeche Mode' },
  { letter: 'D', category: 'R&B', clue: "Trio R&B che lanciò Beyoncé", answer: "Destiny's Child", accept: ['Destinys Child'] },
  { letter: 'D', category: 'Producer', clue: "Producer e rapper di 'The Chronic', fondatore di Aftermath", answer: 'Dr. Dre', accept: ['Dr Dre', 'Dre'] },
  { letter: 'D', category: 'EDM', clue: "DJ canadese con il casco da topo", answer: 'Deadmau5' },
  { letter: 'D', category: 'Pop', clue: "Cantante USA di 'Say So' e 'Woman'", answer: 'Doja Cat', accept: ['Doja'] },
  { letter: 'D', category: 'Pop', clue: "Cantautrice britannica di 'White Flag' e 'Thank You'", answer: 'Dido' },
  { letter: 'D', category: 'Sanremo', clue: "Vincitore di Sanremo 2020 con 'Fai rumore'", answer: 'Diodato' },
  { letter: 'D', category: 'R&B', clue: "Cantante neo-soul del brano 'Untitled (How Does It Feel)'", answer: "D'Angelo", accept: ['Dangelo'] },
  { letter: 'D', category: 'Pop', clue: "Ex stella Disney di 'Sorry Not Sorry'", answer: 'Demi Lovato', accept: ['Demi'] },
  { letter: 'D', category: 'EDM', clue: "Duo electronic britannico di 'Latch'", answer: 'Disclosure' },
  { letter: 'D', category: 'Reggaeton', clue: "'Big Boss' del reggaeton, voce di 'Gasolina'", answer: 'Daddy Yankee', accept: ['Daddy'] },

  // ============================== E ==============================
  { letter: 'E', category: 'Rap', clue: "Rapper di Detroit di 'Lose Yourself'", answer: 'Eminem' },
  { letter: 'E', category: 'Pop', clue: "Cantautore britannico di 'Shape of You' e 'Perfect'", answer: 'Ed Sheeran', accept: ['Sheeran', 'Ed'] },
  { letter: 'E', category: 'Pop', clue: "Leggenda del piano pop, 'Candle in the Wind 1997'", answer: 'Elton John', accept: ['Elton'] },
  { letter: 'E', category: 'Rock', clue: "Chitarrista di 'Tears in Heaven' (1992)", answer: 'Eric Clapton', accept: ['Clapton', 'Eric'] },
  { letter: 'E', category: 'Cantanti italiani', clue: "Cantante romano di 'Più bella cosa' e 'Terra promessa'", answer: 'Eros Ramazzotti', accept: ['Eros', 'Ramazzotti'] },
  { letter: 'E', category: 'Cantanti italiani', clue: "Cantante di 'Luce (tramonti a nord est)'", answer: 'Elisa' },
  { letter: 'E', category: 'Pop', clue: "Cantante spagnolo di 'Bailando' e 'Hero'", answer: 'Enrique Iglesias', accept: ['Enrique', 'Iglesias'] },
  { letter: 'E', category: 'Rock', clue: "Band rock USA di 'Bring Me to Life' (2003)", answer: 'Evanescence' },
  { letter: 'E', category: 'Dance', clue: "Gruppo dance italiano di 'Blue (Da Ba Dee)' (1999)", answer: 'Eiffel 65', accept: ['Eiffel'] },
  { letter: 'E', category: 'Cantanti italiani', clue: "Cantante ex talent di 'Andromeda'", answer: 'Elodie' },
  { letter: 'E', category: 'Cultura musicale', clue: "Manifestazione canora europea vinta dai Måneskin nel 2021", answer: 'Eurovision' },
  { letter: 'E', category: 'Pop', clue: "Cantante britannica di 'Love Me Like You Do'", answer: 'Ellie Goulding', accept: ['Ellie'] },
  { letter: 'E', category: 'EDM', clue: "DJ svedese del tormentone 'Call on Me'", answer: 'Eric Prydz' },
  { letter: 'E', category: 'Electronic', clue: "Duo australiano di 'Walking on a Dream'", answer: 'Empire of the Sun' },

  // ============================== F ==============================
  { letter: 'F', category: 'Rock', clue: "Band di Dave Grohl di 'Everlong' e 'The Pretender'", answer: 'Foo Fighters' },
  { letter: 'F', category: 'Cantanti italiani', clue: "Rapper e personaggio, marito di Chiara Ferragni", answer: 'Fedez' },
  { letter: 'F', category: 'Electronic', clue: "DJ big beat di 'Praise You'", answer: 'Fatboy Slim', accept: ['Fatboy'] },
  { letter: 'F', category: 'Rock', clue: "Band scozzese di 'Take Me Out'", answer: 'Franz Ferdinand', accept: ['Franz'] },
  { letter: 'F', category: 'Pop', clue: "Cantante dei Black Eyed Peas, 'Big Girls Don't Cry'", answer: 'Fergie' },
  { letter: 'F', category: 'R&B', clue: "Artista di 'Thinkin Bout You', album 'Blonde'", answer: 'Frank Ocean', accept: ['Frank'] },
  { letter: 'F', category: 'Rap', clue: "Rapper di Atlanta di 'Mask Off'", answer: 'Future' },
  { letter: 'F', category: 'Cantanti italiani', clue: "Voce impegnata di 'Quello che le donne non dicono'", answer: 'Fiorella Mannoia', accept: ['Fiorella', 'Mannoia'] },
  { letter: 'F', category: 'Rock', clue: "Band pop-punk USA di 'Sugar, We're Goin Down'", answer: 'Fall Out Boy' },
  { letter: 'F', category: 'Rock', clue: "Band britannica di 'Dog Days Are Over'", answer: 'Florence and the Machine', accept: ['Florence', 'Florence + the Machine'] },
  { letter: 'F', category: 'Sanremo', clue: "Seconda a Sanremo 2016 con 'Nessun grado di separazione'", answer: 'Francesca Michielin', accept: ['Francesca', 'Michielin'] },
  { letter: 'F', category: 'Rap', clue: "Rapper italiano di 'Applausi per Fibra'", answer: 'Fabri Fibra', accept: ['Fabri', 'Fibra'] },
  { letter: 'F', category: 'Hip Hop', clue: "Rapper USA di 'Low' e 'Whistle'", answer: 'Flo Rida' },
  { letter: 'F', category: 'Rock', clue: "Band indie di 'Pumped Up Kicks'", answer: 'Foster the People' },

  // ============================== G ==============================
  { letter: 'G', category: 'Rock', clue: "Band punk-rock USA di 'American Idiot'", answer: 'Green Day' },
  { letter: 'G', category: 'Pop', clue: "Progetto virtuale di Damon Albarn, 'Feel Good Inc.'", answer: 'Gorillaz' },
  { letter: 'G', category: 'Rock', clue: "Band hard rock di 'November Rain' (1991)", answer: "Guns N' Roses", accept: ['Guns N Roses', 'Guns and Roses'] },
  { letter: 'G', category: 'Cantanti italiani', clue: "Cantante napoletano popolarissimo, 'Non dirgli mai'", answer: "Gigi D'Alessio", accept: ['Gigi DAlessio'] },
  { letter: 'G', category: 'Pop', clue: "Cantante dei No Doubt, voce di 'Hollaback Girl'", answer: 'Gwen Stefani', accept: ['Gwen'] },
  { letter: 'G', category: 'Pop', clue: "Cantante britannico di 'Careless Whisper' e 'Freedom! 90'", answer: 'George Michael', accept: ['George'] },
  { letter: 'G', category: 'Cantanti italiani', clue: "Potente voce femminile di 'Di sole e d'azzurro'", answer: 'Giorgia' },
  { letter: 'G', category: 'Rap', clue: "Rapper italo-tunisino di 'Cara Italia'", answer: 'Ghali' },
  { letter: 'G', category: 'Pop', clue: "Artista canadese sperimentale, album 'Visions'", answer: 'Grimes' },
  { letter: 'G', category: 'Cantanti italiani', clue: "Cantautore indie romano di 'Sopra' e 'Punk'", answer: 'Gazzelle' },
  { letter: 'G', category: 'Pop', clue: "Tormentone coreano virale del 2012 di PSY", answer: 'Gangnam Style' },
  { letter: 'G', category: 'Dance', clue: "DJ italiano di 'L'Amour Toujours'", answer: "Gigi D'Agostino", accept: ['Gigi DAgostino'] },
  { letter: 'G', category: 'Pop', clue: "Artista belga di 'Somebody That I Used to Know' (2011)", answer: 'Gotye' },
  { letter: 'G', category: 'Rock', clue: "Band USA di 'Iris' (colonna sonora 'City of Angels')", answer: 'Goo Goo Dolls' },
  { letter: 'G', category: 'Pop', clue: "Band indie britannica di 'Heat Waves'", answer: 'Glass Animals' },

  // ============================== H ==============================
  { letter: 'H', category: 'Pop', clue: "Band di tre fratelli, tormentone 'MMMBop' (1997)", answer: 'Hanson' },
  { letter: 'H', category: 'Pop', clue: "Ex One Direction solista di 'Watermelon Sugar' e 'As It Was'", answer: 'Harry Styles', accept: ['Harry'] },
  { letter: 'H', category: 'Pop', clue: "Cantante USA di 'Without Me' e 'Closer'", answer: 'Halsey' },
  { letter: 'H', category: 'Dance', clue: "Progetto eurodance di 'What Is Love' (1993)", answer: 'Haddaway' },
  { letter: 'H', category: 'Rock', clue: "Cantautore irlandese di 'Take Me to Church'", answer: 'Hozier' },
  { letter: 'H', category: 'Rock', clue: "Band grunge di Courtney Love", answer: 'Hole' },
  { letter: 'H', category: 'Colonne sonore', clue: "Compositore tedesco di 'Il Re Leone', 'Inception', 'Interstellar'", answer: 'Hans Zimmer', accept: ['Hans', 'Zimmer'] },
  { letter: 'H', category: 'Hip Hop', clue: "Singolo del 2003 degli OutKast con 'shake it like a Polaroid'", answer: 'Hey Ya', accept: ['Hey Ya!'] },
  { letter: 'H', category: 'Pop Latino', clue: "Singolo del 2006 di Shakira feat. Wyclef Jean", answer: "Hips Don't Lie", accept: ['Hips Dont Lie'] },
  { letter: 'H', category: 'Pop', clue: "Brano di Pharrell Williams del 2013 da 'Cattivissimo Me 2'", answer: 'Happy' },
  { letter: 'H', category: 'EDM', clue: "DJ olandese più volte numero uno della classifica DJ Mag", answer: 'Hardwell' },

  // ============================== I ==============================
  { letter: 'I', category: 'Rock', clue: "Storica band heavy metal britannica con la mascotte Eddie", answer: 'Iron Maiden' },
  { letter: 'I', category: 'Rock', clue: "Band USA di 'Radioactive' e 'Believer'", answer: 'Imagine Dragons' },
  { letter: 'I', category: 'Rap', clue: "Rapper australiana di 'Fancy' (2014)", answer: 'Iggy Azalea', accept: ['Iggy'] },
  { letter: 'I', category: 'Cantanti italiani', clue: "Cantante ex Amici di 'La genesi del tuo colore'", answer: 'Irama' },
  { letter: 'I', category: 'Hip Hop', clue: "Ex N.W.A poi attore, 'It Was a Good Day'", answer: 'Ice Cube' },
  { letter: 'I', category: 'Rock', clue: "Band rock USA di 'Drive' e 'Wish You Were Here'", answer: 'Incubus' },
  { letter: 'I', category: 'Rock', clue: "Band post-punk revival di 'Evil'", answer: 'Interpol' },
  { letter: 'I', category: 'Colonne sonore', clue: "Ballad di Whitney Houston del 1992 da 'The Bodyguard'", answer: 'I Will Always Love You' },
  { letter: 'I', category: 'Rock', clue: "Singolo dei Linkin Park del 2001 dall'album 'Hybrid Theory'", answer: 'In the End' },
  { letter: 'I', category: 'Rock', clue: "Singolo dei Goo Goo Dolls del 1998 da 'City of Angels'", answer: 'Iris' },

  // ============================== J ==============================
  { letter: 'J', category: 'Pop', clue: "Popstar canadese lanciata da YouTube, 'Sorry' e 'Baby'", answer: 'Justin Bieber', accept: ['Bieber'] },
  { letter: 'J', category: 'Pop', clue: "Ex *NSYNC solista di 'SexyBack' e 'Cry Me a River'", answer: 'Justin Timberlake', accept: ['Timberlake'] },
  { letter: 'J', category: 'Rap', clue: "Rapper marito di Beyoncé, 'Empire State of Mind'", answer: 'Jay-Z', accept: ['Jay Z'] },
  { letter: 'J', category: 'Pop', clue: "Cantante e attrice del Bronx, 'Jenny from the Block'", answer: 'Jennifer Lopez', accept: ['JLo', 'J-Lo'] },
  { letter: 'J', category: 'Cantanti italiani', clue: "Cantante solare di 'L'ombelico del mondo'", answer: 'Jovanotti' },
  { letter: 'J', category: 'Funk', clue: "Band acid-jazz di 'Virtual Insanity'", answer: 'Jamiroquai' },
  { letter: 'J', category: 'Pop', clue: "Cantautore britannico di 'You're Beautiful'", answer: 'James Blunt', accept: ['James'] },
  { letter: 'J', category: 'Rap', clue: "Rapper italiano ex Articolo 31", answer: 'J-Ax', accept: ['J Ax', 'Jax'] },
  { letter: 'J', category: 'Pop', clue: "Cantante USA di 'Whatcha Say' e 'In My Head'", answer: 'Jason Derulo', accept: ['Jason'] },
  { letter: 'J', category: 'Soul', clue: "Cantautore di 'Ordinary People' e 'All of Me'", answer: 'John Legend' },
  { letter: 'J', category: 'Pop', clue: "Cantautore hawaiano di 'Banana Pancakes'", answer: 'Jack Johnson' },

  // ============================== K ==============================
  { letter: 'K', category: 'Pop', clue: "Cantante di 'Firework' e 'Roar'", answer: 'Katy Perry', accept: ['Katy'] },
  { letter: 'K', category: 'Rap', clue: "Rapper e producer di 'Stronger'", answer: 'Kanye West', accept: ['Kanye', 'Ye'] },
  { letter: 'K', category: 'Rap', clue: "Rapper di Compton, premio Pulitzer, 'HUMBLE.'", answer: 'Kendrick Lamar', accept: ['Kendrick'] },
  { letter: 'K', category: 'Pop', clue: "Cantante USA di 'Tik Tok' (2009)", answer: 'Kesha' },
  { letter: 'K', category: 'Rock', clue: "Band rock USA di 'Sex on Fire'", answer: 'Kings of Leon' },
  { letter: 'K', category: 'Pop', clue: "Principessa del pop australiano, 'Can't Get You Out of My Head'", answer: 'Kylie Minogue', accept: ['Kylie'] },
  { letter: 'K', category: 'Hip Hop', clue: "Rapper e produttore di 'Day n Nite'", answer: 'Kid Cudi' },
  { letter: 'K', category: 'Rock', clue: "Band nu metal di 'Freak on a Leash'", answer: 'Korn' },
  { letter: 'K', category: 'Rock', clue: "Band britannica di 'Somewhere Only We Know'", answer: 'Keane' },
  { letter: 'K', category: 'Rock', clue: "Band di Las Vegas di 'Mr. Brightside'", answer: 'Killers', accept: ['The Killers'] },
  { letter: 'K', category: 'EDM', clue: "DJ norvegese tropical house di 'Firestone'", answer: 'Kygo' },
  { letter: 'K', category: 'Country', clue: "Cantante country-pop di 'Rainbow' e 'Golden Hour'", answer: 'Kacey Musgraves', accept: ['Kacey'] },

  // ============================== L ==============================
  { letter: 'L', category: 'Pop', clue: "Regina del pop teatrale di 'Bad Romance' e 'Poker Face'", answer: 'Lady Gaga', accept: ['Gaga'] },
  { letter: 'L', category: 'Rock', clue: "Band nu metal di 'In the End' e 'Numb'", answer: 'Linkin Park' },
  { letter: 'L', category: 'Pop', clue: "Cantante USA malinconica di 'Summertime Sadness'", answer: 'Lana Del Rey', accept: ['Lana'] },
  { letter: 'L', category: 'Pop', clue: "Cantante USA di 'About Damn Time' e 'Truth Hurts'", answer: 'Lizzo' },
  { letter: 'L', category: 'Rap', clue: "Rapper USA di 'Old Town Road' (2019)", answer: 'Lil Nas X' },
  { letter: 'L', category: 'Cantanti italiani', clue: "Rocker di Correggio, 'Certe notti'", answer: 'Ligabue' },
  { letter: 'L', category: 'Cantanti italiani', clue: "Cantante di 'La solitudine' e 'Strani amori'", answer: 'Laura Pausini', accept: ['Pausini', 'Laura'] },
  { letter: 'L', category: 'Pop', clue: "Cantautore scozzese di 'Someone You Loved'", answer: 'Lewis Capaldi', accept: ['Lewis', 'Capaldi'] },
  { letter: 'L', category: 'Rock', clue: "Band nu metal di 'Rollin''", answer: 'Limp Bizkit' },
  { letter: 'L', category: 'Pop', clue: "Cantante neozelandese di 'Royals' (2013)", answer: 'Lorde' },
  { letter: 'L', category: 'Rap', clue: "Rapper di New Orleans, 'Lollipop'", answer: 'Lil Wayne' },
  { letter: 'L', category: 'Pop', clue: "Cantante USA di 'Lost on You'", answer: 'LP' },
  { letter: 'L', category: 'Pop Latino', clue: "Cantante portoricano di 'Despacito' (2017)", answer: 'Luis Fonsi', accept: ['Fonsi'] },
  { letter: 'L', category: 'Rap', clue: "Rapper di Philadelphia di 'XO Tour Llif3'", answer: 'Lil Uzi Vert', accept: ['Lil Uzi'] },

  // ============================== M ==============================
  { letter: 'M', category: 'Pop', clue: "Regina del pop, 'Vogue', 'Frozen', 'Like a Prayer'", answer: 'Madonna' },
  { letter: 'M', category: 'Pop', clue: "Re del Pop, 'Black or White' (1991) e 'Earth Song'", answer: 'Michael Jackson', accept: ['Michael'] },
  { letter: 'M', category: 'Pop', clue: "Band di Adam Levine di 'This Love' e 'Sugar'", answer: 'Maroon 5', accept: ['Maroon'] },
  { letter: 'M', category: 'Rock', clue: "Band romana vincitrice dell'Eurovision 2021", answer: 'Måneskin', accept: ['Maneskin'] },
  { letter: 'M', category: 'Pop', clue: "Voce di 'All I Want for Christmas Is You' (1994)", answer: 'Mariah Carey', accept: ['Mariah'] },
  { letter: 'M', category: 'Rock', clue: "Band thrash metal di 'Enter Sandman' (1991)", answer: 'Metallica' },
  { letter: 'M', category: 'Pop', clue: "Ex stella Disney di 'Wrecking Ball' e 'Flowers'", answer: 'Miley Cyrus', accept: ['Miley'] },
  { letter: 'M', category: 'Pop', clue: "Cantante libanese-britannico di 'Grace Kelly'", answer: 'Mika' },
  { letter: 'M', category: 'EDM', clue: "DJ mascherato di 'Happier' e 'Alone'", answer: 'Marshmello' },
  { letter: 'M', category: 'Sanremo', clue: "Vincitore di Sanremo 2013 e 2023", answer: 'Marco Mengoni', accept: ['Mengoni', 'Marco'] },
  { letter: 'M', category: 'Rap', clue: "Rapper di Houston di 'Savage'", answer: 'Megan Thee Stallion', accept: ['Megan'] },
  { letter: 'M', category: 'Rock', clue: "Band britannica di 'Uprising' e 'Supermassive Black Hole'", answer: 'Muse' },
  { letter: 'M', category: 'Reggaeton', clue: "Cantante colombiano di 'Felices los 4'", answer: 'Maluma' },
  { letter: 'M', category: 'Rap', clue: "Rapper di Pittsburgh, album 'Swimming'", answer: 'Mac Miller' },
  { letter: 'M', category: 'Rock', clue: "Band folk-rock britannica di 'I Will Wait'", answer: 'Mumford & Sons', accept: ['Mumford and Sons', 'Mumford'] },
  { letter: 'M', category: 'Electronic', clue: "Progetto francese di 'Midnight City'", answer: 'M83' },

  // ============================== N ==============================
  { letter: 'N', category: 'Rock', clue: "Band grunge di Seattle, 'Smells Like Teen Spirit' (1991)", answer: 'Nirvana' },
  { letter: 'N', category: 'Pop', clue: "Cantante canadese di 'Maneater' e 'Say It Right'", answer: 'Nelly Furtado', accept: ['Furtado'] },
  { letter: 'N', category: 'Rap', clue: "Rapper USA di 'Super Bass' e 'Anaconda'", answer: 'Nicki Minaj', accept: ['Nicki'] },
  { letter: 'N', category: 'Rock', clue: "Band di Gwen Stefani di 'Don't Speak'", answer: 'No Doubt' },
  { letter: 'N', category: 'Jazz', clue: "Cantante jazz-pop di 'Don't Know Why'", answer: 'Norah Jones', accept: ['Norah'] },
  { letter: 'N', category: 'Rap', clue: "Rapper di New York, album 'Illmatic' (1994)", answer: 'Nas' },
  { letter: 'N', category: 'Cantanti italiani', clue: "Cantante di 'Laura non c'è'", answer: 'Nek' },
  { letter: 'N', category: 'Rock', clue: "Band rock canadese di 'How You Remind Me'", answer: 'Nickelback' },
  { letter: 'N', category: 'Hip Hop', clue: "Rapper USA di 'Hot in Herre' (2002)", answer: 'Nelly' },
  { letter: 'N', category: 'Cantanti italiani', clue: "Band del Salento di 'Estate' e 'Meraviglioso'", answer: 'Negramaro' },
  { letter: 'N', category: 'Pop', clue: "Boy band anni '90 di 'Step by Step'", answer: 'New Kids on the Block' },
  { letter: 'N', category: 'Rock', clue: "Progetto industrial di Trent Reznor, 'Closer'", answer: 'Nine Inch Nails' },
  { letter: 'N', category: 'Pop', clue: "Cantante australiana del tormentone 'Torn' (1997)", answer: 'Natalie Imbruglia', accept: ['Natalie'] },

  // ============================== O ==============================
  { letter: 'O', category: 'Rock', clue: "Band britpop di 'Wonderwall' e 'Don't Look Back in Anger'", answer: 'Oasis' },
  { letter: 'O', category: 'Hip Hop', clue: "Duo di Atlanta di 'Hey Ya!' e 'Ms. Jackson'", answer: 'OutKast' },
  { letter: 'O', category: 'Pop', clue: "Band pop-rock di 'Counting Stars'", answer: 'OneRepublic' },
  { letter: 'O', category: 'Rock', clue: "Band punk-rock USA di 'Pretty Fly (for a White Guy)'", answer: 'Offspring', accept: ['The Offspring'] },
  { letter: 'O', category: 'Pop', clue: "Boy band britannica di 'What Makes You Beautiful'", answer: 'One Direction' },
  { letter: 'O', category: 'Pop', clue: "Cantante USA di 'drivers license' e 'good 4 u'", answer: 'Olivia Rodrigo', accept: ['Olivia'] },
  { letter: 'O', category: 'Rock', clue: "Leggenda del metal, voce dei Black Sabbath", answer: 'Ozzy Osbourne', accept: ['Ozzy'] },
  { letter: 'O', category: 'Rock', clue: "Singolo simbolo degli U2 del 1991 dall'album 'Achtung Baby'", answer: 'One' },
  { letter: 'O', category: 'EDM', clue: "Brano dei Daft Punk del 2000", answer: 'One More Time' },
  { letter: 'O', category: 'Pop', clue: "Cantante giamaicano del tormentone 'Cheerleader'", answer: 'OMI' },

  // ============================== P ==============================
  { letter: 'P', category: 'Rock', clue: "Band grunge di Seattle di 'Alive' e 'Jeremy'", answer: 'Pearl Jam' },
  { letter: 'P', category: 'Pop', clue: "Cantante USA ribelle di 'So What' e 'Get the Party Started'", answer: 'Pink', accept: ['P!nk'] },
  { letter: 'P', category: 'Pop', clue: "Genio di Minneapolis, 'Diamonds and Pearls' (1991)", answer: 'Prince' },
  { letter: 'P', category: 'Rap', clue: "Rapper di 'Circles' e 'Rockstar'", answer: 'Post Malone', accept: ['Post'] },
  { letter: 'P', category: 'Electronic', clue: "Gruppo big beat britannico di 'Firestarter'", answer: 'Prodigy', accept: ['The Prodigy'] },
  { letter: 'P', category: 'Pop', clue: "Duo synth-pop britannico di 'West End Girls'", answer: 'Pet Shop Boys' },
  { letter: 'P', category: 'Rock', clue: "Band di Hayley Williams di 'Misery Business'", answer: 'Paramore' },
  { letter: 'P', category: 'Cantanti italiani', clue: "Band indie di Bergamo di 'Ringo Starr'", answer: 'Pinguini Tattici Nucleari', accept: ['Pinguini'] },
  { letter: 'P', category: 'Pop', clue: "Cantante coreano del tormentone 'Gangnam Style'", answer: 'PSY' },
  { letter: 'P', category: 'Rock', clue: "Singolo dei Coldplay del 2011 da 'Mylo Xyloto'", answer: 'Paradise' },
  { letter: 'P', category: 'Cantanti italiani', clue: "Storico gruppo italiano di 'Tanta voglia di lei'", answer: 'Pooh' },
  { letter: 'P', category: 'Pop Latino', clue: "'Mr. Worldwide', voce di 'Timber'", answer: 'Pitbull' },
  { letter: 'P', category: 'Rock', clue: "Band alt-rock di 'Where Is My Mind?'", answer: 'Pixies' },

  // ============================== Q ==============================
  { letter: 'Q', category: 'Rock', clue: "Band di Freddie Mercury, 'The Show Must Go On' (1991)", answer: 'Queen' },
  { letter: 'Q', category: 'Rap', clue: "Rapper dei Migos, 'Stir Fry'", answer: 'Quavo' },
  { letter: 'Q', category: 'Producer', clue: "Leggendario produttore di 'Thriller' di Michael Jackson", answer: 'Quincy Jones', accept: ['Quincy'] },
  { letter: 'Q', category: 'Hip Hop', clue: "Rapper e produttore degli A Tribe Called Quest", answer: 'Q-Tip', accept: ['Q Tip', 'Qtip'] },
  { letter: 'Q', category: 'Rock', clue: "Band rock USA di 'No One Knows'", answer: 'Queens of the Stone Age' },

  // ============================== R ==============================
  { letter: 'R', category: 'Rock', clue: "Band britannica di 'Creep' (1992), album 'OK Computer'", answer: 'Radiohead' },
  { letter: 'R', category: 'Pop', clue: "Popstar di Barbados di 'Umbrella' e 'Diamonds'", answer: 'Rihanna' },
  { letter: 'R', category: 'Rock', clue: "Band funk-rock di 'Californication'", answer: 'Red Hot Chili Peppers', accept: ['RHCP'] },
  { letter: 'R', category: 'Rock', clue: "Band di Athens di 'Losing My Religion' (1991)", answer: 'R.E.M.', accept: ['REM'] },
  { letter: 'R', category: 'Pop', clue: "Ex Take That solista di 'Angels' e 'Feel'", answer: 'Robbie Williams', accept: ['Robbie'] },
  { letter: 'R', category: 'Rock', clue: "Band rap-metal di 'Killing in the Name'", answer: 'Rage Against the Machine', accept: ['Rage', 'RATM'] },
  { letter: 'R', category: 'Pop', clue: "Artista spagnola sperimentale, album 'Motomami'", answer: 'Rosalía', accept: ['Rosalia'] },
  { letter: 'R', category: 'Reggaeton', clue: "Cantante portoricano di 'Todo de Ti'", answer: 'Rauw Alejandro', accept: ['Rauw'] },
  { letter: 'R', category: 'Pop Latino', clue: "Cantante di 'Livin' la Vida Loca' (1999)", answer: 'Ricky Martin', accept: ['Ricky'] },
  { letter: 'R', category: 'Rap', clue: "Rapper italiano di 'Insuperabile'", answer: 'Rkomi' },
  { letter: 'R', category: 'Soul', clue: "Singolo di Adele del 2010 da '21'", answer: 'Rolling in the Deep' },

  // ============================== S ==============================
  { letter: 'S', category: 'Pop', clue: "Girl power britannico, 'Wannabe' (1996)", answer: 'Spice Girls' },
  { letter: 'S', category: 'Pop Latino', clue: "Cantante colombiana di 'Whenever, Wherever'", answer: 'Shakira' },
  { letter: 'S', category: 'Pop', clue: "Cantante australiana di 'Chandelier' e 'Cheap Thrills'", answer: 'Sia' },
  { letter: 'S', category: 'Rap', clue: "Rapper della West Coast, album 'Doggystyle' (1993)", answer: 'Snoop Dogg', accept: ['Snoop'] },
  { letter: 'S', category: 'Pop', clue: "Cantante britannico di 'Stay With Me'", answer: 'Sam Smith', accept: ['Sam'] },
  { letter: 'S', category: 'Rock', clue: "Ex Police solista di 'Fields of Gold' (1993)", answer: 'Sting' },
  { letter: 'S', category: 'EDM', clue: "DJ di dubstep di 'Bangarang'", answer: 'Skrillex' },
  { letter: 'S', category: 'Pop', clue: "Ex stella Disney di 'Lose You to Love Me'", answer: 'Selena Gomez', accept: ['Selena'] },
  { letter: 'S', category: 'R&B', clue: "Cantante di 'Kill Bill' e 'Snooze'", answer: 'SZA' },
  { letter: 'S', category: 'Cantanti italiani', clue: "Band torinese di 'Tutti i miei sbagli'", answer: 'Subsonica' },
  { letter: 'S', category: 'Rap', clue: "Trapper italiano, album 'Rockstar'", answer: 'Sfera Ebbasta', accept: ['Sfera'] },
  { letter: 'S', category: 'Rock', clue: "Band metal alternativo di 'Chop Suey!'", answer: 'System of a Down', accept: ['System'] },
  { letter: 'S', category: 'Pop', clue: "Cantante canadese di 'Stitches' e 'Treat You Better'", answer: 'Shawn Mendes', accept: ['Shawn'] },
  { letter: 'S', category: 'Rock', clue: "Band pop-punk canadese di 'In Too Deep'", answer: 'Sum 41', accept: ['Sum'] },
  { letter: 'S', category: 'EDM', clue: "Supergruppo svedese di 'Don't You Worry Child'", answer: 'Swedish House Mafia' },
  { letter: 'S', category: 'Pop', clue: "Cantante USA rivelazione 2024 con 'Espresso'", answer: 'Sabrina Carpenter', accept: ['Sabrina'] },

  // ============================== T ==============================
  { letter: 'T', category: 'Pop', clue: "Popstar USA di 'Shake It Off' e 'Anti-Hero'", answer: 'Taylor Swift', accept: ['Taylor'] },
  { letter: 'T', category: 'R&B', clue: "Artista canadese di 'Blinding Lights' e 'Starboy'", answer: 'The Weeknd', accept: ['Weeknd'] },
  { letter: 'T', category: 'Rap', clue: "Rapper di Houston di 'Sicko Mode'", answer: 'Travis Scott', accept: ['Travis'] },
  { letter: 'T', category: 'Cantanti italiani', clue: "Cantante di 'Perdono' e 'Sere nere'", answer: 'Tiziano Ferro', accept: ['Tiziano', 'Ferro'] },
  { letter: 'T', category: 'R&B', clue: "Trio R&B femminile di 'No Scrubs' e 'Waterfalls'", answer: 'TLC' },
  { letter: 'T', category: 'EDM', clue: "DJ olandese pioniere della trance", answer: 'Tiësto', accept: ['Tiesto'] },
  { letter: 'T', category: 'Rap', clue: "Leggendario rapper della West Coast scomparso nel 1996", answer: 'Tupac', accept: ['2Pac', 'Tupac Shakur'] },
  { letter: 'T', category: 'Pop', clue: "Cantante australiana del tormentone 'Dance Monkey'", answer: 'Tones and I', accept: ['Tones'] },
  { letter: 'T', category: 'Sanremo', clue: "Cantante italiano ironico, Sanremo con 'Tango'", answer: 'Tananai' },
  { letter: 'T', category: 'Rock', clue: "Band USA di 'Drops of Jupiter'", answer: 'Train' },
  { letter: 'T', category: 'Pop', clue: "Singolo di Britney Spears del 2004", answer: 'Toxic' },
  { letter: 'T', category: 'Rock', clue: "Band britannica di Robert Smith, 'Friday I'm in Love' (1992)", answer: 'The Cure', accept: ['Cure'] },
  { letter: 'T', category: 'Pop', clue: "Cantante svedese di 'Habits (Stay High)'", answer: 'Tove Lo' },
  { letter: 'T', category: 'EDM', clue: "Duo USA di 'Closer' e 'Don't Let Me Down'", answer: 'The Chainsmokers', accept: ['Chainsmokers'] },

  // ============================== U ==============================
  { letter: 'U', category: 'Rock', clue: "Band irlandese di Bono, 'One' e 'Beautiful Day'", answer: 'U2' },
  { letter: 'U', category: 'R&B', clue: "Re dell'R&B da club, 'Yeah!' e 'Burn'", answer: 'Usher' },
  { letter: 'U', category: 'Reggae', clue: "Band britannica di '(I Can't Help) Falling in Love' (1993)", answer: 'UB40' },
  { letter: 'U', category: 'Electronic', clue: "Duo di 'Born Slippy' (colonna sonora 'Trainspotting')", answer: 'Underworld' },
  { letter: 'U', category: 'Cantanti italiani', clue: "Cantautore romano di 'I tuoi particolari'", answer: 'Ultimo' },
  { letter: 'U', category: 'Pop', clue: "Singolo simbolo di Rihanna del 2007 con Jay-Z", answer: 'Umbrella' },

  // ============================== V ==============================
  { letter: 'V', category: 'Cantanti italiani', clue: "Rocker di Zocca, 'Albachiara' e 'Vita spericolata'", answer: 'Vasco Rossi', accept: ['Vasco'] },
  { letter: 'V', category: 'Dance', clue: "Gruppo eurodance di 'We Like to Party' (1998)", answer: 'Vengaboys' },
  { letter: 'V', category: 'Rock', clue: "Band britannica di 'Bitter Sweet Symphony' (1997)", answer: 'Verve', accept: ['The Verve'] },
  { letter: 'V', category: 'Pop', clue: "Cantautore australiano di 'Riptide'", answer: 'Vance Joy', accept: ['Vance'] },
  { letter: 'V', category: 'Rock', clue: "Singolo dei Coldplay del 2008 ispirato a un re decaduto", answer: 'Viva la Vida' },
  { letter: 'V', category: 'Rock', clue: "Band indie USA di 'A-Punk'", answer: 'Vampire Weekend' },

  // ============================== W ==============================
  { letter: 'W', category: 'Pop', clue: "Voce immensa di 'I Will Always Love You' (1992)", answer: 'Whitney Houston', accept: ['Whitney'] },
  { letter: 'W', category: 'Hip Hop', clue: "Collettivo di New York, album '36 Chambers' (1993)", answer: 'Wu-Tang Clan', accept: ['Wu Tang', 'Wu-Tang'] },
  { letter: 'W', category: 'Rock', clue: "Band power-pop di 'Buddy Holly' e 'Island in the Sun'", answer: 'Weezer' },
  { letter: 'W', category: 'Producer', clue: "Produttore e leader dei Black Eyed Peas", answer: 'will.i.am', accept: ['william', 'will i am'] },
  { letter: 'W', category: 'Rap', clue: "Rapper di 'See You Again' con Charlie Puth", answer: 'Wiz Khalifa', accept: ['Wiz'] },
  { letter: 'W', category: 'Pop', clue: "Boy band irlandese di 'My Love' e 'Flying Without Wings'", answer: 'Westlife' },
  { letter: 'W', category: 'Rock', clue: "Duo rock di Detroit di 'Seven Nation Army'", answer: 'White Stripes', accept: ['The White Stripes'] },
  { letter: 'W', category: 'Pop', clue: "Brano simbolo delle Spice Girls del 1996", answer: 'Wannabe' },
  { letter: 'W', category: 'Hip Hop', clue: "Ex Fugees, producer di 'Hips Don't Lie'", answer: 'Wyclef Jean', accept: ['Wyclef'] },

  // ============================== X ==============================
  { letter: 'X', category: 'Cultura musicale', clue: "Celebre talent show musicale televisivo", answer: 'X Factor' },
  { letter: 'X', category: 'Rap', clue: "Rapper USA di 'X Gon' Give It to Ya', anche attore", answer: 'Xzibit' },
  { letter: 'X', category: 'R&B', clue: "Singolo del 2013 di Beyoncé dall'omonimo album", answer: 'XO' },
  { letter: 'X', category: 'Rock', clue: "Storica heavy metal band giapponese", answer: 'X Japan' },
  { letter: 'X', category: 'Rock', clue: "Band new wave britannica di 'Senses Working Overtime'", answer: 'XTC' },
  { letter: 'X', category: 'Rap', clue: "Rapper della Florida di 'Sad!', singolo numero uno nel 2018", answer: 'XXXTentacion', accept: ['XXXTentacion', 'X', 'XXX Tentacion'] },

  // ============================== Y ==============================
  { letter: 'Y', category: 'Pop', clue: "Gruppo synth-pop britannico di 'King', voce Olly Alexander", answer: 'Years & Years', accept: ['Years and Years'] },
  { letter: 'Y', category: 'Rock', clue: "Singolo dei Coldplay del 2000 sulle stelle gialle", answer: 'Yellow' },
  { letter: 'Y', category: 'Colonne sonore', clue: "Compositore della colonna sonora di 'Il favoloso mondo di Amélie'", answer: 'Yann Tiersen', accept: ['Yann'] },
  { letter: 'Y', category: 'Rap', clue: "Rapper di Atlanta di 'Lifestyle' e 'Pick Up the Phone'", answer: 'Young Thug', accept: ['Young'] },
  { letter: 'Y', category: 'Rock', clue: "Cantante britannico ribelle di 'Loner'", answer: 'Yungblud' },
  { letter: 'Y', category: 'Pop', clue: "Singolo di James Blunt del 2005", answer: "You're Beautiful", accept: ['Youre Beautiful'] },

  // ============================== Z ==============================
  { letter: 'Z', category: 'Cantanti italiani', clue: "Bluesman roco di 'Senza una donna'", answer: 'Zucchero' },
  { letter: 'Z', category: 'EDM', clue: "DJ russo-tedesco di 'Clarity' e 'Stay'", answer: 'Zedd' },
  { letter: 'Z', category: 'Pop', clue: "Ex One Direction solista di 'Pillowtalk'", answer: 'ZAYN', accept: ['Zayn'] },
  { letter: 'Z', category: 'Pop', clue: "Cantante svedese di 'Lush Life' e 'Never Forget You'", answer: 'Zara Larsson', accept: ['Zara'] },
  { letter: 'Z', category: 'Rock', clue: "Singolo del 1994 dei Cranberries contro la violenza", answer: 'Zombie' },
  { letter: 'Z', category: 'Rock', clue: "Band rock barbuta del Texas di 'Gimme All Your Lovin''", answer: 'ZZ Top' },
]

// Alfabeto di gioco, nell'ordine obbligatorio richiesto (A -> Z).
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
