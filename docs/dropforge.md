# Dropforge — Project File
**Last Updated:** 2026-04-13
**Status:** Planning / Pre-Build

---

## What It Is
An AI-powered Shopify automation SaaS that handles the hardest parts of dropshipping for users. They connect their Shopify store, pick a niche, and the app does the rest — finding trending products, writing descriptions, setting prices, sourcing images, and posting listings automatically. Users get a clean daily digest email of what matters and spend minimal time managing their store.

---

## The Problem It Solves
Dropshipping is popular but overwhelming. The #1 pain points are:
- Hours spent on product research
- Writing compelling product descriptions
- Figuring out competitive pricing
- Keeping listings fresh and trending
- Managing it all while working a full-time job or raising a family

Dropforge removes all of that.

---

## Target Customer
- Stay-at-home parents who want income without a 9-5
- Side hustlers who want passive income
- People who've tried dropshipping and quit because it was too time-consuming
- Beginners who are intimidated by the research and setup

---

## Core Features (MVP)
1. **Shopify OAuth Connect** — user links their store in one click
2. **Niche Selector** — user picks their store type (fitness, pets, home decor, etc.)
3. **Trend Scanner** — AI finds trending products in their niche using Google Trends + AliExpress/Amazon data
4. **AI Product Generator** — writes title, description, pricing, and tags for each product
5. **Auto-Publisher** — posts approved products directly to their Shopify store
6. **Approval Queue** — optional review step before anything goes live (user can approve/reject)
7. **Daily Digest Email** — clean summary of new listings, sales activity, and anything needing attention
8. **Dashboard** — simple overview of store health, products posted, recent activity

---

## Pricing Model (Proposed)
| Plan | Price | Products/mo | Features |
|------|-------|-------------|----------|
| Starter | $29/mo | 20 products | Auto-post, daily digest, 1 niche |
| Growth | $59/mo | 75 products | Everything + multi-niche, priority trends |
| Pro | $99/mo | Unlimited | Everything + analytics, custom digest schedule |

---

## Tech Stack (Planned)
- **Frontend:** React (Base44 mini apps)
- **Backend:** Base44 backend functions (Deno/TypeScript)
- **Database:** Base44 entities
- **Shopify:** Shopify Partner API + OAuth
- **Trend Data:** Google Trends API, AliExpress API or scraper, Amazon Best Sellers
- **AI:** OpenAI GPT-4 for product descriptions, titles, pricing logic
- **Email Digest:** SendGrid or similar
- **Payments:** Stripe subscriptions

---

## Build Phases — Detailed

---

### PHASE 1 — Foundation (Weeks 1-2)
*Goal: Get the skeleton of the app live with working login, Shopify connection, and billing.*

- **Set up the database structure**
  - I will create entities (database tables) for: Users, Stores, Products, Niches, and Subscriptions
  - Each entity will have the right fields — for example, a Store record will hold the Shopify store URL, access token, and which niche the user picked
  - You don't need to do anything here — just know this is the "filing cabinet" behind the scenes

- **Build Shopify OAuth connection**
  - I will build the flow that lets a user click "Connect Your Shopify Store" and authorize our app to access their store
  - This uses Shopify's official Partner API — which is why you need the Shopify Partner account first
  - Once connected, we'll store their access token securely so the app can post products on their behalf at any time
  - **What you do:** Create your Shopify Partner account at partners.shopify.com and share the API credentials with me

- **Build the basic dashboard UI**
  - I will build the main screen users see after logging in
  - It will show: store connection status, their selected niche, products posted this month, subscription plan, and quick action buttons
  - Think of it like a cockpit — simple, clean, everything important at a glance
  - You will review what I build and tell me if anything feels off or confusing

- **Set up Stripe subscription billing**
  - I will build the checkout flow for all three plans (Starter $29, Growth $59, Pro $99)
  - When a user picks a plan, they get sent to Stripe's secure checkout, pay, and come back to the app with their plan activated
  - I will also set up a webhook so the app automatically knows if someone cancels, upgrades, or their payment fails
  - **What you do:** Create a Stripe account and share the API keys with me (same process we did for Canvass)

- **Build the niche selector onboarding**
  - First thing a new user does after signing up is pick their niche — fitness, pets, home decor, kitchen gadgets, etc.
  - I will build a clean visual picker with icons for each category
  - We will define the niche list together — I'll suggest a starting set and you tell me what to add or remove
  - Users on higher plans can select multiple niches

---

### PHASE 2 — The AI Engine (Weeks 3-4)
*Goal: Build the brain of the product — the part that finds products and writes everything.*

- **Connect to Google Trends**
  - I will build a backend function that queries Google Trends for what's currently trending in the user's niche
  - This runs automatically on a schedule — for example, every day it checks what's hot in "pet accessories" and builds a list of candidate products
  - You won't see this part directly — it runs silently in the background

- **Connect to AliExpress for product sourcing**
  - AliExpress is the most popular dropshipping supplier — most products on Shopify dropshipping stores come from there
  - I will build a function that takes a trending product keyword and finds matching products on AliExpress including price, images, and supplier info
  - This becomes the raw material that the AI then polishes into a real listing
  - **Note:** We may need an AliExpress API key or use their affiliate program for access — I'll handle figuring this out

- **Build the AI product generator**
  - This is the core of the whole product — using OpenAI GPT-4, I will build a function that takes a raw AliExpress product and transforms it into:
    - A compelling, SEO-friendly product title
    - A full marketing-style product description (benefits-focused, not just specs)
    - A suggested retail price (based on AliExpress cost + a healthy markup formula)
    - Relevant tags and categories for Shopify
  - **What you do:** Provide your OpenAI API key so the AI generation works

- **Build the approval queue UI**
  - Before anything goes live on a user's Shopify store, they see it here first
  - The queue shows: product image, AI-generated title, description, suggested price, and the source from AliExpress
  - User can hit Approve (posts it), Edit (tweak anything before posting), or Reject (skip it)
  - This gives users control and peace of mind — nothing posts without their knowledge
  - For power users who trust the system, we'll add a "full auto" toggle that skips the queue entirely

- **Source and handle product images**
  - I will pull images directly from AliExpress listings
  - For higher quality, I'll explore using AI image generation to create cleaner product photos
  - Images get attached to the product automatically before it hits the approval queue

---

### PHASE 3 — Auto-Publisher (Week 5)
*Goal: Make products actually appear in users' Shopify stores automatically.*

- **Build the Shopify product posting engine**
  - Using the Shopify API, I will build the function that takes an approved product and creates a real listing in the user's store
  - It will set the title, description, price, images, tags, inventory settings, and supplier info all in one shot
  - The user never has to touch their Shopify backend — it just appears

- **Test the full end-to-end loop**
  - We will run through the complete flow together: trend detected → AI generates product → shows in approval queue → user approves → product appears in test Shopify store
  - **What you do:** This is where your free Shopify dev store comes in — we test everything here before it touches a real store
  - We will do multiple test runs across different niches to make sure it works consistently

- **Handle errors and edge cases**
  - What happens if AliExpress is down? What if the AI generates something weird? What if Shopify rejects a listing?
  - I will build safety nets — retry logic, error notifications, fallback behavior — so the app doesn't just silently fail
  - Users will get notified if something needs their attention

- **Set up rate limit management**
  - Shopify and AliExpress both have limits on how many requests we can make per minute
  - I will build a queue system so the app spaces out its requests and never gets blocked
  - This is invisible to users but critical for reliability

---

### PHASE 4 — Daily Digest Email (Week 6)
*Goal: Build the feature your wife will love most — the clean daily inbox summary.*

- **Design the digest email template**
  - Clean, simple, mobile-friendly email that arrives once a day
  - Contains: number of new products posted, any sales activity from Shopify, items sitting in the approval queue waiting for a decision, and anything that needs attention (failed posts, billing issues, etc.)
  - Written in plain English — no jargon, no overwhelming data dumps
  - We will design this together — I'll build a first version and you and your wife can tell me what to change

- **Set up the daily automation**
  - I will create a scheduled automation that runs every morning at a time the user chooses
  - It pulls fresh data from their store and our app, compiles it, and sends the digest
  - Users can set their preferred delivery time in settings (e.g. 8am every day)

- **Connect to an email sending service**
  - I will integrate SendGrid (free tier is generous) to handle the actual email delivery
  - Emails will come from a professional address like updates@yourproductname.com
  - **What you do:** Once we have a product name and domain, set up a business email address

- **Build digest preferences in settings**
  - Users can customize what shows up in their digest
  - Toggle on/off: new products, sales, queue reminders, tips
  - Pro users get a more detailed digest with trend insights and performance data

---

### PHASE 5 — Polish & Launch (Weeks 7-8)
*Goal: Make it look real, get first users, and go live.*

- **Build the public landing page**
  - A dark, professional marketing page (similar to Canvass but better)
  - Sections: hero headline, how it works (3 steps), features, pricing, testimonials placeholder, FAQ
  - Strong call to action: "Connect Your Store Free" or "Start Your Free Trial"
  - I will build this — you review and give feedback on messaging

- **Build a proper onboarding flow**
  - New users go through a guided setup: connect store → pick niche → set digest time → pick plan
  - Should take under 5 minutes and feel effortless
  - End of onboarding: first batch of products already in their approval queue waiting

- **Beta test with real people**
  - Before going public, we test with 3-5 real users — friends, family, or people from dropshipping communities
  - This surfaces real bugs and real feedback that we can't predict ourselves
  - **What you do:** Identify 3-5 people willing to test it for free in exchange for honest feedback

- **Go live on Stripe**
  - Switch from Stripe test mode to live mode — real payments start working
  - **What you do:** Complete Stripe's business verification (takes 1-2 days, they just need basic business info)

- **Launch**
  - Post in dropshipping communities on Reddit (r/dropshipping, r/entrepreneur), Facebook groups, TikTok if your wife wants to be the face of it
  - A genuine "I built this for my family" story is incredibly compelling and costs nothing
  - First 10 customers get a discounted rate as founding members — creates urgency and loyalty

---

## What Chip Needs to Do (Action Items in Order)

- [ ] 1. Create a **Shopify Partner account** at partners.shopify.com (free)
- [ ] 2. Create a **Stripe account** at stripe.com (free)
- [ ] 3. Create an **OpenAI account** at platform.openai.com — add $20 in credits
- [ ] 4. Create a free **Shopify dev store** through your Partner account for testing
- [ ] 5. **Pick a product name** — Dropforge is placeholder, needs something great
- [ ] 6. (Later) Set up a **business email** for the digest to send from
- [ ] 7. (Later) Complete **Stripe business verification** before launch
- [ ] 8. (Later) Find **3-5 beta testers** from your network

---

## Open Questions
- What should the product be named?
- Should full auto-post (no approval queue) be available on all plans or only Pro?
- Which dropshipping suppliers to prioritize? (AliExpress, CJDropshipping, Spocket)
- Does the wife want to be the face of the brand for marketing purposes?
- Free trial or freemium tier?

---

## Notes & Decisions Log
- 2026-04-13: Project initiated. Chip confirmed he understands dropshipping and loves the concept. Wife is the primary target user/operator. Product should feel passive — wife checks a tailored inbox once a day.
- 2026-04-13: Full 5-phase build plan locked in with detailed sub-steps. Chip approved the plan and sequence. Action items confirmed in order.
