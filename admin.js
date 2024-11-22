// Imposta il token segreto (da modificare in produzione)
const SECRET_TOKEN = 'mia-password-segreta';

// Funzione per recuperare e visualizzare i risultati
async function fetchResults() {
  try {
    const response = await fetch('http://localhost:3000/results', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SECRET_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Accesso non autorizzato');
    }

    const results = await response.json();

    // Recupera la tabella
    const resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

    // Svuota la tabella
    resultsTable.innerHTML = '';

    // Aggiungi i risultati alla tabella
    results.forEach(result => {
      const row = resultsTable.insertRow();
      row.insertCell(0).textContent = result.option;
      row.insertCell(1).textContent = result.votes;
    });
  } catch (error) {
    alert('Non sei autorizzato a visualizzare i risultati o si è verificato un errore.');
    console.error('Errore:', error);
  }
}

// Carica i risultati quando la pagina è pronta
window.onload = fetchResults;
