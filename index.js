const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API Ichimoku !');
});

app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log('Signal reçu :', data);

  if (!data.client_id) {
    return res.status(400).json({ message: 'client_id manquant' });
  }

  res.status(200).json({ message: 'Signal reçu pour client ' + data.client_id });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
