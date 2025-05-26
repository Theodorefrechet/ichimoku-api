require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API Ichimoku !');
});

app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (!data.client_id) {
    return res.status(400).json({ message: 'client_id manquant' });
  }

  // 1. Vérifier le statut du bot
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('bot_active')
    .eq('client_id', data.client_id)
    .single();

  if (userError) {
    console.error(userError);
    return res.status(500).json({ message: "Erreur lors de la vérification du statut du bot." });
  }

  if (!user || !user.bot_active) {
    return res.status(403).json({ message: "Bot inactif pour ce client. Signal ignoré." });
  }

  // 2. Insertion si bot actif
  const { error } = await supabase
    .from('trades')
    .insert([{
      client_id: data.client_id,
      texte_du_symbole: data.symbol,
      texte_du_signal: data.signal,
      horodatage: data.time,
      prix: data.price ? parseFloat(data.price) : null,
    }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement dans Supabase." });
  }

  res.status(200).json({ message: 'Signal enregistré pour client ' + data.client_id });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
