# Indicatori dello stato finale sulle mosse valide

## Modifica
- Sostituire il tondo viola sulle caselle libere raggiungibili con un indicatore grafico.
- Mostrare quattro segnaposto distinti: `E`, `M`, `T` e `MT` quando la destinazione permette di scegliere tra M e T.
- Determinare l'indicatore usando le stesse scelte legali già usate per eseguire la mossa, così il suggerimento resta corretto anche durante uno scacco.
- Lasciare invariati selezione, catture, animazioni e controlli da tastiera.

## Dettagli tecnici
- Aggiungere quattro piccole risorse grafiche sostituibili nella cartella degli asset.
- Visualizzarle al centro della casella valida, senza intercettare click o alterare le dimensioni della plancia.
- Verificare il risultato in una partita locale e controllare che non compaiano errori.
