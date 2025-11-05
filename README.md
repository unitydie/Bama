🍏 **BAMA Smoothie Webapp**

En komplett webapplikasjon som viser BAMA sine smoothies og lar deg administrere produkter og bestillinger via et sikkert adminpanel med ekte database og API.  
Prosjektet ble utvidet som *challenge features* med autentisering, database (SQLite), backend i Express, bestillingssystem og e-postvarsler.

---

## 🧩 Funksjonalitet

✅ Viser produkter direkte fra SQLite-database  
✅ Fullt fungerende Express API (`/api/products`, `/api/orders`)  
✅ Adminpanel med innlogging og sesjons-cookies  
✅ Legg til og slett smoothies i sanntid  
✅ Automatisk fjerning av bildebakgrunn via Remove.bg API  
✅ Registrering av kunde-bestillinger med lagring i DB  
✅ Automatisk e-post-varsler til kunde og administrator  
✅ Offline-støtte via Service Worker  
✅ Lys / mørk modus  
✅ Tilgjengelighetsvennlig design (WCAG 2.1)

---

## 🧱 Backend (Node.js + Express)

- Kjører lokalt på: **http://localhost:3000**
- Håndterer både produkter og bestillinger
- Bruker SQLite som vedvarende database (`data.sqlite`)
- Har autentisering med JWT + cookies
- Har CORS, Helmet og Rate-limiting for sikkerhet

---

## 🔐 Autentisering med cookies

| Rute | Metode | Beskrivelse |
|------|---------|-------------|
| `/api/auth/login` | POST | Logger inn admin |
| `/api/auth/logout` | POST | Logger ut |
| `/api/auth/me` | GET | Sjekker innloggingsstatus |

Bruker **JWT-token i cookie**, slik at admin-panelet automatisk validerer sesjonen uten at passord sendes på nytt.

---

## 🗄️ Database (SQLite)

Opprettes automatisk første gang serveren starter.

| Tabell | Beskrivelse |
|--------|--------------|
| `products` | Alle smoothies (navn, ingredienser, bilde) |
| `users` | Administratorer (e-post og passord-hash) |
| `orders` | Bestillinger fra kunder |

---

## 🧃 Adminpanel (admin.html)

- Beskyttet rute — krever innlogging via `/admin-login.html`  
- Viser tabell over alle smoothies fra databasen  
- Kan **legge til nye produkter** (Remove.bg brukes automatisk)  
- Kan **slette produkter**  
- Viser **alle kunde-bestillinger** (fra `orders`-tabellen)  
- Kan **slette bestillinger** direkte

---

## 🛒 Ny funksjonalitet: Bestillingssystem

Når kunden legger inn en bestilling på hovedsiden (`index.html`):

1. Skjemaet i modalen sender en `POST /api/orders` til serveren.  
2. Serveren lagrer bestillingen i tabellen `orders` med alle felter:  
   – produktnavn, navn, e-post, telefon, antall, adresse, kommentarer, tidspunkt.  
3. Administrator kan se alle bestillinger i admin-panelet.  
4. (Challenge 2) Serveren sender automatisk e-post:
   - 📩 til **kunden** – bekreftelse på bestilling  
   - 📧 til **admin** – varsel om ny ordre  

---

## 📬 E-postintegrasjon (Nodemailer + Gmail App Password)

For å aktivere varsler:

1️⃣ Aktiver **2-trinnsbekreftelse** i Google-kontoen.  
2️⃣ Gå til [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)  
3️⃣ Opprett nytt «App-passord» for *Mail → Other (Custom name)*  
4️⃣ Legg til i `.env`-filen:

log pass mail .env file


Serveren bruker Nodemailer til å sende e-post gjennom Gmail.  
Når en ordre opprettes, sendes automatisk:

- **Til kunde:** «Takk for din bestilling hos BAMA Smoothies!»  
- **Til admin:** «Ny bestilling mottatt – se detaljer i adminpanelet.»

---

## ⚙️ Hvordan starte prosjektet

```bash
Set-ExecutionPolicy Unrestricted -Scope Process

# 1️⃣ Klon repoet
git clone https://github.com/unitydie/Bama.git
cd Bama

# 2️⃣ Installer avhengigheter
npm install

# 3️⃣ Start serveren
npm start


Deretter:

🟢 Brukergrensesnitt:
👉 http://localhost:3000

🟢 Adminpanel:
👉 http://localhost:3000/admin.html

🟢 Innlogging:
👉 http://localhost:3000/admin-login.html

Login:

E-post: admin@bama.local
Passord: Admin123!

🧃 Hvordan bruke adminpanelet

1️⃣ Logg inn
2️⃣ Legg til ny smoothie (navn, ingredienser, bilde-URL)
3️⃣ Systemet sender bildet til Remove.bg
4️⃣ Bakgrunnen fjernes automatisk
5️⃣ Produktet lagres i databasen
6️⃣ Oppdater hovedsiden → produktet vises i 3D-karusellen

Bestillinger:

Nye ordrer fra kunder vises automatisk i adminpanelet

Admin kan slette bestillinger

Kunde og admin mottar e-postvarsler

📂 Prosjektstruktur
/ (prosjektmappe)
├── server.js              → Express-server (API, DB, e-post)
├── data.sqlite            → Database
├── .env                   → API-nøkler og Gmail-passord
├── package.json
├── /public
│   ├── index.html         → Hovedside (bestilling)
│   ├── admin.html         → Adminpanel
│   ├── admin-login.html   → Innlogging
│   ├── script.js          → Frontend-logikk
│   ├── styles.css         → Design
│   ├── data.json          → Startdata
│   └── service-worker.js  → Offline-støtte

🧪 Testing

✅ Test innlogging via /admin-login.html
✅ Legg til og slett produkter
✅ Opprett bestilling på hovedsiden
✅ Sjekk at ordren vises i adminpanelet
✅ Se e-postvarsel i Gmail
✅ Test offline i DevTools (Network → Offline)

💬 Refleksjon

Dette prosjektet viser en komplett løsning fra frontend til backend.
Det kombinerer sikker autentisering, database-operasjoner, fil- og API-håndtering, samt sanntids-oppdatering av UI.

Gjennom arbeidet lærte jeg:

Hvordan bygge REST-API i Express

Hvordan integrere SQLite som lettvekts-database

Hvordan bruke JWT + cookies for sesjoner

Hvordan koble Remove.bg API og sende filer

Hvordan sende e-post med Nodemailer

Hvordan sikre applikasjonen med Helmet og rate-limiting

Hvordan lage et ekte adminpanel for CRUD- og ordre-håndtering



| Handling         | Hva skjer                              |
| ---------------- | -------------------------------------- |
| Start server     | `npm start`                            |
| Åpne siden       | `http://localhost:3000`                |
| Bestill smoothie | Lagres i DB + e-post til kunde & admin |
| Logg inn         | `/admin-login.html`                    |
| Se ordrer        | `/admin.html`                          |
| Offline          | Full funksjonalitet via Service Worker |

✨ Ferdig resultat:
En sikker, komplett webapp for BAMA Smoothies med backend, autentisering, bestillinger og e-postvarsling.




