/* Config — Paga a molti / Pay to many
   Modifica i valori qui sotto direttamente su GitHub (matita in alto a destra
   sul file), poi "Commit changes". GitHub Pages pubblica la nuova versione
   in 1-3 minuti, senza bisogno di toccare index.html.

   Le unità satoshi (sat) sono la sottounità di BTC: 100 000 000 sat = 1 BTC. */
window.APP_CONFIG = {

  // Importo in euro già scritto nel campo "Euro" al passo 2 (Importi).
  // Cambia questo numero per cambiare il valore proposto di default.
  DEFAULT_EUR: 2,

  // Massimo accettato da un singolo QR che include già un importo (BIP21).
  // Oltre questa soglia il QR viene rifiutato con un errore.
  CAP_QR_SATS: 200000,   // 200 000 sat = 0.002 BTC

  // Massimo per una singola riga inserita o modificata a mano al passo 2.
  // Oltre questa soglia il valore viene tagliato automaticamente al massimo.
  CAP_ROW_SATS: 500000,  // 500 000 sat = 0.005 BTC

  // Oltre questo totale (somma di tutte le righe), l'app chiede una
  // conferma esplicita prima di generare la lista per Electrum.
  CAP_TOTAL_SATS: 5000000, // 5 000 000 sat = 0.05 BTC

  // Sotto questa soglia un importo è "dust" (polvere): un output così
  // piccolo che la rete Bitcoin lo considera non economicamente spendibile,
  // e Electrum lo rifiuterebbe comunque. L'app lo segnala prima.
  DUST_SATS: 330

};
