# 🧭 Catholic Religious Houses Directory (US & North America)

A modern, fast, and comprehensive directory and interactive mapping platform for Catholic religious houses (monasteries, abbeys, convents, friaries, priories, and oratories) across the United States and North America, spanning the Latin Church (Roman Rite) and Eastern Catholic *sui iuris* Churches (Byzantine, Maronite, Ukrainian, Melkite, etc.).

---

## ✨ Features

- **Dual Views:** Seamless toggle between an informative **List View** and a geospatial **Interactive Map View**.
- **Comprehensive Search:** Full-text live search across monastery names, religious orders, states, cities, charisms, rites, and notes.
- **Dynamic Multi-Filtering:**
  - **State / Province:** Filter to any US state or province.
  - **Church Rite:** Latin (Roman Rite), Ruthenian Byzantine, Ukrainian Greek, Maronite, Romanian, Melkite, etc.
  - **Gender:** Men's Houses vs. Women's Houses.
  - **Status / Charism:** Cloistered & Contemplative vs. Apostolic & Active.
- **Smart Sorting:** Sort by Name (A-Z / Z-A), Year Founded (Oldest / Newest first), or State.
- **Interactive Map:** Powered by Leaflet.js with auto-bounds fitting, custom popups, and direct Google Maps navigation links.
- **Dedicated Detail Pages:** Static Site Generated (SSG) individual pages for each religious house with structured JSON-LD (`PlaceOfWorship`) metadata for rich SEO.
- **Data Validation Suite:** Built-in validation script to ensure data integrity and coordinate bounding accuracy.

---

## 🚀 How to Run

### Option 1: Next.js Modern Web App (Recommended)

```bash
cd app
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:
```bash
cd app
npm run build
npm run start
```

### Option 2: Data Audit & Validation Pipeline

To validate dataset health, check coordinate boundaries, and test for missing fields:
```bash
node scripts/validate_and_enrich.js
```

To re-generate or enrich the dataset:
```bash
node scripts/generate_directory.js
```

### Option 3: Standalone Static HTML

You can also open `index.html` directly in any web browser or serve it using:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 📂 Project Structure

```
ReligiousDirectory/
├── app/                        # Next.js 14 App Router application
│   ├── app/
│   │   ├── layout.tsx          # Root HTML layout with Leaflet CDN & metadata
│   │   ├── page.tsx            # Server Component loading verified houses data
│   │   ├── DirectoryClient.tsx # Client Component with search, filters & cards
│   │   ├── MapView.tsx         # Leaflet Map Component with dynamic auto-bounds
│   │   ├── monastery/[id]/     # Dynamic SSG page for individual religious houses
│   │   └── types.ts            # TypeScript interfaces with null safety
│   ├── data/
│   │   └── monasteries.json    # Production JSON dataset
│   └── package.json
├── scripts/
│   ├── generate_directory.js   # Dataset generation & enrichment script
│   └── validate_and_enrich.js  # Schema & geospatial validation test suite
├── monasteries.json            # Synchronized root dataset
├── index.html                  # Standalone static HTML entry point
├── script.js                   # Standalone client logic with XSS protection
├── styles.css                  # Stylesheet
└── README.md                   # Project documentation
```