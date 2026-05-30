# 🔮 AI Mission Control & Kassi Tarot Hub

An Awwwards-tier, premium mystical dashboard and full-stack software system built with **Next.js 16.2 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**. 

It serves as the local and remote control panel for your AI Agent workflows, bidirectionally synchronized with your Obsidian Second Brain (**The Volt**), integrated with an immersive client-facing Tarot portal, and loaded with an automated Instagram Content Studio.

---

## 📸 Core Modules

### 1. Kassi Tarot Portal (`/kassi-tarot`)
A luxury, high-end, immersive web experience designed with **celestial aesthetics** (Obsidian Purple, Gold Leaf Accents, and CSS Film Grain texture). 
* **3D Card Shuffling:** Realistic 1.8s kinetic shuffle with full 3D card flips.
* **Astrological Interactive Dials:** Concentric celestial compass elements rotating slowly in response to client interactions.
* **Interactive Crystal Ball:** Built in pure CSS/Tailwind, simulating glowing plasma flows, particle sparkles, and magical bursts on tap to consult the Arcana.
* **Bidirectional Obsidian Booking:** Submitting a reading request dynamically writes a structured task into your local Obsidian Vault at `/The Volt/Tarot`.

### 2. Instagram Carousel Studio (`/tarot-carousels.html`)
An automated design playground tailored to **Cassie's Instagram channel**. It maps rich Hebrew content into Awwwards-tier 1080x1080 slides.
* **Imagen 4.0 Art Integration:** Fully integrated with Google's state-of-the-art Imagen 4.0 model to generate breathtaking mystical cover art and asset slides.
* **One-Click Post Caption Copy:** Includes fully drafted, high-engagement Hebrew copywriting templates for each slide deck, ready to copy and paste to Instagram.
* **Four Curated Decks:**
  1. *12 Stages of the Hero's Journey (מסע הגיבור)*
  2. *The Four Elements & Suits (ארבעת היסודות)*
  3. *Minor Arcana Formulas (נוסחת הארקנה הזוטרה)*
  4. *The Cosmic Spread (פריסת קשר קוסמי עם היקום)*

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 16.2 (App Router + Turbopack)
* **Frontend:** React 19, Tailwind CSS v4, TypeScript
* **Animations:** Pure CSS Keyframes, hardware-accelerated transitions, custom bezier springs (`cubic-bezier(0.16, 1, 0.3, 1)`)
* **Assets:** Rider-Waite High-Res Tarot Deck symlinked from `/Users/yurismacbook/the volt/The Volt/Tarot/טארות - ריידר וויט` into `public/tarot-deck`
* **Local Databases:** SQLite (`.od/app.sqlite`), Obsidian Markdown files (`The Volt`), and local `.env` credential pool

---

## 🚀 Getting Started

### Prerequisites
Make sure Node.js ≥ 18 is installed.

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/yurinzon/mission-control.git
cd mission-control
npm install
```

### Running the Development Server
Launch the development server:
```bash
npm run dev
```

Open [http://localhost:3000/kassi-tarot](http://localhost:3000/kassi-tarot) in your browser to experience the magic.

---

## 🪐 Deployment on Vercel
This repository is production-ready for instant, free deployments on the **Vercel Platform**:
1. Go to [vercel.com](https://vercel.com) and import the `yurinzon/mission-control` repository.
2. Configure your environment variables (e.g., `GOOGLE_API_KEY`, `DISCORD_TOKEN`).
3. Click **Deploy**. Vercel will automatically build, optimize, and serve your Kassi Tarot website globally with automatic SSL.

---

## 🛡️ License & Credits
Apache-2.0. Built with elite, double-bezel spatial design under the stewardship of **Hermes Agent**.
