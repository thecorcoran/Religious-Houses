# 🧭 Catholic Religious Houses Directory (US & North America)

A comprehensive, meticulously curated directory and interactive geospatial mapping platform for Catholic religious houses (monasteries, abbeys, convents, friaries, priories, and hermitages) across the United States. Spans both the Latin Church (Roman Rite) and Eastern Catholic *sui iuris* Churches (Byzantine, Maronite, Ukrainian, Melkite, Romanian, Chaldean, etc.).

Designed following **Edward Tufte's principles of analytical design**: high data-to-ink ratio, macro/micro metric tiles, literary typography, distinct visual encodings, and direct labeling without unnecessary clutter.

---

## ✨ Features & Architecture

### 📊 Edward Tufte-Inspired Analytical Interface
- **Macro/Micro Metric Tiles:** Real-time summary sparkline metrics (Total Verified Houses, Eastern Catholic Monasteries, Latin Houses, Cloistered Communities, and Geographic State count).
- **Archival Typography & Palette:** Clean parchment backdrop (`#fffff8`), deep charcoal typography (`#111111`), oxblood accents (`#8b1e0f`), and warm amber tones (`#b45309`) utilizing *Newsreader*, *Cinzel*, and *JetBrains Mono*.
- **Unified Split Layout:** Responsive side-by-side view pairing the interactive cartographic display with dense, beautifully typeset listing entries.

### 🏛️ Deep Monastic & Lineage Metadata
- **Motherhouse & Archabbey Lineage:** Documents parent archabbeys, generalates, and motherhouses (e.g., Saint Vincent Archabbey, Grande Chartreuse, Abbaye Saint-Pierre de Solesmes, Eparchial Sees, Dominican Provinces).
- **Exhaustive Eastern Catholic Coverage:** Dedicated cataloging of Eastern Catholic monastic traditions in the US (Ruthenian Byzantine, Ukrainian Catholic, Maronite Antonine/Lebanese, Melkite, Romanian Byzantine, etc.).
- **Charisms & Status:** Delineates Cloistered / Contemplative vs. Apostolic / Active houses, as well as Men's vs. Women's communities.

### 🔎 Multi-Dimensional Search & Filtering
- **Full-Text Live Search:** Matches across monastery names, religious orders, city, state, church rite, charisms, historical notes, and motherhouse locations.
- **Smart Filter Controls:**
  - **Church Rite:** Quick-filter for all Eastern Catholic monasteries, all Latin Church houses, or specific *sui iuris* liturgical traditions.
  - **State / Province:** Dynamically populated list of US states with active religious houses.
  - **Gender:** Filter by Men's or Women's communities.
  - **Charism:** Filter by Cloistered/Contemplative or Apostolic/Active.
- **Multi-Field Sorting:** Sort alphabetically (A–Z / Z–A), chronologically by founding year (oldest/newest), or geographically by state.

### 🗺️ Open Cartography (Zero API Key Requirement)
- **OpenStreetMap & Leaflet.js:** Fast, reliable map tiles with no API key or external service dependencies required.
- **Distinctive Visual Encoding:** Color-coded SVG dot pins (Oxblood for Latin tradition, Warm Amber/Gold for Eastern Catholic tradition).
- **Dynamic Auto-Bounds:** Automatically fits zoom and coordinate bounds to currently filtered search results.
- **Direct Navigation:** One-click Google Maps directions with verified lat/long coordinates.

### 🌐 Dual Deployment Targets
- **100% Zero-Config GitHub Pages:** Fully functional standalone static site (`index.html`, `script.js`, `styles.css`) ready for hosting directly on GitHub Pages.
- **Next.js 14 Web Application:** Modern Next.js App Router setup with Static Site Generation (SSG), pre-rendered individual house pages, and Schema.org `PlaceOfWorship` JSON-LD metadata for SEO.

---

## 🚀 Getting Started

### Option 1: View on GitHub Pages (Instant)
Host directly via GitHub Pages by pointing your repository settings to the `main` branch root (`/`).

### Option 2: Run Standalone Static Site Locally
Open `index.html` directly in your browser, or run a lightweight local HTTP server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

### Option 3: Next.js 14 Application
```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To build and test the static production export:
```bash
npm run build
npm run start
```

---

## 🛠️ Data Pipeline & Validation

The project includes an automated data validation and enrichment pipeline:

```bash
# Validate data health, coordinate boundaries, unique IDs, and required fields:
node scripts/validate_and_enrich.js

# Regenerate and enrich dataset files across root and Next.js data paths:
node scripts/generate_directory.js
```

### Validation Rules Enforced:
- Schema field integrity (`id`, `name`, `religious_order`, `church_rite`, `state_province`, `country`, `is_mens_house`, `is_cloistered`).
- US Coordinate Bounding Box checks (Latitude: 18°N to 72°N, Longitude: -180°W to -65°W).
- URL format checks (`http://` / `https://`).
- Synchronized dual-target JSON output (`monasteries.json` and `app/data/monasteries.json`).

---

## 📂 Project Structure

```
ReligiousDirectory/
├── index.html                  # Edward Tufte-inspired static UI (GitHub Pages root)
├── styles.css                  # Minimalist parchment/charcoal typography & styles
├── script.js                   # Client controller: Leaflet map, filters, search & popups
├── monasteries.json            # Verified JSON dataset (66+ houses)
├── app/                        # Next.js 14 App Router application
│   ├── app/
│   │   ├── layout.tsx          # Root layout with typography and Leaflet CDN
│   │   ├── page.tsx            # Home page component
│   │   ├── DirectoryClient.tsx # Client component with interactive filters & list
│   │   ├── MapView.tsx         # Dynamic client-only Leaflet map component
│   │   ├── monastery/[id]/     # Dynamic SSG detail pages with Schema.org JSON-LD
│   │   └── types.ts            # TypeScript definitions with full null-safety
│   ├── data/
│   │   └── monasteries.json    # Synchronized dataset for Next.js app
│   └── package.json
├── scripts/
│   ├── generate_directory.js   # Master directory generation & enrichment script
│   └── validate_and_enrich.js  # Schema & geospatial validation test suite
└── README.md                   # Project documentation
```

---

## 📜 License

MIT License. Open source and free for research, pilgrimage planning, and monastic study.