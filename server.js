const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database(':memory:'); // Usa un database in memoria (puoi sostituirlo con un file)

// Creazione delle tabelle
db.serialize(() => {
  db.run(`
    CREATE TABLE voters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      used INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      option TEXT NOT NULL
    )
  `);

  // Inserisci codici di esempio
  const insert = db.prepare('INSERT INTO voters (code) VALUES (?)');
  insert.run('ABC123');
  insert.run('DEF456');
  insert.run('GHI789');
  insert.finalize();
});

// API per votare
app.post('/vote', (req, res) => {
  const { code, option } = req.body;

  // Controlla se il codice è valido e non usato
  db.get('SELECT * FROM voters WHERE code = ? AND used = 0', [code], (err, voter) => {
    if (err) {
      return res.status(500).json({ error: 'Errore del server.' });
    }

    if (!voter) {
      return res.status(400).json({ error: 'Codice non valido o già usato.' });
    }

    // Registra il voto
    db.run('INSERT INTO votes (code, option) VALUES (?, ?)', [code, option], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Errore durante il salvataggio del voto.' });
      }

      // Aggiorna il codice come usato
      db.run('UPDATE voters SET used = 1 WHERE code = ?', [code], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Errore durante l\'aggiornamento del codice.' });
        }

        res.json({ message: 'Voto registrato con successo!' });
      });
    });
  });
});

//Api per controllo voti
// Token segreto per l'accesso ai risultati

// Endpoint per ottenere i risultati
app.get('/results', (req, res) => {

  const clientIp = req.ip; // Ottieni l'indirizzo IP del client
  const allowedIps = ['127.0.0.1', '::1']; // IP consentiti (localhost)

  if (!allowedIps.includes(clientIp)) {
    return res.status(403).json({ error: 'Accesso non autorizzato' });
  }

  // Query per ottenere i risultati
  const query = `
    SELECT option, COUNT(*) as votes
    FROM votes
    GROUP BY option
    ORDER BY votes DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nel recupero dei risultati.' });
    }

    res.json(rows); // Restituisce i risultati in formato JSON
  });
});




// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
