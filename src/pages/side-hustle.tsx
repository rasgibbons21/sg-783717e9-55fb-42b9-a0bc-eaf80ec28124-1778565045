/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { AdMobBanner } from "@/components/AdMobBanner";
import {
  ArrowLeft, ChevronRight, ChevronDown, Check, Lock, Sparkles,
  Rocket, Clock, Trophy, Star, ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };
const db = supabase as any;

const AFF = {
  printful: "https://www.printful.com/a/15445304:2d5a171a1afa43c096fed6f4ae840550",
  printify: "https://try.printify.com/mjan5t89wn7f",
  hostinger: "https://www.hostinger.com?REFERRALCODE=K6ZBREAKTHFA",
  tiktok: "https://getstartedtiktok.partnerlinks.io/272zlcx1b9wq",
};

const C = {
  bg: "#0E1B30",
  card: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.06)",
  accent: "#27B7C8",
  green: "#49B06E",
  text: "#F4F7FA",
  textDim: "rgba(244,247,250,0.6)",
  textMuted: "rgba(244,247,250,0.35)",
};

// ─── Types ──────────────────────────────────────────────────────────────────

type HustleType = "dropshipping" | "tiktok_shop" | "ugc" | "digital_products" | "freelancing" | "content_creator";

interface HustleStep {
  step: number;
  title: string;
  summary: string;
  content: string;
  actions: string[];
  links?: { label: string; url: string }[];
  pansyTip: string;
  lexiTip?: string;
  time: string;
}

interface HustleInfo {
  type: HustleType;
  title: string;
  emoji: string;
  subtitle: string;
  color: string;
  earnings: string;
  pansyIntro: string;
  steps: HustleStep[];
}

// ─── Lexi — The Hustle Coach ────────────────────────────────────────────────
// Lexi is the side hustle specialist. While Pansy is the warm, encouraging mentor,
// Lexi is the no-BS hustler friend who's been in the trenches. She gives the
// real talk — what actually works, common scams to avoid, and the mindset it takes.

const LEXI_TIPS: Record<string, string[]> = {
  dropshipping: [
    "Real talk — 90% of dropshipping stores fail because they pick a niche they don't care about. Pick something you'd actually scroll through at 2am.",
    "Spy on your competitors. Go to their stores, add stuff to cart, see their upsells. They already did the testing — learn from their playbook.",
    "Hostinger's website builder has free templates that look clean and professional. Don't spend $200 on a custom design when your store has zero products yet. Invest AFTER you validate.",
    "Write descriptions like you're texting your bestie about something fire you just found. If it sounds like a robot wrote it, it won't sell.",
    "Charge $4.99 for 'express processing' on top of free shipping. It costs you nothing and 20% of customers will pay it. Free money.",
    "Before you spend money on ads, make sure your brand looks legit. Nobody buys from a store with a pixelated logo and broken links.",
    "Your first 100 followers won't come from posting and praying. They come from engaging in OTHER people's comments first.",
    "Start with $5/day ads. I don't care what the gurus say about 'going big.' Test small, find what works, THEN scale.",
    "Your first sale might be your mom. That still counts. Screenshot it and keep going.",
    "When you fulfill orders, check the tracking. Nothing kills a store faster than a customer waiting 45 days for a $20 item.",
    "Kill your darlings. If a product has 500 views and 0 sales, it's not the right product. Test something new.",
    "The jump from $0 to $100/day is the hardest. After that, scaling is just doing more of what already works.",
  ],
  tiktok_shop: [
    "Your TikTok name matters more than you think. If someone can't find you by typing your name, you're invisible.",
    "Before selling anything, buy from TikTok Shop. The checkout experience teaches you what you want YOUR customers to feel.",
    "Apply for TikTok Shop on a weekday morning — approval seems faster. While you wait, batch-film content so you're ready to go.",
    "Always. Order. Samples. I've seen sellers list a product that looked amazing in supplier photos and was actual garbage in person.",
    "Natural lighting > ring light > no light. Film near a window between 10am-2pm and your product will look 10x better.",
    "Your first video will probably flop. Your fifth one might too. But video #11 might get 100K views. You can't skip to video #11 without posting 1-10.",
    "The algorithm rewards you for posting within your first hour of going live. People watching = the algorithm pushing your live higher.",
    "Go live even if only 3 people are watching. Those 3 people might buy. And the algorithm is watching too.",
    "Content batching is the cheat code. One afternoon of filming = a full week of content. Block it off like a meeting.",
    "Reply to EVERY customer message like they're your VIP. One bad review on TikTok Shop tanks your rankings for weeks.",
    "Affiliates are how you go from hustling to building. Let other creators sell for you while you sleep.",
    "You started with a phone and an idea. Now you have a business. Don't forget to separate your business money from personal — get a separate bank account.",
  ],
  ugc: [
    "You don't need followers to make money as a UGC creator. Brands pay for CONTENT, not clout. Read that again.",
    "Your portfolio IS your resume. If you only take one step today, film one sample video with a product you already own.",
    "Sign up for everything — Collabstr, Billo, JoinBrands, the Insense app. Cast a wide net. Your first client will come from the platform you least expect.",
    "Natural lighting near a window. Phone propped up or on a $10 tripod. Clean background. That's literally all you need. Stop using 'no equipment' as an excuse.",
    "CapCut is free and it's what the pros use. Learn it. Love it. It'll make you money.",
    "Your first 3 samples need to look GOOD, not perfect. Good enough to prove you know what you're doing. You'll level up with every real client.",
    "Send 10 pitches a day. Minimum. Most won't reply. Some will say no. One will say yes. That's all you need to start.",
    "Personalize every pitch or don't bother. 'Hi I love your brand' with nothing specific = instant delete.",
    "Never. Work. For. Free. Exposure doesn't pay rent. If a brand can afford a product to send you, they can afford to pay you.",
    "Over-deliver on your first 5 clients. Ask for testimonials. These 5 testimonials will get you your next 50 clients.",
    "Retainers turn UGC from a hustle into a career. After 2-3 great deliveries, pitch monthly packages. Recurring revenue is the dream.",
    "You're not 'just' a UGC creator — you're a content production company of one. Price accordingly.",
  ],
  digital_products: [
    "Stop waiting for the perfect product idea. Your most-asked question from friends is your first product. Package that knowledge.",
    "Check the 3-star reviews on competitor products. That's where customers tell you exactly what's missing. Build THAT.",
    "Your first product will take 10 hours. Your tenth will take 2. The learning curve is steep but short.",
    "Canva + Google Sheets + your brain = unlimited products. You don't need fancy tools.",
    "Mockups sell products. The exact same template with professional mockups outsells one with plain screenshots by 3-5x. Invest in this step.",
    "Your Etsy title is your SEO. Pack it with keywords people actually search. Not 'Cute Budget Planner' — 'Monthly Budget Planner Printable Finance Tracker Spreadsheet Template.'",
    "Price yours $2-3 above the cheapest competitor. Cheap = perceived as low quality. Your product is quality.",
    "Ask 3 friends to test your product before launch. They'll catch typos, broken links, and confusion you're too close to see.",
    "Pinterest is literally free traffic forever. A pin you post today can bring sales 2 years from now. Start pinning.",
    "The review you get from your first buyer is worth more than any ad. Follow up and ask nicely.",
    "Every new product in your shop increases the chance someone finds you through search. Aim for 10-20 products in 3 months.",
    "You just built a passive income machine. Every product you add is another stream of revenue that works while you sleep. That's the real flex.",
  ],
  freelancing: [
    "Your 'basic' skills are worth $25-75/hour to someone who doesn't have them. Stop undervaluing yourself.",
    "Packages beat hourly rates every time. Clients hate watching a clock. Give them a clear scope and price.",
    "Your Fiverr headline: sell the OUTCOME, not the service. Not 'I write blog posts' — 'I write blog posts that rank on Google.'",
    "No clients yet? Create sample work for brands you admire. That's your portfolio. It doesn't need to be 'real' client work.",
    "Keep proposals under 150 words. Nobody reads a novel. Hook them in 2 sentences, show one relevant sample, done.",
    "Apply to 10 jobs a day for 2 weeks. That's 100 applications. You'll land 3-5 clients. That's your start.",
    "Under-promise the timeline, over-deliver the quality. 'I'll have this by Friday' then deliver Wednesday = instant hero status.",
    "Ask for reviews immediately after delivery, while the dopamine is high. Wait a week and they forget.",
    "After 5 good reviews, raise your rates 25%. No explanation needed. Your work speaks for itself now.",
    "The retainer pitch after a great project: 'Want me to keep this going monthly? Here's a package that saves you the hassle of finding someone new every time.'",
    "Templates and systems are how you double your hourly rate without working more hours. Build them obsessively.",
    "You went from 'I don't know if anyone would pay me' to running a real freelance business. Plot twist: they're paying you because you're GOOD at this.",
  ],
  content_creator: [
    "Pick ONE platform and go all in for 90 days. 'I'm on everything' = 'I'm nowhere.' Focus wins.",
    "Your niche doesn't have to be unique. YOUR take on it does. A million people teach budgeting — none of them are you.",
    "Your first 20 posts will suck. Post them anyway. You can't edit your way to good content — you have to earn it through reps.",
    "Batch content creation: film 7 videos on Sunday, edit Monday, schedule for the week. That's how creators stay sane AND consistent.",
    "The algorithm isn't random — it rewards watch time. If people watch your full video, it gets pushed. Hook them in 2 seconds or they're gone.",
    "Set up affiliate links on day 1. Even with 100 followers, if one person buys through your link, that's money in your pocket.",
    "30 days of daily posting will teach you more about content than any $997 course. Just start posting.",
    "Collaborate with creators your size. You're not competing — you're co-growing. DM 3 people in your niche today.",
    "Affiliate income is the most underrated revenue stream. You're already recommending products to friends for free. Get paid for it.",
    "You don't need 100K followers for a sponsorship. Micro-influencers (1K-10K) are in demand because their audiences actually trust them.",
    "Your audience is telling you what product to create. Read your comments and DMs — they're literally handing you business ideas.",
    "An email list is the one thing no algorithm can take from you. Build it from day 1.",
  ],
};

function getLexiTip(hustleType: HustleType, stepNum: number): string {
  const tips = LEXI_TIPS[hustleType];
  if (!tips || stepNum < 1 || stepNum > tips.length) return "";
  return tips[stepNum - 1];
}

// ─── Phases ────────────────────────────────────────────────────────────────
const PHASES = [
  { name: "Foundation", steps: [1, 2, 3], desc: "Set up your base" },
  { name: "Build", steps: [4, 5, 6], desc: "Create your brand" },
  { name: "Launch", steps: [7, 8, 9], desc: "Go live & sell" },
  { name: "Scale", steps: [10, 11, 12], desc: "Grow your business" },
];

function HustleRing({ percent, size = 100, color = C.accent, label }: { percent: number; size?: number; color?: string; label?: string }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color: C.text }}>{percent}%</span>
        </div>
      </div>
      {label && <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</p>}
    </div>
  );
}

// ─── Hustle Data ────────────────────────────────────────────────────────────

const HUSTLES: HustleInfo[] = [
  {
    type: "dropshipping",
    title: "Dropshipping",
    emoji: "📦",
    subtitle: "Sell products online without inventory",
    color: "#49B06E",
    earnings: "$500 – $5,000/mo",
    pansyIntro: "No inventory, no warehouse, no problem. You sell it, the supplier ships it. Let's build your online store step by step!",
    steps: [
      {
        step: 1,
        title: "Pick Your Niche",
        summary: "Choose a focused product category that people are already buying.",
        content: "The biggest mistake new dropshippers make is going too broad. Don't sell \"everything\" — pick ONE niche and own it. Great starter niches: pet accessories, home organization, phone accessories, beauty tools, fitness gear.\n\nAvoid clothing (sizing nightmares), fragile items (breakage claims), and cheap electronics (high return rates). Go to Google Trends and search your niche ideas — you want steady or rising interest, not a fad that peaked last year.\n\nThe sweet spot is products that solve a small problem or trigger impulse buys. \"Oh that's cool, I need that\" is the reaction you want.",
        actions: ["Write down 3 niche ideas you're interested in", "Search each on Google Trends — check the last 12 months", "Pick the one with steady or rising interest"],
        pansyTip: "Don't overthink this — you can always pivot later. Pick something you'd actually buy yourself!",
        time: "30 min",
      },
      {
        step: 2,
        title: "Find Winning Products",
        summary: "Research products that are proven sellers with good margins.",
        content: "Go to AliExpress and search your niche. Sort by orders and look for products with 4.5+ stars and 1,000+ orders — these are proven sellers. Your target: products that cost $2-15 from the supplier that you can sell for $20-50 (that's a 3-4x markup).\n\nAlso check Amazon's Best Sellers in your niche — if it sells well there, it'll sell on your store too. Look for products with lots of reviews and a price point between $15-50.\n\nPro move: search TikTok for \"TikTok made me buy it\" + your niche. Products going viral on TikTok are GOLD for dropshipping.",
        actions: ["Browse AliExpress for your niche — find 10 potential products", "Check each product's reviews, shipping time, and cost", "Calculate margin: can you sell for 3x the cost? Pick your top 3"],
        pansyTip: "The product doesn't need to be unique — it just needs to solve a problem better than what's out there, or look cuter doing it.",
        time: "1 hour",
      },
      {
        step: 3,
        title: "Set Up Your Online Store",
        summary: "Create your online store — Hostinger makes it easy and affordable, even if you've never done this before.",
        content: "Sign up for Hostinger — they have affordable website builder plans with a free domain included. Pick a clean template that matches your niche. Choose a store name that's short, memorable, and relates to your niche.\n\nSet up your homepage with a clean hero image and a clear value proposition. Add an \"About\" page, a FAQ, and your shipping/return policies. These build trust — people don't buy from sketchy-looking stores.\n\nFor your logo, use Canva (free). Pick 2-3 brand colors that match your niche vibe. A clean, simple logo beats a complicated one every time.",
        actions: ["Sign up for Hostinger (link below)", "Pick a clean template and customize colors to match your brand", "Create your logo in Canva and add it to your store"],
        links: [{ label: "Build Your Store with Hostinger →", url: AFF.hostinger }],
        pansyTip: "Your store doesn't need to be perfect to launch. Done is better than perfect, and you can always improve it later!",
        time: "2 hours",
      },
      {
        step: 4,
        title: "Add Your Products",
        summary: "Import products and write descriptions that actually make people want to buy.",
        content: "Connect your store to AliExpress suppliers using DSers or CJ Dropshipping — they handle the product sourcing and fulfillment for you. Import your top 3 products with one click. But here's the key: do NOT use the default AliExpress descriptions.\n\nAnother option: print-on-demand! With Printify or Printful you can sell custom t-shirts, mugs, phone cases, and more with YOUR designs. No inventory, no bulk orders — they print and ship each order for you. Great for niche or branded products.\n\nWrite your own product descriptions. Focus on benefits, not features. Instead of \"Made of silicone, 15cm long\" write \"Never burn your fingers again — this heat-resistant grip keeps your hands safe while you cook.\" People buy solutions, not specifications.\n\nUse high-quality images. If the supplier's photos look cheap, order a sample and take your own photos. Good photos = more sales. Period.",
        actions: ["Connect DSers or CJ Dropshipping to your store", "Check out Printify/Printful for custom print-on-demand products", "Import your top 3 products", "Rewrite each product description — focus on benefits and emotions", "Add at least 5 quality images per product"],
        links: [{ label: "Try Printify →", url: AFF.printify }, { label: "Try Printful →", url: AFF.printful }],
        pansyTip: "Read your descriptions out loud. If they sound boring to you, they're boring to customers. Write like you're telling your best friend about this amazing thing you found!",
        time: "2 hours",
      },
      {
        step: 5,
        title: "Set Up Payments & Shipping",
        summary: "Get ready to accept money and ship orders.",
        content: "Set up your payment gateway — Stripe and PayPal are the easiest options with the lowest fees. You want zero friction between \"I want this\" and \"take my money.\"\n\nFor shipping: offer FREE shipping and build the shipping cost into your product price. \"$25 with free shipping\" converts WAY better than \"$18 + $7 shipping\" even though it's the same total. This is psychology, not math.\n\nCreate these required pages: Shipping Policy (be honest about 7-14 day delivery), Return Policy (30-day returns build trust), and Privacy Policy. Most website builders have templates for these.",
        actions: ["Set up Stripe and PayPal payments", "Set all products to free shipping (adjust prices to cover cost)", "Create Shipping Policy, Return Policy, and Privacy Policy pages"],
        pansyTip: "Free shipping isn't actually free — you're just building it into the price. But customers LOVE seeing those two magic words!",
        time: "1 hour",
      },
      {
        step: 6,
        title: "Build Your Brand Identity",
        summary: "Create a consistent look that makes your store feel legit and memorable.",
        content: "Open Canva and create a Brand Kit: your logo, 2-3 colors, and a font pair. Use this consistently across everything — your store, social media, packaging inserts, and emails.\n\nCreate social media templates you can reuse. Make 5 templates: product showcase, customer review, tip/educational post, behind-the-scenes, and a promotional sale template. These save you hours every week.\n\nDesign a simple thank-you card to include with orders (your supplier can add these). Include your Instagram handle and a discount code for their next order. This turns one-time buyers into repeat customers.",
        actions: ["Create a Brand Kit in Canva (logo, colors, fonts)", "Design 5 reusable social media post templates", "Design a thank-you insert card for packages"],
        pansyTip: "Consistency is what makes a brand look professional. Use the same colors, fonts, and vibe everywhere. It doesn't have to be fancy — it has to be consistent.",
        time: "1.5 hours",
      },
      {
        step: 7,
        title: "Set Up Social Media",
        summary: "Create your brand's Instagram and TikTok — this is where your customers are.",
        content: "Create business accounts on Instagram and TikTok. Use your brand name, logo as profile pic, and write a bio that tells people exactly what you sell and why they should care. Include your store link.\n\nPost your first 3-5 pieces of content. Product showcase videos work best — show the product in action, show the problem it solves, show the unboxing experience. Keep videos under 30 seconds. Use trending sounds on TikTok.\n\nStart engaging: follow 50-100 accounts in your niche, comment genuinely on their posts, respond to every comment on yours. Social media rewards people who are social.",
        actions: ["Create business accounts on Instagram and TikTok", "Post 3 product showcase videos (show the product in action)", "Follow and engage with 50 accounts in your niche daily"],
        pansyTip: "You don't need to be on camera if you don't want to! Product-only videos with text overlay and trending music do amazing on TikTok.",
        time: "2 hours",
      },
      {
        step: 8,
        title: "Create Your First Ad",
        summary: "Set up a small test ad to start driving real traffic to your store.",
        content: "Set up Meta Business Manager (business.facebook.com) and create your first ad campaign. Start small: $5-10 per day. Choose the \"Sales\" objective and target people by interests related to your niche.\n\nVideo ads convert 2-3x better than image ads. Create a simple 15-second video: show the problem (2 sec), show your product solving it (8 sec), call to action (5 sec). You can make this in CapCut for free.\n\nSet your audience to ages 18-55, women (if your product skews female), and target 3-5 interests related to your niche. Let the ad run for 3-5 days before making any decisions — the algorithm needs time to learn.",
        actions: ["Set up Meta Business Manager", "Create a 15-second video ad in CapCut", "Launch your first campaign at $5/day targeting your niche interests"],
        pansyTip: "Don't panic if your first ad doesn't work. Most successful dropshippers test 5-10 ads before finding a winner. It's data, not failure!",
        time: "2 hours",
      },
      {
        step: 9,
        title: "Get Your First Sale",
        summary: "Launch, promote, and land that magical first order.",
        content: "Share your store link everywhere: your personal social media, WhatsApp groups, Facebook groups related to your niche (don't spam — provide value first, then share). Ask friends and family to share too.\n\nYour first ad campaign is running. Check it daily but don't touch it for 3-5 days. Look at these numbers: CTR (click-through rate) should be above 1%, and cost per click should be under $2. If both are good but no sales, your store might need work. If CTR is low, your ad creative needs work.\n\nWhen that first order comes in — and it WILL — celebrate! Screenshot it. That's proof this works. You just made money while you were sleeping (or scrolling TikTok, no judgment).",
        actions: ["Share your store link on all your personal social media", "Post in 3 niche-related Facebook groups (provide value, not spam)", "Check your ad stats daily — write down CTR and cost per click"],
        pansyTip: "Your first sale might take a few days or a few weeks. That's normal! Every successful store started with sale #1. Yours is coming.",
        time: "Ongoing",
      },
      {
        step: 10,
        title: "Fulfill Your First Orders",
        summary: "Process orders, ship to customers, and deliver a great experience.",
        content: "When an order comes in, your dropshipping tool makes fulfillment easy — click \"Place Order\" and it sends the order to your supplier automatically. They pack and ship it directly to your customer. You never touch the product.\n\nSend your customer a shipping confirmation with tracking info. Set up an automated email sequence: order confirmation → shipping notification → delivery follow-up → review request.\n\nIf a customer messages you, respond FAST. Within 24 hours, ideally within a few hours. Great customer service = good reviews = more sales. It's a beautiful cycle.",
        actions: ["Process your first order through DSers", "Set up automated shipping confirmation emails", "Respond to any customer messages within 24 hours"],
        pansyTip: "Treat every customer like your only customer. Word of mouth is free marketing, and one happy customer tells 5 friends!",
        time: "30 min per order",
      },
      {
        step: 11,
        title: "Analyze & Optimize",
        summary: "Look at your numbers, cut what's not working, and double down on what is.",
        content: "After 2 weeks of running ads, it's time to analyze. Look at your key metrics in your store analytics: total traffic, conversion rate (should be 1-3%), average order value, and profit margin after ad spend.\n\nKill any ads with CTR below 0.8% or cost per purchase above your profit margin. Duplicate winning ads with slight variations (different thumbnail, different opening line, different audience). This is called \"scaling\" and it's how you grow.\n\nTest new products! Add 2-3 new products to your store each week. Some will flop, some will fly. The more you test, the faster you find winners.",
        actions: ["Review your store analytics — write down conversion rate and top-performing products", "Kill underperforming ads, duplicate winning ones with variations", "Add 2-3 new products to test this week"],
        pansyTip: "Numbers don't lie. Fall in love with the data, not the product. If something isn't selling, pivot — don't pour more money into it.",
        time: "1 hour",
      },
      {
        step: 12,
        title: "Scale Your Business",
        summary: "You're in business! Now let's grow it into real income.",
        content: "If you've found a winning product (profitable after ad spend), it's time to scale. Gradually increase your ad budget: $5 → $10 → $20 → $50/day. Increase by 20-30% every 2-3 days, not all at once — the algorithm doesn't like sudden jumps.\n\nBuild an email list using a popup on your store offering a 10% discount. Email marketing has the highest ROI of any channel. Send weekly emails featuring new products, restocks, and exclusive deals.\n\nYou now have a real business. Consider registering an LLC (Step 12 in our business section), opening a business bank account, and treating this like the legitimate income stream it is. You built this from nothing — that's incredible.",
        actions: ["Increase your winning ad budget by 20% every 3 days", "Set up an email popup offering 10% off for subscribers", "Look into registering an LLC and opening a business bank account"],
        pansyTip: "You started from zero and now you're making money online. Most people just talk about it — YOU actually did it. I'm so proud of you!",
        time: "Ongoing",
      },
    ],
  },
  {
    type: "tiktok_shop",
    title: "TikTok Shop",
    emoji: "🎵",
    subtitle: "Sell products directly through TikTok",
    color: "#EF4444",
    earnings: "$1,000 – $10,000/mo",
    pansyIntro: "TikTok isn't just for dancing — it's a money machine right now. People are building six-figure businesses selling on TikTok Shop. Let's get you started!",
    steps: [
      {
        step: 1,
        title: "Set Up Your TikTok Business Account",
        summary: "Switch to a business account and optimize your profile for selling.",
        content: "Download TikTok (if you haven't already) and create an account. Go to Settings → Manage Account → Switch to Business Account. Pick a category that matches what you'll sell.\n\nYour bio is your storefront. Include: what you sell, why you're different, and a call to action. Example: \"Viral beauty finds that actually work ✨ Shop below 👇\" Keep it short, clear, and add relevant emojis.\n\nUse a clean profile picture — your logo or a bright, clear photo of you if you plan to be on camera. First impressions matter, and your profile is your first impression.",
        actions: ["Create a TikTok account and switch to Business", "Write a bio that tells people exactly what you sell", "Add a professional profile picture"],
        links: [{ label: "Get Started with TikTok →", url: AFF.tiktok }],
        pansyTip: "Your TikTok name should be easy to spell and remember. If people can't find you by searching, you're losing customers!",
        time: "20 min",
      },
      {
        step: 2,
        title: "Study What's Selling",
        summary: "Spend time on TikTok Shop to understand what's trending and why.",
        content: "Before you sell anything, become a TikTok Shop BUYER. Go to the Shop tab on TikTok and browse. What catches your eye? What makes you want to buy? That's research, not scrolling (that's what we tell ourselves anyway).\n\nSearch hashtags like #TikTokMadeMeBuyIt, #TikTokShopFinds, #viralproducts. Pay attention to what products are going viral, what the videos look like, and how the sellers present their products. Take screenshots and notes.\n\nLook for patterns: What price points work? ($10-40 is the sweet spot) What types of videos get the most engagement? (Demonstrations, before/afters, and ASMR unboxings crush it).",
        actions: ["Spend 30 minutes browsing TikTok Shop as a buyer", "Save 10 viral product videos — note what makes them effective", "Write down 5 product categories that keep appearing"],
        pansyTip: "This is the one time scrolling TikTok counts as work! But seriously — studying what works is the shortcut to success.",
        time: "1 hour",
      },
      {
        step: 3,
        title: "Apply for TikTok Shop Seller",
        summary: "Register as a seller on TikTok Shop and set up your store.",
        content: "Go to seller-us.tiktok.com (or your country's version) and apply to become a TikTok Shop seller. You'll need: a government ID, a phone number, and a business address (your home address works).\n\nApproval usually takes 1-3 business days. While you wait, keep studying successful sellers in your niche. Look at how they organize their shop, what their bestsellers are, and how they price things.\n\nOnce approved, set up your shop: add your logo, write a shop description, and configure your shipping templates. TikTok handles payment processing, so you don't need to worry about that.",
        actions: ["Apply at seller-us.tiktok.com with your ID and info", "While waiting for approval, study 5 successful TikTok shops in your niche", "Once approved, customize your shop profile and settings"],
        links: [{ label: "Start Your TikTok Shop →", url: AFF.tiktok }],
        pansyTip: "Don't stress about the application — it's straightforward. Most people get approved within 48 hours!",
        time: "30 min + wait",
      },
      {
        step: 4,
        title: "Source Your Products",
        summary: "Find reliable suppliers and order samples before you sell anything.",
        content: "You have two options: sell your own products or source from suppliers. For sourcing, check AliExpress, CJ Dropshipping, or contact manufacturers directly on Alibaba (for bulk orders).\n\nAnother amazing option: print-on-demand with Printify or Printful. Design custom merch (shirts, hoodies, mugs, tote bags) and they print & ship each order for you. Perfect for branded products that go viral on TikTok!\n\nALWAYS order samples before listing anything. You need to know the quality, test it on camera, and make sure it matches the photos. Nothing kills a TikTok Shop faster than customers getting cheap junk that doesn't match the video.\n\nStart with 3-5 products max. It's better to do 3 products really well than 20 products badly. You can always add more once you find what sells.",
        actions: ["Find suppliers on AliExpress or CJ Dropshipping for your niche", "Check out Printify/Printful for custom print-on-demand products", "Order samples of your top 5 product picks", "Test each sample — would YOU be happy receiving this?"],
        links: [{ label: "Try Printify →", url: AFF.printify }, { label: "Try Printful →", url: AFF.printful }],
        pansyTip: "Order the sample yourself first. If you wouldn't be excited to receive it, don't sell it. Your reputation is everything!",
        time: "1 hour + shipping wait",
      },
      {
        step: 5,
        title: "Create Product Listings",
        summary: "Write listings that convert browsers into buyers.",
        content: "Once your samples arrive and you're happy with the quality, create your listings. Take your own photos and videos of the product — authentic content always outperforms stock supplier images on TikTok.\n\nYour listing title should include keywords people search for. Instead of \"Cute Bag\" use \"Crossbody Phone Bag Leather Women Small Shoulder Purse.\" Think about what someone would type to find your product.\n\nPrice strategically: check what similar products sell for on TikTok Shop. Price yours competitively but leave room for profit. Factor in product cost, shipping, and TikTok's commission (usually 5%).",
        actions: ["Photograph and video your sample products", "Write keyword-rich titles for each product listing", "Set competitive prices — check 5 competitors' pricing first"],
        pansyTip: "Your product photos should look like they belong on someone's Instagram story, not a catalog. Natural lighting + clean background = chef's kiss!",
        time: "2 hours",
      },
      {
        step: 6,
        title: "Film Your First TikTok",
        summary: "Create your first product video — your phone is all you need.",
        content: "Your first video doesn't need to be perfect — it needs to be REAL. TikTok rewards authenticity over production quality. Use your phone, natural lighting (near a window), and a clean background.\n\nFormats that work: product demonstrations (\"Watch this!\"), before/after transformations, ASMR unboxings, \"things you didn't know you needed,\" and honest reviews. Pick one format and film 3 versions of it.\n\nKeep it short: 15-30 seconds is the sweet spot. Hook people in the first 2 seconds — start with the most interesting part. Add text overlay, a trending sound, and relevant hashtags (#TikTokShop #fyp + niche hashtags).",
        actions: ["Set up a filming spot with good natural light", "Film 3 product videos using different formats", "Edit in CapCut — add text overlay and trending sounds"],
        pansyTip: "The #1 mistake is waiting until you feel ready. Post your first video today. Your 10th video will be 10x better, but you can't get to 10 without posting 1!",
        time: "1 hour",
      },
      {
        step: 7,
        title: "Learn the TikTok Algorithm",
        summary: "Understand how TikTok decides who sees your content.",
        content: "TikTok's algorithm cares about one thing: watch time. If people watch your entire video, TikTok pushes it to more people. If they scroll past, it dies. That's why your hook (first 2 seconds) matters more than anything.\n\nPost consistently: 1-3 times per day is ideal. The algorithm rewards accounts that post regularly. It's not about going viral with one video — it's about consistently getting in front of new people.\n\nBest posting times: typically 7-9am, 12-2pm, and 7-10pm in your target audience's timezone. But honestly, just post and see what works for YOUR audience. TikTok analytics will show you when your followers are most active.",
        actions: ["Study TikTok's Creator Analytics in your app", "Create a posting schedule: aim for at least 1 video per day", "Write down 10 hook ideas for your next videos"],
        pansyTip: "Don't delete 'flopped' videos! Sometimes TikTok pushes old videos days or weeks later. Let the algorithm do its thing.",
        time: "45 min",
      },
      {
        step: 8,
        title: "Go Live for the First Time",
        summary: "TikTok Live is where the BIG money is — let's get you started.",
        content: "Going live is terrifying, I know. But TikTok Live sellers make 3-5x more than those who only post videos. You need 1,000 followers to go live (keep posting to get there, or buy from TikTok's live shopping access program).\n\nYour first live doesn't need to be fancy. Show your products, demonstrate them, answer questions, and offer a live-only discount. Keep it conversational — pretend you're FaceTiming a friend and showing them something cool you found.\n\nTips for your first live: go for at least 30 minutes (the algorithm pushes longer lives), pin your bestselling product, and interact with every comment. Say people's names when they comment — it makes them feel seen and keeps them watching.",
        actions: ["Plan your first live: pick 3-5 products to showcase", "Set up your live space with good lighting and a product display", "Go live for at least 30 minutes — interact with every comment"],
        pansyTip: "Everyone is nervous their first live. Your second one will be easier, and by your tenth, you'll wonder why you were ever scared!",
        time: "1 hour prep + 30 min live",
      },
      {
        step: 9,
        title: "Build a Content Calendar",
        summary: "Stop posting randomly — create a system that works while you live your life.",
        content: "Batch your content creation. Pick one day per week to film 7+ videos. Edit them that day, then schedule them throughout the week. This saves HOURS and keeps you consistent.\n\nYour content mix should be: 40% product showcase, 20% educational/tips, 20% trending/fun, 20% behind-the-scenes. This keeps your feed interesting and not just \"buy my stuff buy my stuff.\"\n\nUse a simple spreadsheet or app to track what works: video idea, format, posting time, views, sales. After 2 weeks, patterns will emerge — lean into what your audience responds to.",
        actions: ["Pick one batch filming day per week", "Plan 7 videos using the 40/20/20/20 content mix", "Create a tracking spreadsheet for views and sales per video"],
        pansyTip: "The content calendar is what separates the people who make money from the people who burn out. Work smarter, not harder!",
        time: "2 hours initial setup",
      },
      {
        step: 10,
        title: "Handle Orders & Customer Service",
        summary: "Deliver a great experience that turns buyers into repeat customers and reviewers.",
        content: "When orders come in, ship within 2 business days (TikTok penalizes slow shippers). Use the shipping option TikTok recommends — they often negotiate better rates than you'd get on your own.\n\nInclude a small thank-you card in every order with your TikTok handle and a discount code for their next purchase. This costs pennies but drives repeat sales and follows.\n\nRespond to customer messages within 12 hours. If there's a problem, fix it fast and generously — refund, replace, or offer a discount. One bad review on TikTok Shop tanks your visibility. One great customer service story gets shared and brings you new customers.",
        actions: ["Set up shipping templates for fast processing", "Design a thank-you card to include in orders", "Create response templates for common customer questions"],
        pansyTip: "Every customer is a potential content creator. A happy customer's unboxing video is free advertising you can't buy!",
        time: "30 min daily",
      },
      {
        step: 11,
        title: "Partner with Affiliates",
        summary: "Let other TikTok creators sell your products for you — and pay them on commission.",
        content: "TikTok Shop's affiliate program is a GAME CHANGER. You set a commission (usually 10-20%), and other TikTok creators promote your products in their videos. You only pay when they make a sale.\n\nGo to the TikTok Shop Seller Center → Affiliate → Open Collaboration. Set your commission rate and write a brief about your product. Creators will apply to promote it, or you can invite specific creators you like.\n\nStart by reaching out to micro-influencers (1,000-50,000 followers) in your niche. They're more responsive, more affordable, and their followers trust them more. Send them a free sample and offer 15-20% commission.",
        actions: ["Set up affiliate program in TikTok Shop Seller Center", "Write a product brief that makes creators excited to promote you", "Reach out to 10 micro-influencers in your niche with free samples"],
        pansyTip: "Affiliates are like having a sales team that only gets paid when they sell. It's the smartest way to scale without spending on ads!",
        time: "2 hours",
      },
      {
        step: 12,
        title: "Scale to Real Income",
        summary: "You're in business! Now let's turn this into consistent, growing income.",
        content: "You now have a functioning TikTok Shop with products, content, and hopefully some sales rolling in. Time to think bigger.\n\nDouble down on what works: your best-selling product gets more content, more ad spend, and more affiliate promotion. Add complementary products (if your bag sells well, add a matching wallet). Build product bundles at a slight discount.\n\nConsider running TikTok ads through TikTok Ads Manager to amplify your best-performing organic content. Start with $20/day on your top video and scale from there. You've got the data now — use it.\n\nYou built this from nothing. You learned a new platform, figured out what sells, created content, and built a customer base. That's a real business, and it's yours. Keep going!",
        actions: ["Identify your top 3 selling products and create more content for them", "Add 3-5 complementary products to your shop", "Test TikTok ads on your best organic video at $20/day"],
        pansyTip: "Look at you — you have a BUSINESS! Not a hobby, not a side project, a real business. Most people never take the first step. You took all twelve!",
        time: "Ongoing",
      },
    ],
  },
  {
    type: "ugc",
    title: "UGC Creator",
    emoji: "🎬",
    subtitle: "Create content for brands and get paid",
    color: "#8B5CF6",
    earnings: "$1,500 – $5,000/mo",
    pansyIntro: "Brands are DESPERATE for authentic content from real people. You don't need followers, you don't need to post on your own page. Just create, deliver, get paid!",
    steps: [
      {
        step: 1,
        title: "Understand What UGC Is",
        summary: "UGC (User Generated Content) is content you create for brands — they pay you, they post it.",
        content: "UGC is NOT being an influencer. You don't need followers. You don't even need to post on your own account. Brands pay you to create authentic-looking videos and photos of their products, and THEY post it on their channels or use it in ads.\n\nWhy brands love UGC: it looks real, it converts better than polished studio content, and it's cheaper than hiring a production team. A 30-second UGC video typically pays $150-500 per video.\n\nTypes of UGC: unboxing videos, product reviews, tutorials, \"get ready with me\" featuring a product, testimonials, and lifestyle shots showing the product in use.",
        actions: ["Watch 10 UGC videos on TikTok (search #ugccreator)", "Note the different formats: unboxing, review, tutorial, lifestyle", "Write down 3 product categories you'd enjoy creating content for"],
        pansyTip: "You don't need to be an influencer or have a big following. UGC is about creating authentic content — and you're already authentic!",
        time: "30 min",
      },
      {
        step: 2,
        title: "Build Your Portfolio",
        summary: "Create sample content even without clients — this is your calling card.",
        content: "You need a portfolio to get clients, but you need clients to build a portfolio. Here's the hack: create UGC content for products you already own. Film an unboxing of something you bought recently, create a review of your favorite skincare product, or do a \"day in my life\" featuring products around your house.\n\nCreate 5-8 sample videos across different formats: 2 unboxings, 2 reviews, 2 tutorials, 2 lifestyle shots. These don't need to be perfect — they need to show you can create engaging, authentic content.\n\nEdit them in CapCut (free) — add text overlay, music, and smooth transitions. Export in 9:16 vertical format (TikTok/Reels format).",
        actions: ["Pick 5 products you already own to create sample content for", "Film 5 sample UGC videos in different formats", "Edit in CapCut and save to a portfolio folder"],
        pansyTip: "Your first videos won't be your best — and that's totally fine! You'll look back at them in a month and be amazed at how far you've come.",
        time: "3 hours",
      },
      {
        step: 3,
        title: "Set Up Your Creator Profile",
        summary: "Create your online presence where brands can find and evaluate you.",
        content: "Create a portfolio using a free tool like Canva (make a simple website-style presentation) or use a UGC-specific platform like Collabstr, Billo, or JoinBrands. These platforms connect you directly with brands looking for creators.\n\nYour profile needs: a friendly photo, a short bio about your content style, your niche/categories, your sample work, and your rates (we'll set those in step 9). Keep it professional but warm — brands want to work with real, likeable people.\n\nAlso create a TikTok/Instagram account specifically for your UGC business. Post your sample work there. Use hashtags like #ugccreator #ugccommunity #ugccontentcreator to get discovered.",
        actions: ["Sign up on 2 UGC platforms (Collabstr, Billo, or JoinBrands)", "Create a portfolio with your sample videos", "Set up a dedicated UGC creator social media account"],
        pansyTip: "Think of your profile like a dating app — first impressions matter! Be yourself, show your best work, and let your personality shine through.",
        time: "1.5 hours",
      },
      {
        step: 4,
        title: "Master Your Phone Camera",
        summary: "Learn simple filming techniques that make your content look professional.",
        content: "Good news: you do NOT need expensive equipment. Your phone camera is more than enough. What matters is lighting, stability, and audio.\n\nLighting: film near a window for natural light, or get a $15 ring light from Amazon. Front-facing light eliminates shadows and makes everything look clean. Never film with a window behind you.\n\nStability: prop your phone against something sturdy, or get a $10 phone tripod. Shaky footage screams amateur. Audio: film in a quiet room. If you're talking to camera, get close to the phone. Background noise kills UGC content.\n\nOne more trick: clean your camera lens before filming. Seriously. A smudgy lens makes everything look hazy.",
        actions: ["Set up a filming spot with good natural light", "Get a phone tripod or stable surface to film from", "Practice filming a 15-second clip and review the quality"],
        pansyTip: "You don't need a $1,000 camera setup. The best UGC is shot on phones — because that's what makes it feel real and authentic!",
        time: "30 min",
      },
      {
        step: 5,
        title: "Learn to Edit in CapCut",
        summary: "Master the free editing app that every UGC creator uses.",
        content: "Download CapCut (free on iOS and Android). This is the industry standard for UGC editing. Learn these basics: trimming clips, adding text overlay, adding music/sound effects, transitions between clips, and speed adjustments.\n\nKey editing tips for UGC: keep cuts fast (2-3 seconds per clip), add text that reinforces what you're saying, use subtle zoom-ins for emphasis, and match your cuts to the beat of the music.\n\nCreate templates for yourself: a standard intro transition, your text style (font, color, position), and your preferred export settings (1080x1920, high quality). Having templates speeds up your workflow dramatically.",
        actions: ["Download CapCut and watch a 15-minute tutorial on YouTube", "Edit one of your sample videos using text, music, and transitions", "Create a template with your preferred text style and transitions"],
        pansyTip: "CapCut has a learning curve, but once you get it, you can edit a 30-second UGC video in 15 minutes. Practice makes profit!",
        time: "1 hour",
      },
      {
        step: 6,
        title: "Create Your Signature Samples",
        summary: "Build 3-5 polished sample videos that showcase your range.",
        content: "Now combine everything you've learned: filming, lighting, and editing. Create 3-5 POLISHED sample videos that represent your best work. These are what brands will judge you on.\n\nMake sure each sample is a different format: one unboxing, one talking-to-camera review, one hands-only demonstration, one lifestyle/aesthetic shot, and one before/after or transformation. This shows brands you're versatile.\n\nEach video should be 15-45 seconds, vertically filmed, with clean editing and text overlay. Watch it on your phone (how clients will see it) and ask: would this make me stop scrolling? If not, reshoot it.",
        actions: ["Film and edit 5 polished sample videos in different formats", "Watch each on your phone — does it stop the scroll?", "Upload your best 3-5 to your portfolio and UGC platforms"],
        pansyTip: "Quality over quantity. Five amazing samples will get you more clients than twenty mediocre ones. Put your best work forward!",
        time: "3 hours",
      },
      {
        step: 7,
        title: "Land Your First Client",
        summary: "Get your first paid UGC gig — even if it's a small one.",
        content: "Three paths to your first client:\n\n1. UGC platforms (Collabstr, Billo, JoinBrands) — apply to open briefs that match your style. These pay $50-200 per video for beginners and you'll get experience fast.\n\n2. Cold outreach on Instagram — find small-to-medium brands in your niche (1k-50k followers), DM them with a personalized pitch and a link to your portfolio. Send 5-10 DMs per day.\n\n3. Apply to brands' UGC programs — many brands have \"creator\" or \"ambassador\" pages on their websites. Search \"[brand name] UGC\" or \"[brand name] content creator.\"\n\nFor your first gig, don't be afraid to accept a lower rate. Your goal right now is getting real client work for your portfolio, not maximizing income. That comes later.",
        actions: ["Apply to 5 open briefs on UGC platforms", "Send personalized DMs to 10 small brands in your niche", "Search for creator programs on 5 brands' websites"],
        pansyTip: "Rejection is normal — most creators hear 'no' (or nothing) 9 times before getting a 'yes.' Keep pitching. Your first client is one DM away!",
        time: "2 hours",
      },
      {
        step: 8,
        title: "Pitch Like a Pro",
        summary: "Write pitches that make brands excited to work with you.",
        content: "A great pitch is short, specific, and shows you understand the brand. Template:\n\n\"Hey [Brand]! I love [specific product] — I've been using it for [specific use case]. I'm a UGC creator and I'd love to create content for you. Here's a quick look at my work: [portfolio link]. I think a [format] video showing [specific idea] would resonate with your audience. Let me know if you're interested!\"\n\nDO: personalize every pitch, mention a specific product, include a content idea, keep it under 100 words. DON'T: copy-paste the same generic pitch, talk about yourself for 5 paragraphs, or ask \"do you need UGC?\" (of course they do).\n\nFollow up once after 3-5 days if they don't respond. No response after the follow-up = move on.",
        actions: ["Write a pitch template with blanks for personalization", "Customize and send 5 pitches to brands today", "Set a reminder to follow up on unanswered pitches in 3 days"],
        pansyTip: "The secret to a good pitch: make it about THEM, not you. How will your content help THEIR brand? Lead with that!",
        time: "1 hour",
      },
      {
        step: 9,
        title: "Set Your Rates",
        summary: "Know your worth and price accordingly — no more working for free.",
        content: "Beginner UGC rates (0-5 clients): $100-200 per video. Intermediate (5-20 clients): $200-400 per video. Experienced (20+ clients): $400-800+ per video.\n\nPrice by deliverable, not by hour. A \"package\" converts better than a single video price. Example: 1 video = $150, 3 videos = $400, 5 videos = $600. Bundles give brands a discount and give you more work.\n\nAlways get payment upfront or 50% upfront + 50% on delivery. Use contracts (a simple one-page agreement works) that specify: number of videos, format, revision limit (2 max), usage rights, and payment terms.",
        actions: ["Decide on your starting rate based on your experience level", "Create a rate card with bundle packages", "Draft a simple 1-page contract template"],
        pansyTip: "Repeat after me: I will not work for free. Exposure doesn't pay rent. Even your first gig should be PAID, even if it's your lowest rate.",
        time: "45 min",
      },
      {
        step: 10,
        title: "Deliver & Get Testimonials",
        summary: "Exceed expectations and collect proof that you're amazing to work with.",
        content: "When you deliver content to a client, go above and beyond: deliver on time (or early), include one bonus clip or photo they didn't ask for, and be responsive to feedback. Over-delivering creates repeat clients.\n\nAfter the client is happy, ask for a testimonial. This is crucial: \"Would you mind sharing a quick testimonial about working with me? Even a few sentences would mean the world.\" Most clients are happy to do this.\n\nAdd their testimonial and the final content (with permission) to your portfolio. Tag the brand when you post. This social proof is what turns you from \"a UGC creator\" to \"THE UGC creator brands want to work with.\"",
        actions: ["Deliver your work on time with a bonus extra clip", "Ask every happy client for a written testimonial", "Add testimonials and approved work samples to your portfolio"],
        pansyTip: "One happy client leads to referrals, repeat work, and a growing reputation. Treat every single project like it's your most important one!",
        time: "Per project",
      },
      {
        step: 11,
        title: "Build Recurring Revenue",
        summary: "Turn one-time gigs into monthly retainer clients.",
        content: "The real money in UGC isn't one-off videos — it's retainers. After delivering great work, pitch the client a monthly package: \"I'd love to create ongoing content for you. I can do 4 videos/month for $X — that way you always have fresh content for your ads and social.\"\n\nRetainer clients are the holy grail: predictable monthly income, less time pitching, and deeper brand partnerships. Even 2-3 retainer clients at $500-1,000/month each = a real income.\n\nAlso explore whitelisting: brands pay extra ($100-300 per month) to run ads from YOUR account. The content is yours, you post it, and they boost it with ad spend. You get paid for the content AND the whitelisting fee.",
        actions: ["Pitch your best client on a monthly retainer package", "Research whitelisting and add it to your service offerings", "Set an income goal for 3 retainer clients"],
        pansyTip: "Retainers are what turn this from a side hustle into a career. One great client relationship is worth more than 20 one-time gigs!",
        time: "Ongoing",
      },
      {
        step: 12,
        title: "Scale to Full-Time Income",
        summary: "You're a UGC creator now — let's make it your main income source.",
        content: "At this point, you have clients, testimonials, and a growing portfolio. Let's go bigger. Raise your rates by 20-30% for new clients (grandfather existing ones). Your improved portfolio and testimonials justify it.\n\nSpecialize in a niche: beauty UGC creators, food UGC creators, and tech UGC creators command higher rates because brands want someone who understands their audience. Be the go-to person for your niche.\n\nConsider building a team: find 1-2 other creators you trust and take on more work than you can handle alone. You become the manager/producer, take a cut, and scale beyond what one person can do.\n\nYou started this with nothing but a phone and an idea. Now you create content that helps brands sell millions in products. That's power — and it's yours.",
        actions: ["Raise rates by 20-30% for all new clients", "Position yourself as a specialist in your top-performing niche", "Consider partnering with 1-2 other creators to take on more work"],
        pansyTip: "From zero clients to full-time income — and you did it all yourself with a phone and determination. I always knew you had it in you!",
        time: "Ongoing",
      },
    ],
  },
  {
    type: "digital_products",
    title: "Digital Products",
    emoji: "✨",
    subtitle: "Create once, sell forever — templates, printables, ebooks",
    color: "#EC4899",
    earnings: "$200 – $3,000/mo",
    pansyIntro: "The dream: create something once and get paid for it over and over. Digital products have no inventory, no shipping, and nearly 100% profit margin. Let's build yours!",
    steps: [
      { step: 1, title: "Choose What to Sell", summary: "Pick a digital product type that matches your skills.", content: "Digital products include: printable planners, Canva templates, ebooks, online guides, budget spreadsheets, social media templates, resume templates, meal prep plans, workout guides, and more.\n\nPick something that solves a problem. \"Cute planner\" is fine, but \"Budget planner for single moms who hate spreadsheets\" is a PRODUCT. Specificity sells.\n\nThe easiest starting point: take something you already do well and package it. If you're great at budgeting, make a budget template. If you're organized, make a planner. If you know social media, make templates.", actions: ["List 5 things you're good at or know well", "Match each skill to a digital product type", "Pick the one that feels most exciting and doable"], pansyTip: "Start with what you know. Your everyday skills are someone else's dream solution!", time: "30 min" },
      { step: 2, title: "Research Your Market", summary: "See what's already selling and find your angle.", content: "Go to Etsy and search for your product type. Sort by \"Best Sellers\" and study the top 20 results. What do they look like? What do they cost? What do the reviews say (especially the 3-star ones — those reveal what's missing)?\n\nAlso check Gumroad, Creative Market, and Amazon KDP for your category. Note the price ranges, bestseller features, and customer complaints.\n\nYour job isn't to copy — it's to find the gap. What's missing? What could be better? What audience is underserved? That's your opportunity.", actions: ["Search Etsy for your product category — study the top 20 bestsellers", "Read 3-star reviews to find what customers wish was different", "Write down 3 gaps or improvements you could make"], pansyTip: "Don't reinvent the wheel — just make a better wheel! Study what works, then add your unique spin.", time: "1 hour" },
      { step: 3, title: "Create Your First Product", summary: "Build it using free tools — Canva, Google Sheets, or Notion.", content: "Canva (free) is your best friend for visual products: planners, templates, social media kits, ebooks. Google Sheets works for spreadsheets and trackers. Notion for systems and dashboards.\n\nStart with ONE product. Make it genuinely useful and visually appealing. Spend time on the design — a beautiful product gets better reviews, more shares, and higher perceived value.\n\nExport as PDF (for printables/ebooks), or share as a Canva template link (for editable templates). Test it yourself: would you pay for this? Get 2-3 friends to test it and give honest feedback.", actions: ["Create your product in Canva, Google Sheets, or Notion", "Make it visually polished — colors, fonts, layout matter", "Test with 2-3 friends and get honest feedback"], pansyTip: "Your first product doesn't need to be a masterpiece. Make it good, launch it, and improve based on real customer feedback!", time: "3-5 hours" },
      { step: 4, title: "Set Up Your Storefront", summary: "List your product on Etsy, Gumroad, or your own site.", content: "For beginners: Etsy is the easiest (built-in traffic) — listing fee is $0.20 per item. Gumroad is great for direct sales (no listing fee, takes 10% of sales). You can also use Stan Store or Payhip.\n\nCreate your shop: add a logo, write a bio, and set up payment. Then create your first listing with an eye-catching title, compelling description, and beautiful mockup images.\n\nPro tip: list on BOTH Etsy and Gumroad. Etsy gives you search traffic, Gumroad gives you higher margins. Same product, two income streams.", actions: ["Set up shops on Etsy and Gumroad", "Create your first product listing", "Write a compelling shop bio and add your branding"], pansyTip: "Two storefronts = two chances to make money from the same product. Work smarter!", time: "1.5 hours" },
      { step: 5, title: "Design Mockups That Sell", summary: "Your product image is what makes someone click — make it irresistible.", content: "Mockups are preview images that show your product in use — a planner on a desk with coffee, a template on a laptop screen, a printable framed on a wall. These convert browsers to buyers.\n\nUse Canva's free mockup templates or sites like SmartMockups. Show your product in 3-5 different contexts. Include a close-up of the details, a lifestyle shot, and a \"what's included\" overview.\n\nYour first image (the thumbnail) is the most important — it should be clean, colorful, and immediately show what the product is. No tiny text, no cluttered layouts.", actions: ["Create 5 mockup images for your product in Canva", "Make the thumbnail image your absolute best — clean and eye-catching", "Include a 'what's included' overview image"], pansyTip: "People literally buy with their eyes. Beautiful mockups can double your conversion rate overnight!", time: "1 hour" },
      { step: 6, title: "Write Descriptions That Sell", summary: "Your listing description does the selling — make every word count.", content: "Structure your description: Hook (what problem does this solve?) → Features (what's included) → Benefits (how it makes their life better) → Social proof (reviews/testimonials) → Call to action.\n\nUse bullet points for features. Be specific: \"12-page monthly budget tracker\" not \"budget planner.\" Include the format (PDF, Canva, Excel), dimensions, and how to use it.\n\nSEO matters on Etsy: include keywords in your title, tags, and description that people actually search for. Think like a buyer: what would YOU type to find this product?", actions: ["Write a description following the Hook → Features → Benefits structure", "Add 13 Etsy tags using keywords buyers search for", "Include format, dimensions, and usage instructions"], pansyTip: "Your description should answer every question before the customer has to ask it. No question marks = more purchases!", time: "45 min" },
      { step: 7, title: "Price for Profit", summary: "Set a price that's competitive but values your work.", content: "Research competitors' prices: find 10 similar products and note their price range. Price yours in the middle-to-upper range if your quality is there. Don't be the cheapest — cheap = perceived as low quality.\n\nDigital product pricing sweet spots: printables/planners $3-12, template bundles $15-35, ebooks/guides $9-29, spreadsheet systems $7-19. Bundles (3-5 products together) justify higher prices and increase average order value.\n\nRemember: digital products cost you nothing to duplicate. Every sale after the first is nearly pure profit. Price for the value you provide, not the time it took to make.", actions: ["Research 10 competitor prices in your category", "Set your price in the middle-to-upper range", "Create a bundle of 3+ products at a discounted bundle price"], pansyTip: "Your knowledge and creativity have value. Don't underprice yourself just because it's digital — that's still your expertise!", time: "30 min" },
      { step: 8, title: "Launch Your First Listing", summary: "Hit publish and get your product in front of buyers.", content: "Before you launch: double-check everything. Download your own product — does it work? Are there typos? Is the formatting correct? Test on both phone and computer.\n\nPublish your listing and share it everywhere: your personal social media, relevant Facebook groups, Reddit communities, Pinterest (huge for digital products). Don't just post a link — show the product in action, share a tip related to it, then mention where to get it.\n\nFirst 48 hours matter on Etsy — early engagement boosts your ranking. Ask friends and family to favorite your listing (not buy — that can trigger Etsy's fraud detection).", actions: ["Final quality check: download and test your product yourself", "Publish your listing on Etsy and Gumroad", "Share on 3 social media platforms with engaging content, not just a link"], pansyTip: "You just published a product that can make money while you sleep. Let that sink in! Now let's get people to see it.", time: "1 hour" },
      { step: 9, title: "Market on Social Media", summary: "Use Pinterest and TikTok to drive free traffic to your products.", content: "Pinterest is the #1 free traffic source for digital products. Create pins (using Canva) that showcase your product with keywords in the title and description. Pin 5-10 pins per week. Pinterest is a search engine — your pins can drive traffic for years.\n\nTikTok works too: create short videos showing your product, how to use it, or the problem it solves. \"POV: you finally have a budget that works\" with a scroll-through of your planner template.\n\nConsistency beats virality. 5 pins/week and 3 TikToks/week for 3 months will build real, sustainable traffic.", actions: ["Create 10 Pinterest pins for your product using Canva", "Post 3 TikToks showing your product in action", "Commit to a weekly posting schedule for both platforms"], pansyTip: "Pinterest is the secret weapon most people sleep on. Your pins can bring traffic for YEARS. Start pinning today!", time: "2 hours/week" },
      { step: 10, title: "Get Your First Reviews", summary: "Reviews are social proof that drives more sales — here's how to get them.", content: "After someone buys, follow up with a thank-you message and kindly ask for a review. On Etsy, you can include a note with the digital download: \"Love it? A 5-star review would mean the world!\"\n\nOffer a small incentive: \"Leave a review and DM me for a free bonus template.\" This is allowed on most platforms and dramatically increases review rates.\n\nRespond to every review — thank the positive ones and professionally address any concerns. This shows future buyers you care and are responsive.", actions: ["Set up an automated thank-you message after purchase", "Create a bonus freebie to offer review-leavers", "Respond to your first 5 reviews within 24 hours"], pansyTip: "Every review is a trust signal that makes the next person more likely to buy. Your first 10 reviews will snowball into hundreds!", time: "Ongoing" },
      { step: 11, title: "Create a Product Suite", summary: "One product is a listing. A suite of products is a business.", content: "Now that your first product is live and (hopefully) selling, create complementary products. If you made a budget planner, add a savings tracker, a debt payoff spreadsheet, and a financial goals workbook.\n\nBundle related products together at a slight discount. A $5 planner + $5 tracker + $5 workbook = $15 separately, but $12 as a bundle. Customers love bundles and your average order value goes up.\n\nAim for 10-20 products in your shop within the first 3 months. More products = more chances for someone to find you in search.", actions: ["Brainstorm 5 complementary products to your bestseller", "Create and list 2 new products this week", "Create a bundle of 3+ related products"], pansyTip: "Think of your shop like a garden — the more seeds you plant, the more flowers bloom. Each product is another seed!", time: "Ongoing" },
      { step: 12, title: "Build Passive Income", summary: "You're in business! Your products sell while you sleep, travel, and live your life.", content: "This is the dream: you've created products that sell on autopilot. Your Pinterest pins drive traffic, your Etsy SEO brings searchers, and your reviews build trust. Sales come in while you sleep.\n\nTo keep growing: create 1-2 new products per month, keep pinning on Pinterest, refresh old listings with new keywords and mockups, and watch your analytics to see what people search for.\n\nBuild your own website with Hostinger to sell directly — no platform fees, higher margins, and you own the customer relationship. Your Etsy shop drives awareness, your own site drives profit.\n\nYou built a passive income machine. That budget template you made at your kitchen table? It's paying your bills now. That's the power of digital products.",
        actions: ["Set a goal: 1-2 new products per month", "Build your own website to sell directly", "Reinvest profits into growing your product suite"],
        links: [{ label: "Build Your Store with Hostinger →", url: AFF.hostinger }],
        pansyTip: "You create once, sell forever. Every product in your shop is a little employee working 24/7. You built this — and it's just the beginning!", time: "Ongoing" },
    ],
  },
  {
    type: "freelancing",
    title: "Freelancing",
    emoji: "💼",
    subtitle: "Turn your skills into paid services",
    color: "#F59E0B",
    earnings: "$1,000 – $5,000/mo",
    pansyIntro: "You already have skills people will pay for. Writing, design, social media, data entry, virtual assistance — someone out there needs what you can do. Let's get you paid!",
    steps: [
      { step: 1, title: "Identify Your Money-Making Skills", summary: "Figure out what you're good at that people will pay for.", content: "Write down everything you can do — even things that feel \"basic\" to you. What's easy for you is hard for someone else. Can you write? Edit photos? Manage social media? Organize spreadsheets? Create presentations? Respond to emails professionally?\n\nTop freelance skills by demand: social media management, graphic design, content writing, virtual assistance, bookkeeping, video editing, email marketing, web design, data entry, and customer service.\n\nDon't overlook soft skills: if you're great at organizing, you can be a virtual assistant. If you're good at explaining things, you can be a customer support rep. Your \"ordinary\" skills are worth $20-75/hour to the right client.", actions: ["List 10 things you can do well (even basic skills)", "Match 3 of those skills to freelance service categories", "Pick the one you enjoy most AND that has market demand"], pansyTip: "Stop telling yourself your skills aren't special enough. Your 'basic' skill is someone else's 'I'll pay anything for this!'", time: "30 min" },
      { step: 2, title: "Define Your Service", summary: "Package your skill into a clear service with specific deliverables.", content: "Don't sell \"social media help\" — sell \"I'll create and schedule 12 Instagram posts per month with captions and hashtags.\" Specificity makes you look professional and makes pricing easier.\n\nCreate 2-3 service packages: Basic, Standard, and Premium. Example for social media management: Basic (8 posts/mo) $300, Standard (12 posts + stories) $500, Premium (20 posts + stories + engagement) $800.\n\nWrite a one-paragraph service description: what you do, who it's for, and what they get. This becomes your pitch everywhere.", actions: ["Define exactly what your service includes (specific deliverables)", "Create 3 pricing tiers: Basic, Standard, Premium", "Write a one-paragraph service description"], pansyTip: "Packages make everything easier — for you AND the client. They know what they're getting, you know what you're delivering. No awkward money conversations!", time: "45 min" },
      { step: 3, title: "Set Up Your Profile", summary: "Create profiles on freelance platforms where clients are already looking.", content: "Sign up on Fiverr, Upwork, and one niche platform for your skill (99designs for design, Contently for writing, Belay for VA work). Each platform has different strengths.\n\nFiverr: create \"gigs\" (service listings) — great for fixed-price work. Upwork: bid on client projects — great for ongoing work. Your profile on both should include: a professional photo, a compelling bio, your services, and portfolio samples.\n\nYour profile headline matters more than anything. Not \"Freelance Writer\" but \"I Write Blog Posts That Rank on Google and Drive Traffic to Your Business.\" Sell the outcome, not the service.", actions: ["Sign up on Fiverr and Upwork", "Write a headline that sells the outcome of your work", "Create your first gig/profile with a professional photo and bio"], pansyTip: "Your profile headline has 5 seconds to grab attention. Think about what your ideal client NEEDS, and put that in the headline!", time: "1.5 hours" },
      { step: 4, title: "Build a Quick Portfolio", summary: "Show potential clients what you can do — even without past clients.", content: "No past clients? No problem. Create sample work: write 2-3 blog posts, design social media posts for a fictional brand, build a sample spreadsheet system, or create a mock website.\n\nIf you have any past work (school projects, volunteer work, personal projects), include those too. Anything that shows your skill level.\n\nPresent your portfolio professionally: use Canva to create a PDF portfolio, or use a free portfolio site like Notion or Carrd. Include: the project, what you did, and the result (even if estimated).", actions: ["Create 3 sample projects that showcase your best work", "Build a simple portfolio using Canva or Notion", "Add your portfolio link to all your freelance profiles"], pansyTip: "A portfolio of 3 great samples beats a portfolio of 20 mediocre ones. Quality over quantity, always!", time: "2-3 hours" },
      { step: 5, title: "Write Your First Proposal", summary: "Learn to pitch clients in a way that gets responses.", content: "On Upwork, you bid on projects with proposals. Most proposals are terrible: \"Hi, I can do this. Here's my profile.\" That's your competition — beating them is easy.\n\nWinning proposal formula: 1) Address their specific need (\"I noticed you need blog posts about personal finance...\") 2) Show relevant experience (\"I've written about budgeting and investing for...\") 3) Propose a solution (\"I'd approach this by...\") 4) Include a relevant sample.\n\nKeep it under 150 words. Clients read dozens of proposals — short and specific wins over long and generic.", actions: ["Write a proposal template following the 4-step formula", "Apply to 5 relevant projects on Upwork today", "Create a gig on Fiverr optimized with strong keywords"], pansyTip: "Every proposal is a practice pitch. Your first few might not land, but each one makes you better. Send 5 today!", time: "1 hour" },
      { step: 6, title: "Land Your First Client", summary: "Get that first paid gig and deliver outstanding work.", content: "Apply to 5-10 projects per day on Upwork. On Fiverr, optimize your gig titles with keywords people search for. Share your services on LinkedIn and in relevant Facebook/Reddit communities.\n\nFor your first client, it's okay to charge a bit less to build your reputation. But never work for free. Even $50 for a small project establishes you as a professional.\n\nWhen you land the gig: over-communicate, deliver early, and exceed expectations. Your first review on Fiverr/Upwork is worth its weight in gold.", actions: ["Apply to at least 5 projects per day this week", "Share your services on LinkedIn with a value-driven post", "When you land a client: deliver early and over-deliver on quality"], pansyTip: "Your first client won't find you — you have to find them. Be proactive, keep pitching, and your first 'You're hired!' is coming!", time: "1 week of daily pitching" },
      { step: 7, title: "Deliver Amazing Work", summary: "Your reputation is built one project at a time.", content: "Communication is 50% of freelancing. When you start a project: confirm the scope, agree on the timeline, and set clear expectations about revisions.\n\nDeliver before the deadline. Include a brief note explaining your approach and any decisions you made. Ask: \"Is there anything you'd like adjusted?\" This shows professionalism and prevents scope creep.\n\nAfter they approve: ask for a review. A simple \"I'd really appreciate a review on Fiverr/Upwork — it helps me grow my business!\" works perfectly.", actions: ["Set clear expectations at the start of every project", "Deliver before the deadline with a professional handoff note", "Ask for a review after every completed project"], pansyTip: "Under-promise and over-deliver. If they expect it in 5 days and you deliver in 3, you're already their favorite freelancer!", time: "Per project" },
      { step: 8, title: "Get Reviews & Testimonials", summary: "Build social proof that makes new clients choose you without hesitating.", content: "After 3-5 completed projects with great reviews, you'll notice something magic: clients start coming to YOU. Your profile ranks higher, you show up in more searches, and your reviews do the selling for you.\n\nAsk every client: \"Would you be open to providing a brief testimonial I can use on my portfolio?\" Collect these in a Google Doc and add the best ones to your profiles and portfolio.\n\nShare wins on social media: \"Just wrapped up a project for an amazing client!\" (with permission). This attracts new clients who see you're active and in demand.", actions: ["Collect testimonials from your first 3-5 clients", "Add the best testimonials to your portfolio and profiles", "Share a project win on LinkedIn or Instagram"], pansyTip: "Every review is compound interest for your freelance career. They build on each other and make everything easier over time!", time: "Ongoing" },
      { step: 9, title: "Raise Your Rates", summary: "You're no longer a beginner — your prices should reflect that.", content: "After 5-10 completed projects, raise your rates by 25-50%. New clients get the new rate; existing clients get grandfathered in (or raised gradually).\n\nNever apologize for raising rates. You're more experienced, faster, and deliver better quality. That's worth more money. Period.\n\nIf a client pushes back on your new rates, that's okay — they weren't your ideal client anyway. The right clients pay for quality and are happy to do it.", actions: ["Calculate your new rates (25-50% increase)", "Update your Fiverr/Upwork pricing", "For existing clients: communicate the rate increase with 30 days notice"], pansyTip: "Raising your rates feels scary, but it's how you grow. You'll lose some cheap clients and gain better ones. That's a trade-up!", time: "30 min" },
      { step: 10, title: "Build Recurring Clients", summary: "Monthly retainers beat one-off gigs every time.", content: "After delivering great work, pitch ongoing support: \"Would you be interested in a monthly package? I can handle your [service] on an ongoing basis for $X/month — that way you always have consistent, quality work without finding someone new each time.\"\n\nRetainers provide predictable income: 3 clients at $500/month = $1,500/month guaranteed. That's life-changing stability.\n\nPrioritize retainer clients: give them priority turnaround, occasional bonuses, and proactive suggestions. These relationships are your business foundation.", actions: ["Pitch a monthly retainer to your best client", "Create a retainer package with clear monthly deliverables", "Set a goal: 3 retainer clients within 3 months"], pansyTip: "Retainers are the difference between 'I hope I get work this month' and 'I know exactly what's coming in.' Build those relationships!", time: "Ongoing" },
      { step: 11, title: "Create Systems & Templates", summary: "Work faster by building templates and processes you reuse.", content: "By now you've done enough projects to see patterns. Create templates for everything: proposals, onboarding emails, project checklists, common deliverables, and invoice templates.\n\nUse tools to streamline: Notion for project management, Wave for invoicing (free), Calendly for scheduling calls, and Google Drive for file delivery.\n\nWith good systems, a task that used to take 3 hours might take 1 hour. Same rate, less time = higher effective hourly rate. That's working smarter.", actions: ["Create templates for your top 3 most common deliverables", "Set up a project management system (Notion or Trello)", "Automate invoicing with Wave or FreshBooks"], pansyTip: "Systems are what separate freelancers who burn out from freelancers who thrive. Build them now, thank yourself later!", time: "2 hours" },
      { step: 12, title: "Scale Beyond Solo", summary: "You're in business! Grow beyond trading time for money.", content: "You've built a real freelance business with clients, reviews, systems, and steady income. Now think bigger.\n\nOptions to scale: 1) Raise rates again (your experience justifies it). 2) Create a course or guide teaching your skill ($500-2,000 passive income). 3) Hire a subcontractor to handle overflow work (you manage, they deliver, you keep the margin). 4) Productize your service (turn your custom work into a template others can buy).\n\nConsider forming an LLC, opening a business bank account, and setting aside 25-30% for taxes. You're not just a freelancer anymore — you're a business owner.\n\nBuild a professional website to showcase your services, testimonials, and portfolio — it makes you look legit and lets clients find you outside of freelance platforms.\n\nYou turned your skills into income. You proved you can support yourself doing work you're good at. That's freedom, and you earned it.", actions: ["Pick one scaling strategy and start implementing it", "Look into forming an LLC for tax benefits", "Build a professional website for your freelance business", "Set a 12-month income goal for your freelance business"], pansyTip: "You went from 'Can I really do this?' to running a real business. The answer was always yes — you just needed to start!", time: "Ongoing", links: [{ label: "Build Your Website with Hostinger →", url: AFF.hostinger }] },
    ],
  },
  {
    type: "content_creator",
    title: "Content Creator",
    emoji: "📱",
    subtitle: "Build an audience and monetize your voice",
    color: "#06B6D4",
    earnings: "$500 – $5,000/mo",
    pansyIntro: "Everyone consumes content — but creators are the ones getting paid. YouTube, TikTok, Instagram, blogging — pick your platform and let's build your audience and income!",
    steps: [
      { step: 1, title: "Choose Your Platform", summary: "Pick the platform where your content style fits best.", content: "Don't try to be everywhere at once. Pick ONE primary platform:\n\n- TikTok: short-form video, fast growth, younger audience. Best for entertainment, tips, and personality-driven content.\n- YouTube: long-form video, highest earning potential, search-driven. Best for tutorials, reviews, and educational content.\n- Instagram: visual content, strong for lifestyle/beauty/food niches. Best for aesthetics and community building.\n- Blog/Newsletter: written content, great for SEO traffic. Best for detailed guides, reviews, and niche authority.\n\nPick based on what you enjoy creating, not what's \"hot.\" You need to post consistently for months — choose something you won't hate doing.", actions: ["Evaluate each platform based on your content style", "Pick ONE platform as your primary focus", "Create or optimize your account on that platform"], pansyTip: "The best platform is the one you'll actually use consistently. Pick what feels natural — you can expand later!", time: "30 min" },
      { step: 2, title: "Pick Your Niche", summary: "Find the intersection of what you love, what you know, and what people want.", content: "A niche isn't a prison — it's a focus. \"Personal finance for women in their 20s\" is better than \"money stuff.\" \"Easy weeknight dinners for busy moms\" is better than \"cooking.\"\n\nThe sweet spot: something you can talk about for hours + something people actively search for + something you can eventually monetize. If two of three are there, you're golden.\n\nDon't pick a niche just because it's profitable if you hate the topic. You'll burn out by month 2. The best creators are genuinely passionate about what they share.", actions: ["Write down 5 topics you could talk about endlessly", "Search each on YouTube/TikTok — is there an audience?", "Pick the niche that combines your passion with audience demand"], pansyTip: "Your unique perspective IS your niche advantage. Nobody else has your exact story, experience, and personality!", time: "30 min" },
      { step: 3, title: "Set Up Your Channel", summary: "Optimize your profile so people know exactly what you're about.", content: "Your profile needs to answer three questions in 3 seconds: Who are you? What do you create? Why should I follow?\n\nProfile name: use your real name or a memorable brand name. Bio: one clear sentence about what value you provide. Profile photo: clear, friendly, well-lit.\n\nCreate a content \"trailer\" or introduction post: 30-60 seconds explaining who you are and what people will get by following you. Pin it to the top of your profile.", actions: ["Optimize your profile: name, bio, photo", "Create an introduction video/post and pin it", "Set up a consistent visual style (colors, fonts in Canva)"], pansyTip: "Your profile is your storefront. Make it clear, inviting, and impossible to scroll past without hitting 'Follow!'", time: "1 hour" },
      { step: 4, title: "Create Your First 5 Posts", summary: "Start posting — the only way to learn is by doing.", content: "Your first 5 posts should cover the fundamentals of your niche. If you're in personal finance: budgeting basics, savings tips, investing 101, debt payoff strategies, money mindset. These establish your expertise.\n\nDon't aim for perfection — aim for consistency. Your first videos WILL be awkward. Your first blog posts WILL feel rough. That's completely normal and expected.\n\nBatch create: film all 5 in one day, edit over 2-3 days, then schedule them to post over 1-2 weeks. Batching saves time and keeps you consistent.", actions: ["Plan 5 post topics covering your niche fundamentals", "Batch film/write all 5 in one session", "Post 1 per day for 5 days (or schedule them)"], pansyTip: "Nobody's first video was perfect. Not a single successful creator started with a masterpiece. They started with a mess — and got better. You will too!", time: "Half a day" },
      { step: 5, title: "Learn the Algorithm", summary: "Understand how the platform decides who sees your content.", content: "Every platform algorithm cares about one thing: engagement. Do people watch, like, comment, share, and save your content?\n\nFor short-form (TikTok/Reels): watch time is king. Hook in the first 2 seconds, keep it under 30 seconds when starting, and end with a call to action (\"Follow for more!\"). For YouTube: click-through rate (thumbnail + title) and watch time. For blogs: SEO keywords and time on page.\n\nPost when your audience is active: check your analytics after 2 weeks to see when your followers are online. And always, ALWAYS respond to comments — the algorithm rewards active conversations.", actions: ["Research your platform's algorithm basics (YouTube search: '[platform] algorithm 2024')", "Write down 5 hook ideas that would stop YOU from scrolling", "Commit to responding to every comment for your first month"], pansyTip: "The algorithm isn't your enemy — it's your amplifier. Create content people want to watch, and the algorithm will do the rest!", time: "45 min" },
      { step: 6, title: "Apply for Monetization", summary: "Set up the basics so you can start earning from your content.", content: "YouTube Partner Program: 1,000 subscribers + 4,000 watch hours. TikTok Creator Fund: 10,000 followers + 100,000 views in 30 days. Instagram: currently through bonuses and brand partnerships.\n\nWhile you build toward these thresholds, you can still make money: affiliate links in your bio/descriptions, promoting your own digital products, and small brand deals.\n\nSet up your affiliate accounts NOW: Amazon Associates, ShareASale, and any brand-specific programs in your niche. When you mention a product in your content, use your affiliate link — even small commissions add up.", actions: ["Check your platform's monetization requirements", "Sign up for Amazon Associates and 2 niche affiliate programs", "Add affiliate links to your bio and content descriptions"], pansyTip: "Don't wait for the monetization threshold to start earning. Affiliate links can make money from Day 1!", time: "1 hour" },
      { step: 7, title: "The 30-Day Challenge", summary: "Post every single day for 30 days — this is where growth happens.", content: "Commit to posting one piece of content every day for 30 days. This sounds intense, but it's the single fastest way to grow. You'll learn what works, what doesn't, and get comfortable creating at speed.\n\nBatch create on weekends: film 7 videos on Saturday, edit on Sunday, schedule for the week. That way you're not scrambling every day.\n\nTrack everything: post time, topic, format, views, engagement. By day 30 you'll have real data about what your audience responds to. That data is worth more than any course.", actions: ["Commit to 30 days of daily posting", "Set up a batch creation day (film 7 at once)", "Create a simple tracking spreadsheet for your daily stats"], pansyTip: "30 days of daily posting will teach you more than 30 hours of watching 'how to grow' videos. Just START!", time: "30 days" },
      { step: 8, title: "Grow Your Audience", summary: "Use proven strategies to grow from 100 to 1,000 to 10,000 followers.", content: "Collaboration is the fastest growth hack. Find creators in your niche with similar follower counts and propose: a duet/stitch (TikTok), a collab video (YouTube), or a joint Instagram Live. You share audiences and both grow.\n\nEngage genuinely in your niche community. Comment on other creators' posts (real comments, not \"nice!\" spam). Join Facebook groups and Reddit communities. Give value freely — people follow people who help them.\n\nRepurpose your best content across platforms: turn a TikTok into an Instagram Reel, turn a YouTube video into 3 shorts, turn a blog post into a carousel. Same effort, multiple platforms.", actions: ["Reach out to 3 creators for collaborations", "Spend 15 min/day engaging in your niche community", "Repurpose your top 3 performing posts to a second platform"], pansyTip: "Growth isn't about hacks — it's about consistently showing up and providing value. The followers come when the value is there!", time: "Ongoing" },
      { step: 9, title: "Add Affiliate Income", summary: "Start earning commissions by recommending products you genuinely love.", content: "Only promote products you actually use and believe in. Your audience trusts you — breaking that trust for a quick commission is never worth it.\n\nCreate dedicated \"recommendation\" content: \"My favorite budgeting tools\" with affiliate links, product reviews with your honest take, \"what's in my bag\" style content. These types of videos have long shelf lives and keep earning.\n\nUse link-in-bio tools like Stan Store, Linktree, or Beacons to organize your affiliate links. Track which links get the most clicks and create more content about those products.", actions: ["Set up a link-in-bio page with your top affiliate links", "Create 3 pieces of content recommending products with affiliate links", "Track which products/links convert best"], pansyTip: "Only recommend what you'd recommend to your best friend. Authenticity is your most valuable asset — protect it!", time: "1 hour setup + ongoing" },
      { step: 10, title: "Land Your First Sponsorship", summary: "Brands want to pay you to talk about their products. Here's how.", content: "You don't need 100K followers for sponsorships. Brands are increasingly working with micro-influencers (1K-10K) because engagement rates are higher.\n\nCreate a simple media kit (1-2 pages in Canva): your niche, follower count, engagement rate, audience demographics, and example content. Include your rates: $100-500 per post for micro-influencers is standard.\n\nReach out to brands you already use: \"I've been using [product] for [months/years] and my audience frequently asks about it. I'd love to create sponsored content for you. Here's my media kit.\" Direct outreach works better than waiting to be discovered.", actions: ["Create a 1-page media kit with your stats and rates", "Reach out to 5 brands you already use with a sponsorship pitch", "Join influencer marketplaces like AspireIQ or Grin"], pansyTip: "Brands WANT to work with smaller creators — you just have to ask! The worst they can say is 'not right now.'", time: "2 hours" },
      { step: 11, title: "Create Your Own Products", summary: "The highest-margin income comes from selling your own stuff.", content: "You've built an audience that trusts your expertise. Now sell them something that genuinely helps:\n\n- Digital products: ebooks, templates, planners, presets (see our Digital Products journey!)\n- Courses: teach your skill in a structured format ($49-499)\n- Membership: exclusive content, community, live Q&As ($9-29/month)\n- Merch: t-shirts, mugs, stickers (use print-on-demand like Printful or Printify — no inventory needed)\n\nFor merch, Printful and Printify connect to your website and handle printing, packing, and shipping. You design it, they make it. Zero upfront cost. Printful is great for premium quality; Printify gives you more supplier options and often lower prices. Try both and see which fits your brand!\n\nStart with ONE product. Your most-asked question = your first product. If people keep asking \"how do you edit your videos?\" — sell an editing tutorial or preset pack.", actions: ["Identify your audience's #1 most-asked question", "Create a digital product that answers it", "Promote it in your content and link in bio"], links: [{ label: "Build Your Store with Hostinger →", url: AFF.hostinger }, { label: "Try Printful →", url: AFF.printful }, { label: "Try Printify →", url: AFF.printify }], pansyTip: "Your audience is telling you what to sell — listen to their questions, their comments, their DMs. That's market research for free!", time: "1 week" },
      { step: 12, title: "Build a Media Business", summary: "You're not just a creator — you're a brand. Let's build accordingly.", content: "At this point you have multiple income streams: ad revenue, affiliates, sponsorships, and your own products. You're not a side hustler anymore — you're a media business.\n\nDiversify your platforms: use your primary to drive traffic, but build an email list and a website. Platforms change algorithms, but your email list is yours forever. Hostinger makes it super easy to get a professional website up for cheap.\n\nThink about your long-term brand: what do you want to be known for? Start saying no to sponsorships and opportunities that don't align. Protect your brand — it's your most valuable asset.\n\nYou started by posting one awkward video. Now you have an audience, multiple income streams, and a brand that matters. Every big creator started exactly where you started. The difference? You kept going.", actions: ["Start building an email list (use ConvertKit or Mailchimp)", "Create a simple website as your home base", "Write a brand mission statement: who you serve and why"], links: [{ label: "Build Your Website with Hostinger →", url: AFF.hostinger }], pansyTip: "You went from 'should I even post this?' to running a media business. Every single post was worth it. I'm so proud of what you've built!", time: "Ongoing" },
    ],
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function SideHustlePage() {
  const { isPro, isLoggedIn, userId } = useSubscription();
  const [selectedHustle, setSelectedHustle] = useState<HustleType | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [allProgress, setAllProgress] = useState<Record<string, number[]>>({});
  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const hustle = HUSTLES.find((h) => h.type === selectedHustle);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await db.from("side_hustle_progress").select("hustle_type,completed_steps").eq("user_id", userId);
      if (data) {
        const map: Record<string, number[]> = {};
        data.forEach((row: any) => { map[row.hustle_type] = row.completed_steps || []; });
        setAllProgress(map);
      }
    })();
  }, [userId, selectedHustle]);

  const loadProgress = useCallback(async (type: HustleType) => {
    if (!userId) return;
    const { data } = await db.from("side_hustle_progress").select("*").eq("user_id", userId).eq("hustle_type", type).single();
    if (data) {
      setCompletedSteps(data.completed_steps || []);
      const maxCompleted = Math.max(0, ...(data.completed_steps || []));
      setExpandedStep(maxCompleted < 12 ? maxCompleted + 1 : 12);
      setJourneyComplete(!!data.completed_at);
    } else {
      setCompletedSteps([]);
      setExpandedStep(1);
      setJourneyComplete(false);
    }
  }, [userId]);

  const saveProgress = useCallback(async (type: HustleType, steps: number[], done: boolean) => {
    if (!userId) return;
    await db.from("side_hustle_progress").upsert({
      user_id: userId,
      hustle_type: type,
      completed_steps: steps,
      completed_at: done ? new Date().toISOString() : null,
    }, { onConflict: "user_id,hustle_type" });
  }, [userId]);

  useEffect(() => { setLoading(false); }, []);

  useEffect(() => {
    if (selectedHustle && userId) loadProgress(selectedHustle);
  }, [selectedHustle, userId, loadProgress]);

  const selectHustle = (type: HustleType) => { setSelectedHustle(type); haptic(12); };

  const completeStep = async (stepNum: number) => {
    if (!selectedHustle || completedSteps.includes(stepNum)) return;
    haptic(20);
    const newCompleted = [...completedSteps, stepNum].sort((a, b) => a - b);
    setCompletedSteps(newCompleted);
    setCelebrating(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: [hustle?.color || "#49B06E", "#27B7C8", "#F4F7FA"] });
    const isComplete = newCompleted.length === 12;
    if (isComplete) {
      setJourneyComplete(true);
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: [hustle?.color || "#49B06E", "#27B7C8", "#F4F7FA", "#F59E0B", "#8B5CF6"] });
      }, 500);
    } else {
      setExpandedStep(stepNum + 1);
      setTimeout(() => {
        stepRefs.current[stepNum + 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
    await saveProgress(selectedHustle, newCompleted, isComplete);
    setAllProgress(prev => ({ ...prev, [selectedHustle]: newCompleted }));
    setTimeout(() => setCelebrating(false), 1500);
  };

  const encouragement = [
    { who: "\u{1F33A}", msg: "You're doing amazing!" },
    { who: "⚡", msg: "That's the hustle spirit! Keep it moving!" },
    { who: "\u{1F33A}", msg: "One step closer to your dream!" },
    { who: "⚡", msg: "You just leveled up. Next step, let's GO!" },
    { who: "\u{1F33A}", msg: "This is YOUR time!" },
    { who: "⚡", msg: "Most people quit by now. Not you though." },
    { who: "\u{1F33A}", msg: "Proud of you, queen!" },
    { who: "⚡", msg: "The money's getting closer. I can feel it!" },
    { who: "\u{1F33A}", msg: "Every step counts. Keep going!" },
    { who: "⚡", msg: "You're built for this. No question." },
  ];

  const totalSteps = Object.values(allProgress).reduce((sum, steps) => sum + steps.length, 0);
  const totalPercent = Math.round((totalSteps / 72) * 100);
  const hustlesStarted = Object.values(allProgress).filter(s => s.length > 0).length;

  return (
    <>
      <Head>
        <title>Side Hustle Journeys — Start a Business From $0 | Bloom</title>
        <meta name="description" content="6 guided side hustle journeys: dropshipping, TikTok Shop, content creation, digital products, freelancing, and UGC. 12 steps each, from zero to earning. Start a side business from your phone with Lexi's step-by-step coaching. For women who need income that works around their kids." />
      </Head>
      <Layout>
        <div className="min-h-screen" style={{ background: C.bg }}>
          <div className="max-w-2xl mx-auto px-4 py-6 pb-32">

            {!isPro && (
              <div className="mb-4">
                <AdMobBanner format="banner" />
              </div>
            )}

            {/* ═══ HUSTLE PICKER ═══ */}
            {!selectedHustle && (
              <div className="space-y-5" style={{ animation: "fadeIn 0.5s ease-out" }}>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    {"⚡"}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" style={{ color: C.text }}>Lexi&apos;s Hustle Lab</h1>
                    <p className="text-xs" style={{ color: C.textMuted }}>12 steps per hustle. Real results.</p>
                  </div>
                </div>

                {/* Overall progress card */}
                <div className="p-5 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                  <div className="flex items-center gap-5">
                    <HustleRing percent={totalPercent} size={88} color="#F59E0B" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: C.text }}>Overall Progress</p>
                        <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{hustlesStarted}/6 hustles started</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]" style={{ color: C.textMuted }}>
                          <span>Total steps</span>
                          <span>{totalSteps}/72</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${totalPercent}%`,
                            background: "linear-gradient(90deg, #F59E0B, #27B7C8)",
                            transition: "width 0.7s ease-out",
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hustle grid */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textMuted }}>Choose Your Hustle</p>
                  <div className="grid grid-cols-1 gap-3">
                    {HUSTLES.map((h, i) => {
                      const prog = allProgress[h.type]?.length || 0;
                      const pct = Math.round((prog / 12) * 100);
                      return (
                        <button
                          key={h.type}
                          onClick={() => selectHustle(h.type)}
                          className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                          style={{
                            background: prog > 0 ? `${h.color}06` : C.card,
                            border: `1px solid ${prog > 0 ? `${h.color}20` : C.cardBorder}`,
                            animation: `slideUp 0.4s ease-out ${i * 0.08}s both`,
                          }}
                        >
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: `${h.color}15` }}>
                            {h.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm" style={{ color: C.text }}>{h.title}</p>
                              {prog > 0 && (
                                <span className="text-[10px] font-bold" style={{ color: h.color }}>{prog}/12</span>
                              )}
                            </div>
                            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>{h.subtitle}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <Star className="w-3 h-3" style={{ color: h.color }} />
                              <span className="text-[10px] font-semibold" style={{ color: h.color }}>{h.earnings}</span>
                            </div>
                            {prog > 0 && (
                              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                <div className="h-full rounded-full" style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${h.color}, ${C.accent})`,
                                  transition: "width 0.5s ease-out",
                                }} />
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 shrink-0" style={{ color: C.textMuted }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ JOURNEY VIEW ═══ */}
            {selectedHustle && hustle && (
              <div className="space-y-5" style={{ animation: "fadeIn 0.4s ease-out" }}>
                {/* Header with progress ring */}
                <div>
                  <button
                    onClick={() => { setSelectedHustle(null); setCompletedSteps([]); setJourneyComplete(false); }}
                    className="flex items-center gap-1 text-xs mb-3 transition-colors hover:brightness-125"
                    style={{ color: C.accent }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> All Hustles
                  </button>
                  <div className="p-5 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                    <div className="flex items-center gap-4">
                      <HustleRing percent={Math.round((completedSteps.length / 12) * 100)} size={80} color={hustle.color} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{hustle.emoji}</span>
                          <h1 className="text-lg font-bold" style={{ color: C.text }}>{hustle.title}</h1>
                        </div>
                        <p className="text-xs mt-1" style={{ color: C.textMuted }}>{completedSteps.length}/12 steps complete</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star className="w-3 h-3" style={{ color: hustle.color }} />
                          <span className="text-[10px] font-semibold" style={{ color: hustle.color }}>{hustle.earnings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lexi one-liner */}
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
                  <span className="text-sm shrink-0">{"⚡"}</span>
                  <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
                    <span className="font-bold" style={{ color: "#F59E0B" }}>Lexi: </span>{hustle.pansyIntro}
                  </p>
                </div>

                {/* Journey complete banner */}
                {journeyComplete && (
                  <div className="p-5 rounded-2xl text-center space-y-3" style={{ background: `linear-gradient(135deg, ${hustle.color}15, ${C.accent}10)`, border: `1px solid ${hustle.color}30` }}>
                    <div className="text-4xl mb-2">{"\u{1F389}"}</div>
                    <h2 className="font-bold text-lg mb-1" style={{ color: C.text }}>You Did It!</h2>
                    <p className="text-sm" style={{ color: C.textDim }}>All 12 steps complete — you&apos;re officially in business!</p>
                    <div className="flex flex-col gap-2 pt-2">
                      <p className="text-xs" style={{ color: "#F59E0B" }}>
                        {"⚡"} <strong>Lexi:</strong> Most people just TALK about starting a business. You actually DID it. That&apos;s rare. I&apos;m impressed.
                      </p>
                      <p className="text-xs italic" style={{ color: C.accent }}>
                        {"\u{1F33A}"} <strong>Pansy:</strong> From zero to a real business owner. So proud! {"\u{1F49B}"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phase-grouped steps */}
                <div className="space-y-5">
                  {PHASES.map((phase, pi) => {
                    const phaseCompleted = phase.steps.filter(s => completedSteps.includes(s)).length;
                    const phaseDone = phaseCompleted === phase.steps.length;
                    return (
                      <div key={phase.name} style={{ animation: `slideUp 0.4s ease-out ${pi * 0.1}s both` }}>
                        {/* Phase header */}
                        <div className="flex items-center justify-between mb-2 px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: phaseDone ? hustle.color : C.textMuted }}>
                              {phase.name}
                            </span>
                            <span className="text-[10px]" style={{ color: C.textMuted }}>{phase.desc}</span>
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: phaseDone ? hustle.color : C.textMuted }}>
                            {phaseCompleted}/{phase.steps.length}
                          </span>
                        </div>

                        {/* Phase progress bar */}
                        <div className="h-1 rounded-full overflow-hidden mb-3 mx-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(phaseCompleted / phase.steps.length) * 100}%`,
                            background: `linear-gradient(90deg, ${hustle.color}, ${C.accent})`,
                            transition: "width 0.5s ease-out",
                          }} />
                        </div>

                        {/* Steps in this phase */}
                        <div className="space-y-2">
                          {phase.steps.map(stepNum => {
                            const s = hustle.steps.find(st => st.step === stepNum)!;
                            const isCompleted = completedSteps.includes(s.step);
                            const isExpanded = expandedStep === s.step;
                            const isLocked = !isCompleted && s.step > 1 && !completedSteps.includes(s.step - 1);
                            const canComplete = !isCompleted && !isLocked;

                            return (
                              <div
                                key={s.step}
                                ref={(el) => { stepRefs.current[s.step] = el; }}
                                className="rounded-2xl overflow-hidden transition-all"
                                style={{
                                  background: isCompleted ? `${hustle.color}08` : isExpanded ? "rgba(255,255,255,0.04)" : C.card,
                                  border: `1px solid ${isCompleted ? `${hustle.color}25` : isExpanded ? "rgba(39,183,200,0.2)" : C.cardBorder}`,
                                  opacity: isLocked ? 0.5 : 1,
                                }}
                              >
                                <button
                                  onClick={() => !isLocked && setExpandedStep(isExpanded ? -1 : s.step)}
                                  disabled={isLocked}
                                  className="w-full flex items-center gap-3 p-4 text-left"
                                >
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                                    style={{
                                      background: isCompleted ? hustle.color : isExpanded ? `${hustle.color}20` : "rgba(255,255,255,0.06)",
                                      color: isCompleted ? C.bg : isExpanded ? hustle.color : C.textMuted,
                                    }}
                                  >
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3" /> : s.step}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: isCompleted ? hustle.color : C.text }}>{s.title}</p>
                                    {!isExpanded && <p className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>{s.summary}</p>}
                                  </div>
                                  {!isLocked && (
                                    <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: C.textMuted, transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }} />
                                  )}
                                </button>

                                {isExpanded && !isLocked && (
                                  <div className="px-4 pb-4 space-y-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                                    <div className="flex items-center gap-3 text-xs" style={{ color: C.textMuted }}>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time}</span>
                                      <span>Step {s.step} of 12</span>
                                    </div>
                                    <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: C.textDim }}>{s.content}</div>

                                    {/* Action items */}
                                    <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}` }}>
                                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: hustle.color }}>Action Items</p>
                                      <div className="space-y-2">
                                        {s.actions.map((action, ai) => (
                                          <div key={ai} className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold" style={{ background: `${hustle.color}15`, color: hustle.color }}>{ai + 1}</div>
                                            <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>{action}</p>
                                          </div>
                                        ))}
                                      </div>
                                      {s.links && s.links.length > 0 && (
                                        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                                          <div className="flex flex-wrap gap-2">
                                            {s.links.map((link, li) => (
                                              <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => haptic(8)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-125 active:scale-[0.97]"
                                                style={{ background: `${hustle.color}12`, color: hustle.color, border: `1px solid ${hustle.color}25` }}>
                                                <ExternalLink className="w-3 h-3" />{link.label}
                                              </a>
                                            ))}
                                          </div>
                                          <p className="text-[10px] mt-2 leading-relaxed" style={{ color: C.textMuted }}>
                                            We may earn a small commission at no extra cost to you — it helps keep Bloom free!
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Tips */}
                                    <div className="space-y-2">
                                      {getLexiTip(selectedHustle!, s.step) && (
                                        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                                          <span className="text-sm shrink-0">{"⚡"}</span>
                                          <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#F59E0B" }}>Lexi</span>
                                            <p className="text-xs leading-relaxed mt-0.5" style={{ color: C.textDim }}>{getLexiTip(selectedHustle!, s.step)}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(39,183,200,0.06)" }}>
                                        <span className="text-sm shrink-0">{"\u{1F33A}"}</span>
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.accent }}>Pansy</span>
                                          <p className="text-xs leading-relaxed italic mt-0.5" style={{ color: C.accent }}>{s.pansyTip}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {canComplete && (
                                      <button onClick={() => completeStep(s.step)}
                                        className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                                        style={{ background: `linear-gradient(135deg, ${hustle.color}, ${C.accent})`, color: C.bg }}>
                                        {s.step === 12 ? "Complete Journey!" : "I Did This — Next Step"} <ChevronRight className="w-4 h-4 inline" />
                                      </button>
                                    )}

                                    {isCompleted && (
                                      <div className="flex items-center justify-center gap-2 py-2">
                                        <Check className="w-4 h-4" style={{ color: hustle.color }} />
                                        <span className="text-xs font-semibold" style={{ color: hustle.color }}>Completed</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Celebrating encouragement */}
                {celebrating && !journeyComplete && (
                  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl z-50" style={{ background: `linear-gradient(135deg, ${hustle.color}, ${C.accent})`, boxShadow: `0 8px 30px ${hustle.color}40`, animation: "popIn 0.4s ease-out" }}>
                    <p className="text-sm font-bold text-center" style={{ color: C.bg }}>
                      {encouragement[completedSteps.length % encouragement.length].who}{" "}
                      {encouragement[completedSteps.length % encouragement.length].msg}
                    </p>
                  </div>
                )}

                {!isPro && (
                  <div className="mt-4">
                    <AdMobBanner format="rectangle" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes popIn { from { opacity: 0; transform: translate(-50%, 10px) scale(0.9); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        `}</style>
      </Layout>
    </>
  );
}
