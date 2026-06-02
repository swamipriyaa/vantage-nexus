# Vantage | Market Intelligence & B2B Lead Discovery Suite

Vantage is a high-performance market intelligence dashboard designed to help venture teams, product directors, and founders map competitive landscapes, evaluate strategic feature gaps, and discover qualified target B2B accounts.

The application operates in two modes:
1. **Interactive Blueprint Mode (Preset Studies)**: Browse 6 pre-seeded industry templates spanning SaaS, Cleantech, IoT, DevTools, Web3, and Healthtech with high-density comparative tables and account databases.
2. **Generative Intelligence Mode (Live Query Feeds)**: Enter an **Enterprise Data Feed License Key** in the settings panel to run a real-time competitor and lead query for any custom concept. Vantage queries the market feed database (via client-side `gemini-2.5-flash` secure connections using native structural JSON output schemas) to return custom profiles instantly.

---

## 🛠️ Architecture & Tech Stack

* **Frontend Framework**: **React 19** + **Vite 8**
  * Near-instantaneous bundling and high-speed development server.
  * Memoized layout states controlling navigation, pipeline criteria, and loader indicators.
* **Styling Engine**: **Vanilla CSS (CSS Variables & HSL Systems)**
  * Clean, standard HSL variables forming Obsidian dark backgrounds, glowing cards, and micro-interactions.
  * Custom print-optimized layout styling (`@media print`) that formats the dashboard pages into clean, multi-page business briefs when printing to PDF.
* **Interactive Charting Engine**: **Handcrafted SVG & CSS Charts**
  * Custom SVG charts that completely bypass bulky external packages to avoid dependency conflicts.
  * Delivers highly custom glowing scatter positioning quadrants, real-time tooltip coordinates, feature gap analysis progress bars, and pricing bars.
* **Service Integrations**: **Native Browser Fetch (Vantage Secure API)**
  * Direct browser queries to `generativelanguage.googleapis.com` using a secure client-side license settings drawer.
  * Uses Gemini's native JSON output mode (`responseMimeType: "application/json"`) to guarantee exact matching of the dashboard data schemas with zero text wrapping errors.

---

## 🌐 Data Sources Used

1. **Structured Corporate Blueprints**: Handcrafted from standard market benchmarks for 6 active corporate sectors to represent highly realistic startup datasets.
2. **Registry Data Aggregation**: Real-time synthesis of target markets, competitor pricing, feature matrices, and target decision-makers utilizing direct model indexes.

---

## 🎨 Key Design Decisions

1. **Secure Local Persistence**: To protect developer security, license keys are entered locally and stored strictly within the browser's `localStorage` namespace. Keys never touch a secondary server.
2. **Zero-Dependency Vector Charting**: Plotting positioning scatter matrices and gap analyses directly in SVG elements guarantees pixel-perfect rendering and eliminates package-conflict risks.
3. **Memoized Search & Filter Pipeline**: The lead discovery grid is powered by a high-speed React query filter, supporting search keywords, sector lookups, and score thresholds on-the-fly.
4. **Typographic Polish (De-AI-fying)**: Purged all generic emoji clutters and artificial "AI" buzzword prefixes, shifting all copywriting to a direct, professional, and corporate tone.

---

## ⚠️ Assumptions & Limitations

1. **Client-Side API Usage**: The application executes queries directly to `generativelanguage.googleapis.com` via browser `fetch`. While this simplifies infrastructure, it assumes the client has network access to Google APIs and stores the API key securely inside the browser's local `localStorage`.
2. **Model Synthesis Boundary**: Competitor coordinates, feature checkmarks, and target account match scores are synthesized in real-time by `gemini-2.5-flash`. Data currency is bounded by the model's indexing limits and the fidelity of the startup concept prompt.
3. **No Server-Side Database**: Research presets and custom concept feeds are kept strictly in the client-side session. There is no central database to archive, retrieve, or collaborate on generated reports.

---

## 🔮 Future Improvements

1. **Interactive Outreach Pitch Generator**: Add a dynamic cold-pitch copywriter button next to each discovered B2B lead to draft personalized business emails based on the decision-maker's role and relevance parameters.
2. **Secure Proxy Backend**: Migrate the Gemini API client endpoint to a serverless backend proxy to completely hide API license keys from the client-side network inspect tabs.
3. **Third-Party API Integrations**: Direct connect with live registries like Crunchbase, Hunter.io, and LinkedIn APIs to verify synthesized contact endpoints in real-time.
4. **Historical Dossier Tracking**: Implement local arrays to cache recent custom audits, letting founders toggle between multiple analysis concepts instantly.

---

## ⚙️ Setup & Launch Instructions

### Prerequisites
Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed on your system.

### 1. Installation
Navigate into the project directory and install all dependencies:
```bash
cd competitor-analyzer
npm install
```

### 2. Run the Development Server
Launch the application locally in development mode:
```bash
npm run dev
```
Open the local address printed in the console (usually `http://localhost:5173`) in your browser to interact with the dashboard.

### 3. Production Build & Verification
Compile the application to highly optimized production bundles:
```bash
npm run build
```
Vite will output all compiled assets into the `dist/` directory, ready to be hosted on Vercel, Netlify, or AWS.

### 4. Deploying to Vercel
Deploying the project takes seconds with the Vercel CLI:
```bash
npx vercel
```
Or connect your GitHub repository directly in the Vercel Dashboard for automated Git-based deployment.
