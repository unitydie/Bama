🍏 BAMA Smoothie Webapp

En avansert webapplikasjon som viser BAMA sine smoothies og lar deg legge til nye produkter gjennom et administrasjonspanel.
Løsningen støtter offline-bruk, har lys/mørk modus, og bruker Remove.bg API for å automatisk fjerne bakgrunnen på bilder.

🧩 Funksjonalitet

Viser produkter fra et mock-API (data.json)

Kombinerer data fra localStorage (admin-panel)

3D-karusell for visning av smoothies

Eget adminpanel (admin.html) med:

Legg til, slett og rediger smoothies (mock-CRUD)

Automatisk fjerning av bildebakgrunn via Remove.bg API

Offline-støtte via Service Worker

Tilgjengelighetsvennlig design (alt-tekst, kontrast, tastaturnavigasjon)

Lys og mørk visning (brukerens valg lagres lokalt)

📘 Brukerveiledning
🧃 Hvordan bruke adminpanelet

Gå til nettsiden
👉 https://www.bama.no/produkter/smoothies/

Kopier bilde-URL til ønsket smoothie (høyreklikk → Kopier bildeadresse)

Åpne admin.html i prosjektet ditt

Fyll ut feltene:

Navn – navnet på smoothien

Ingredienser – hva den inneholder

Bilde (URL) – lenken du kopierte fra BAMA

Trykk «Legg til»
→ Bildet sendes automatisk til Remove.bg
→ Bakgrunnen fjernes
→ Produktet lagres i localStorage

Åpne index.html og trykk Ctrl + Shift + R
(hard refresh) for å vise de nye produktene i karusellen.


/ (prosjektmappe)
│
├── index.html           → Hovedside med karusell
├── admin.html           → Adminpanel (mock-CRUD)
├── styles.css           → Felles stilark
├── script.js            → Hovedlogikk og funksjoner
├── data.json            → Mock-data for standard smoothies
├── service-worker.js    → Offline-støtte
└── README.md            → Dokumentasjon

🧠 Teknisk forklaring
Datakilde

Produktene lastes fra data.json

Nye produkter fra adminpanelet lagres i localStorage

Ved lasting av siden kombineres begge kilder

Offline-funksjon

En service worker cacher alle nødvendige filer første gang siden lastes

Applikasjonen fungerer deretter også uten internett

Tilgjengelighet

Alle bilder har alt-tekst

Tastaturnavigasjon er aktiv

Lys/mørk-modus med høy kontrast (WCAG 2.1)

Fokusstiler på interaktive elementer


🌐 API-integrasjon

Bruker Remove.bg API
 for å automatisk fjerne bakgrunnen fra bilder.
API-nøkkelen legges inn i admin.html



🧪 Teknologier brukt
Teknologi	Formål
HTML5 / CSS3 / JavaScript	Grunnstruktur og funksjonalitet
localStorage API	Mock-database for smoothies
Fetch API	Henter data fra mock-API
Remove.bg API	Automatisk bakgrunnsfjerning
Service Worker	Offline-støtte
Font Awesome	Ikoner
📷 Skjermbilder og testing

Applikasjonen fungerer også uten internett (offline-modus testet)

Adminpanelet lagrer data lokalt

Karusellen oppdateres dynamisk etter oppdatering

Bakgrunn fjernes automatisk via API (visuelt bekreftet)

💬 Refleksjon

Prosjektet viser hvordan man kan bygge en profesjonell webapp uten backend,
ved å bruke moderne nettleser-API-er (LocalStorage, Service Worker, Fetch).

Utfordringen var å kombinere dynamisk data fra data.json og brukerens egne produkter,
men løsningen ble stabil etter at datahåndtering og caching ble strukturert.

Gjennom arbeidet har jeg lært:

Hvordan mocke et API lokalt

Hvordan kombinere API-data og brukerdata

Hvordan legge til offline-støtte

Hvordan bruke Remove.bg API

Hvordan sikre universell utforming og WCAG-kompatibilitet


👨‍💻 For å teste offline

Åpne index.html

Trykk F12 → Network → Velg «Offline»

Oppdater siden
→ Applikasjonen skal fremdeles fungere.

📍 Kort oppsummering av bruk

Åpne admin.html, legg til ny smoothie via bilde-URL fra
https://www.bama.no/produkter/smoothies/
.
Bildet får automatisk fjernet bakgrunn via API, og produktet vises i karusellen
etter oppdatering (Ctrl + Shift + R).
