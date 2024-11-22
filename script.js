const form = document.getElementById('voteForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const code = document.getElementById('code').value;
  const option = document.getElementById('option').value;

  // Invia richiesta al backend
  try {
    const response = await fetch('http://localhost:3000/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, option }),
    });

    const result = await response.json();

    if (response.ok) {
      messageDiv.textContent = result.message;
      messageDiv.className = 'message';
    } else {
      messageDiv.textContent = result.error;
      messageDiv.className = 'message error';
    }
  } catch (error) {
    messageDiv.textContent = 'Errore di connessione al server.';
    messageDiv.className = 'message error';
  }
});
