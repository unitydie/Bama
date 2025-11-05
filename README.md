🍏 BAMA Smoothie Webapp

En avansert webapplikasjon som viser BAMA sine smoothies og lar deg administrere produkter via et sikkert adminpanel med ekte database og API.
Løsningen ble utvidet som tilleggsoppgaver (challenge features) — blant annet med autentisering, database (SQLite) og server-backend i Express.

🧩 Funksjonalitet

✅ Viser produkter direkte fra SQLite-database
✅ Fullt fungerende Express API (/api/products)
✅ Adminpanel med innlogging (/admin-login.html)
✅ Legg til og slett smoothies i sanntid
✅ Automatisk fjerning av bildebakgrunn via Remove.bg API
✅ Beskyttet rute – kun innloggede brukere får tilgang
✅ Offline-støtte via Service Worker
✅ Lys / mørk modus
✅ Tilgjengelighetsvennlig design (WCAG 2.1)

🧠 Nye funksjoner (Challenge-utvidelse)

Disse punktene ble lagt til i denne fasen:

🧱 Node.js + Express backend
→ Kjører lokalt på http://localhost:3000
→ Henter og lagrer produkter i data.sqlite

🔐 Autentisering med cookies
→ /api/auth/login – innlogging
→ /api/auth/me – sjekker status
→ /api/auth/logout – logger ut

🗄️ Persistent database (SQLite)
→ Oppretter data.sqlite ved første kjøring
→ Importerer startdata fra public/data.json
→ Nye smoothies lagres i databasen

🧃 Adminpanel oppdatert
→ Bruker fetch('/api/products', { credentials:'include' })
→ Fungerer kun etter innlogging
→ Fjern bakgrunn via Remove.bg API automatisk

⚙️ Hvordan starte prosjektet

1️⃣ Klon repoet:

git clone https://github.com/unitydie/Bama.git
cd Bama


2️⃣ Installer avhengigheter:

npm install


3️⃣ Start serveren:

npm start


4️⃣ Åpne i nettleser:

http://localhost:3000


5️⃣ Gå til admin-login:

http://localhost:3000/admin-login.html


6️⃣ Logg inn med testbruker:

E-post: admin@bama.local
Passord: Admin123

🧃 Hvordan bruke adminpanelet

Legg til ny smoothie ved å fylle ut:

Navn

Ingredienser

Bilde (URL) → Kopier fra bama.no/produkter/smoothies

Systemet sender bildet til Remove.bg
→ Bakgrunnen fjernes automatisk
→ Produktet lagres i databasen

Oppdater siden (Ctrl + Shift + R)
→ Ny smoothie vises i 3D-karusellen på hovedsiden

📂 Prosjektstruktur
/ (prosjektmappe)
├── server.js              → Express-server med SQLite og auth
├── package.json
├── /public
│   ├── index.html         → Hovedside med karusell
│   ├── admin.html         → Adminpanel (beskyttet)
│   ├── admin-login.html   → Innloggingsside
│   ├── script.js          → Frontend-logikk
│   ├── styles.css         → Stilark
│   ├── data.json          → Startdata
│   ├── service-worker.js  → Offline-støtte
│   └── /Images            → Illustrasjoner og GIF-er
└── data.sqlite            → Database (opprettes automatisk)

| Metode   | Rute                | Beskrivelse            |
| -------- | ------------------- | ---------------------- |
| `GET`    | `/api/products`     | Hent alle produkter    |
| `POST`   | `/api/products`     | Legg til nytt produkt  |
| `DELETE` | `/api/products/:id` | Slett produkt          |
| `POST`   | `/api/auth/login`   | Logg inn               |
| `POST`   | `/api/auth/logout`  | Logg ut                |
| `GET`    | `/api/auth/me`      | Sjekk innlogget status |

| Teknologi             | Formål                           |
| --------------------- | -------------------------------- |
| **Node.js + Express** | Server og API                    |
| **SQLite3**           | Database                         |
| **Remove.bg API**     | Fjerner bakgrunn på bilder       |
| **Fetch API**         | Kommunikasjon frontend ↔ backend |
| **Service Worker**    | Offline-støtte                   |
| **Font Awesome**      | Ikoner                           |
| **CORS / Helmet**     | Sikkerhet                        |
| **dotenv**            | Miljøvariabler (API-nøkler)      |

🧩 Testing og debugging

✅ Test innlogging via /admin-login.html
✅ Legg til ny smoothie og sjekk DB (data.sqlite)
✅ Hard refresh (Ctrl + Shift + R) på hovedsiden → ny vises
✅ Test offline i DevTools → applikasjonen fungerer
✅ Sjekk Network → Remove.bg får 200 OK

💬 Refleksjon

Dette prosjektet startet som en ren frontend-løsning, men ble utvidet med ekte backend, database og autentisering som en utfordringsoppgave.
Resultatet ble en komplett webapplikasjon med realistisk arkitektur, sikkerhet og API-integrasjon.

Gjennom dette lærte jeg:

Hvordan bygge et REST API i Express

Hvordan integrere autentisering med cookies

Hvordan kombinere frontend og backend med CORS og CSP

Hvordan håndtere eksterne API-er (Remove.bg) trygt

Hvordan designe et robust adminpanel med ekte dataflyt

📍 Kort oppsummering

Start serveren → npm start

Logg inn via /admin-login.html

Legg til produkt → API håndterer Remove.bg og lagring

Gå til /index.html → se produktet i 3D-karusellen

Fungerer både online og offline
