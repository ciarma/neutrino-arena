# Cursore tastiera colorato e scelta M/T

## Modifiche
- Colorare l'indicatore della cella selezionata in giallo o viola secondo il giocatore di turno.
- Quando si apre la scelta M/T, usare le frecce sinistra/destra per spostare l'evidenziazione tra le due immagini.
- Confermare lo stato evidenziato con Invio.
- Conservare Backspace per chiudere la scelta e tornare alla selezione precedente.

## Dettagli tecnici
- Gestire un indice dedicato alla scelta M/T e azzerarlo all'apertura del menu.
- Riutilizzare il colore semantico del turno sia sulla plancia sia sul bordo del pulsante M/T attivo.
- Verificare il flusso completo da tastiera e il risultato su schermo.
