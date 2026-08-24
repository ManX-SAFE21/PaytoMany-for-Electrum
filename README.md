# PaytoMany for Electrum

App web per preparare **tanti pagamenti Bitcoin in una volta sola**.

Scansioni i QR degli indirizzi uno dopo l'altro, decidi quanto pagare, e l'app
ti dà una lista di testo pronta da incollare nella funzione **"Paga a molti"**
di Electrum Desktop.

**Provala qui:** https://manx-safe21.github.io/PaytoMany-for-Electrum/

---

## A cosa serve

Se devi pagare dieci, venti, cinquanta persone diverse, farlo una transazione
alla volta costa tempo e commissioni. Electrum sa già mandare un solo pagamento
a molti destinatari insieme, ma vuole la lista scritta a mano.

Questa app scrive quella lista al posto tuo, leggendo i QR con la fotocamera
del telefono.

Il risultato è **una sola transazione**, quindi **una sola commissione** invece
di venti.

---

## Come si usa

L'app ha tre passi.

### 1 · Scansiona

Premi **Avvia scansione** e inquadra il primo QR. Non devi toccare niente tra un
QR e l'altro: la fotocamera resta accesa e legge di seguito.

Ogni volta che legge un indirizzo senti un **bip**, il telefono **vibra** e
compare una scritta verde con il numero progressivo. Se inquadri due volte lo
stesso indirizzo l'app te lo dice e non lo aggiunge due volte.

Puoi anche scrivere un indirizzo a mano, se serve.

### 2 · Metti gli importi

Scrivi quanti **euro** vale ogni pagamento: l'app li trasforma in satoshi al
cambio del momento e li mette su tutte le righe con **Applica a tutti**.

Ogni riga resta modificabile a mano, una per una. Le righe il cui importo era
già scritto dentro il QR restano come sono.

### 3 · Copia in Electrum

L'app genera la lista, una riga per destinatario:

```
bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4, 0.00002000
bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3, 0.00002000
```

Puoi **copiarla**, **salvarla come file .csv** o **condividerla**.

In Electrum poi: apri il menu accanto al campo **Paga a**, scegli
**Paga a molti**, incolla le righe. Electrum fa il resto — sceglie le monete,
calcola la commissione, firma e trasmette.

---

## Cosa NON fa (è voluto)

Questa app **non tocca mai i tuoi soldi**. In particolare:

- non conosce e non chiede il **seed** né le **chiavi private**
- non si collega al tuo **wallet**
- non sa quanti bitcoin hai
- non firma e non trasmette **nessuna transazione**

Fa una cosa sola: trasforma dei QR in una lista di testo. Firmare e mandare i
soldi resta un lavoro di Electrum, sul tuo computer, sotto il tuo controllo.

Questo vuol dire che l'app **non può rubarti niente**, nemmeno se qualcuno la
manomettesse. Il rischio, semmai, è un altro: che un indirizzo nella lista
venga cambiato. Per questo, prima di firmare in Electrum, **guarda gli
indirizzi sullo schermo** e controlla almeno i primi e gli ultimi caratteri di
qualcuno. È l'ultimo momento utile per accorgersene.

---

## Cosa serve

- Un telefono con fotocamera e un browser aggiornato (Chrome o Firefox).
- La pagina deve essere aperta in **HTTPS**. L'indirizzo qui sopra lo è già.
  Se apri il file salvato sul computer con doppio clic, la fotocamera **non
  parte**: è una regola del browser, non un difetto dell'app. In quel caso
  l'app te lo spiega e ti offre di scrivere gli indirizzi a mano.
- Electrum Desktop per la parte finale.

---

## Limiti di sicurezza

L'app rifiuta gli importi troppo grandi o troppo piccoli. Sono paletti pensati
per fermare un errore di battitura prima che diventi una transazione.

| Limite | Valore | Cosa succede |
|---|---|---|
| Importo dentro un QR | 0,002 BTC | il QR viene rifiutato |
| Importo di una riga | 0,005 BTC | il valore viene tagliato al massimo |
| Totale di tutti i pagamenti | 0,05 BTC | serve una conferma esplicita |
| Importo minimo (dust) | 330 satoshi | la riga viene segnata in rosso |

Si cambiano modificando quattro righe all'inizio dello script, dentro
`index.html`.

---

## Controlli sugli indirizzi

Prima di accettare un indirizzo l'app ne **verifica il codice di controllo**,
quindi un QR letto male o un indirizzo storpiato viene scartato invece di
finire nella lista.

Sono supportati tutti i formati Bitcoin in uso: quelli che iniziano per `1`,
per `3` e per `bc1` (compresi i Taproot). I QR **Lightning** vengono
riconosciuti e rifiutati con un messaggio chiaro, perché non sono pagabili con
una transazione normale.

I QR letti sono quelli generati dai normali wallet — indirizzo semplice oppure
indirizzo con importo già incluso (formato BIP21).

---

## Note

- Il file è **uno solo** (`index.html`): niente installazione, niente
  compilazione. Puoi scaricarlo e servirlo dove vuoi.
- Il cambio euro/bitcoin arriva da mempool.space, con CoinGecko come riserva.
  Se non c'è connessione, puoi scrivere i satoshi a mano.
- Il file `.csv` che salvi contiene la lista di chi paghi e quanto. Se lo mandi
  a te stesso su WhatsApp o Telegram, quella lista passa dai loro server. Per
  un uso abituale è meglio spostarlo con un cavo o con un'app di trasferimento
  locale.
- La lettura dei QR usa la libreria [jsQR](https://github.com/cozmo/jsQR).
