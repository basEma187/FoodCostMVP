# FoodCost MVP

> Strumento digitale per calcolare il costo reale di ogni piatto — dagli ingredienti al costo finale, inclusi personale ed energia. Tutto nel browser, senza server.

---

## A cosa serve

Se lavori in cucina sai già che conoscere il **food cost** di un piatto significa sapere quanto ti costa davvero produrlo. Questo strumento ti permette di:

- costruire il tuo **catalogo ingredienti** con i prezzi aggiornati al kg
- comporre le tue **ricette** e vedere il costo in tempo reale, grammo per grammo
- salvare le tue **preparazioni di base** (fondo bruno, salse, impasti…) e riutilizzarle nelle ricette senza doverle reinserire ogni volta
- calcolare il costo del **personale e dell'energia** in base al tempo di preparazione
- **caricare una foto di una bolla o fattura** e lasciare che il sistema estragga automaticamente gli ingredienti, pronti da confermare e salvare nel catalogo

---

## Come funziona

### 1. Catalogo ingredienti
Inserisci i tuoi ingredienti con il prezzo al kg. Tutto viene normalizzato in chilogrammi, anche i liquidi — così i calcoli sono sempre coerenti.

### 2. Ricette
Aggiungi ingredienti dal catalogo con la grammatura che usi nella ricetta. Il costo si calcola in automatico:

```
costo ingrediente = prezzo al kg × grammi usati ÷ 1000
```

Puoi includere anche le tue **preparazioni di base** come se fossero un singolo ingrediente, con il costo già computato al loro interno.

### 3. Preparazioni di base (sotto-ricette)
Il fondo bruno, la béchamel, il brodo — le fai sempre con gli stessi ingredienti. Salvale una volta contrassegnandole come "Preparazione base", riusale ovunque come qualsiasi altro ingrediente.

### 4. Costi fissi
Nelle **Impostazioni** inserisci:
- costo dell'energia elettrica (€/kWh)
- numero di dipendenti e stipendio medio mensile

Per ogni ricetta puoi indicare il **tempo di preparazione** e il sistema aggiunge automaticamente il costo del personale e dell'energia al totale:

```
costo_personale  = (stipendio_medio × n_dipendenti ÷ 160) × ore_preparazione
costo_energia    = potenza_kW × ore_preparazione × costo_kWh
food_cost_totale = Σ ingredienti + costo_personale + costo_energia
```

### 5. Caricamento documenti con OCR
Scatta una foto alla bolla del fornitore o alla fattura e caricala nella sezione **Documenti / OCR**. Il sistema legge il documento, ti propone gli ingredienti in una tabella modificabile — tu verifichi, aggiusti i prezzi se necessario, e confermi. Il catalogo si aggiorna in un click.

Due modalità disponibili (configurabili nelle Impostazioni):
- **Tesseract.js** — funziona completamente offline, zero costi, nessuna API key
- **GPT-4o Vision** — maggiore accuratezza su documenti complessi, richiede una API key OpenAI personale

---

## Stack tecnico

| Tecnologia | Uso |
|---|---|
| **Angular 21** (standalone, signals, OnPush) | Framework UI |
| **Tailwind CSS v4** | Stili |
| **LocalStorage** | Persistenza dati (no backend) |
| **Tesseract.js** | OCR offline |
| **GPT-4o Vision** | OCR avanzato (opzionale) |

I dati vengono salvati localmente nel tuo browser — nessun dato viene inviato a server di terze parti, a meno che non si utilizzi il provider GPT-4o.

---

## Avvio rapido

```bash
# Installa dipendenze
npm install

# Avvia in modalità sviluppo
ng serve

# Build di produzione
ng build
```

Apri `http://localhost:4200` nel browser.

---

## Struttura del progetto

```
src/app/
  core/
    models/          # Interfacce TypeScript (Ingredient, Recipe, AppSettings)
    services/
      storage.ts     # Astrazione LocalStorage
      food-cost.ts   # Formule di calcolo
      ocr.ts         # Tesseract.js / GPT-4o Vision
  features/
    catalog/         # CRUD ingredienti
    recipes/         # Ricette + preparazioni base
    settings/        # Costi fissi + configurazione OCR
    documents/       # Upload documento + review + importazione
```

---

## Roadmap

- [x] Scaffolding Angular + routing lazy
- [x] Modello dati (Ingredient, Recipe, SubRecipe, AppSettings)
- [x] Catalogo ingredienti CRUD
- [x] Costruttore ricette con calcolo costo live
- [x] Preparazioni di base annidate nelle ricette
- [x] Pannello impostazioni (costi fissi + API key OCR)
- [x] Upload immagine/PDF + OCR + review e conferma
- [ ] Esportazione food cost in PDF / foglio di calcolo
- [ ] Storico prezzi ingredienti
- [ ] Multi-utente con autenticazione

---

## A chi è rivolto

Questo è un **MVP** — un prototipo funzionante pensato per validare il flusso di lavoro con utenti reali prima di investire in un backend completo.

Pensato per: chef, responsabili di cucina, food & beverage manager, consulenti di ristorazione.
