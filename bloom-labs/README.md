# Bloom Labs

AI-powered investing tools that teach you as you grow. Built with Next.js, Tailwind CSS, and Supabase.

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase
- **Deployment**: Vercel

## Deploy to Vercel

1. Push this directory to a Git repository
2. Import the repository on [vercel.com](https://vercel.com)
3. Set the environment variables from `.env.example`
4. Deploy

## Project Structure

```
bloom-labs/
├── pages/
│   ├── _app.tsx          # App wrapper
│   ├── _document.tsx     # HTML document
│   └── index.tsx         # Landing page (13 tools, journey, pricing)
├── lib/
│   └── supabase.ts       # Supabase client
├── styles/
│   └── globals.css       # Tailwind + custom styles
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

## Landing Page Sections

1. **Hero** — Headline, CTA, social proof, floating tool cards
2. **13 Tools** — AI Stock Analyzer, Screener, Portfolio X-Ray, Risk Assessment, Technical Charts, Market Sentiment, Earnings Tracker, Smart Alerts, Sector Rotation, Options Flow, IPO Tracker, Watchlist Builder, AI Research Reports
3. **5-Step Journey** — Create account → Set goals → Explore tools → Learn → Grow
4. **Testimonials** — Social proof from users
5. **Pricing** — Free / Pro ($19/mo) / Premium ($49/mo)
6. **FAQ** — Common questions
7. **CTA** — Final conversion section

## Brand Colors

- Teal: `#34DAC2`
- Charcoal: `#25262F`
