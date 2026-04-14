# Chip Sineath — DevOps / Cloud Engineer Resume
## Draft v1.0 | April 2026

---

## CONTACT
- Email: chip.sineath92@gmail.com
- GitHub: github.com/Chippa88
- Location: Arkansas (Relocating to Charleston, SC — Summer 2026)

---

## PROFESSIONAL SUMMARY

Systems administrator transitioning into DevOps and cloud engineering with hands-on experience in container orchestration, CI/CD pipelines, and full-stack application deployment. Founder of Dropforge — an AI-powered SaaS platform built on a microservices architecture using Shopify OAuth, Stripe billing, OpenAI GPT-4o, and automated deployment pipelines. Demonstrated ability to architect, build, and ship production systems end-to-end with a strong bias toward automation, reliability, and zero-downtime deployments.

---

## TECHNICAL SKILLS

### Cloud & Infrastructure
- Cloud Platforms: (add your current — AWS / Azure / GCP)
- DNS Management: Custom domain configuration, A/CNAME records, TTL management
- Serverless Functions: Deno runtime, edge function deployment (Base44 / Vercel patterns)
- Environment Management: Secrets management, environment variable configuration across dev/prod

### DevOps Practices
- CI/CD: Git-based deployment pipelines, branch strategies (main/feature/backup branches)
- Version Control: Git, GitHub — branching, commits, pull requests, branch protection
- Infrastructure as Code: JSON schema definitions, entity modeling
- Monitoring: Function log analysis, error tracing, deployment verification
- Documentation: Technical changelog authoring, architecture decision records (ADRs)

### Development
- Languages: TypeScript (Deno runtime), JavaScript (React), Python (scripting/automation)
- Frontend: React, JSX, component architecture, responsive design
- Backend: RESTful API design, webhook handling, OAuth 2.0 flows
- Databases: NoSQL entity modeling, row-level security (RLS), schema design

### Integrations & APIs
- Shopify Partner API: OAuth install/callback flows, offline access token management, HMAC verification
- Stripe API: Subscription billing, webhook event handling, trial period management, checkout sessions
- OpenAI API: GPT-4o prompt engineering, AI-generated product content pipelines
- CJ Dropshipping API: V2 product sourcing, catalog search, trend data
- Resend API: Transactional email delivery, HTML email templating
- Google Workspace APIs: Docs, Drive, Sheets — automated documentation pipelines
- GitHub API: Programmatic repository management, file commits, branch creation

---

## PROJECTS

### Dropforge — Founder & Lead Architect
*AI-Powered Shopify Dropshipping Automation Platform*
**April 2026 — Present | dropforge.pro**

Built a full-stack SaaS platform from the ground up using a serverless microservices architecture.

**Architecture Decisions:**
- Designed 9 backend functions handling OAuth, billing, AI pipelines, product publishing, and email delivery
- Implemented Shopify OAuth 2.0 with HMAC verification and offline access token storage for background automation
- Built a multi-store management system supporting up to 5 connected Shopify stores per account
- Engineered an AI product pipeline: CJ Dropshipping → GPT-4o generation → Approval queue → Shopify publish
- Designed dual-digest email system: 8AM operational digest + 9AM performance analytics digest (Pro tier)
- Implemented Stripe subscription billing with 7-day card-upfront trials and webhook-driven plan management
- Built a private community feature with threaded feed, real-time chat (polling architecture), and 4 post types
- Managed Git branching strategy: backup/phase5-stable (frozen release), main (active development)

**Key Technical Achievements:**
- Debugged and resolved Shopify OAuth redirect loop caused by misconfigured App URL vs. Redirect URL
- Identified and fixed Base44 platform constraint: Login pages are reserved built-in routes, not navigable via React Router
- Architected stateless serverless OAuth flow without session cookies using HMAC parameter verification
- Designed RLS-compliant data model ensuring complete tenant isolation across all user data

**Stack:** TypeScript, Deno, React, Shopify API, Stripe API, OpenAI API, CJ Dropshipping API, Resend, GitHub

---

### Canvass (rebranding in progress) — B2B Lead Generation SaaS
*AI-Powered Business Outreach Platform*
**April 2026 | [domain TBD]**

Built a B2B lead generation and cold email SaaS platform with:
- Google Places + Geocoding API integration for local business discovery
- CRM contact management with usage tracking and monthly quota resets
- Stripe subscription billing (tiered: $29/$59/$99)
- Admin analytics dashboard for subscriber and enterprise lead management
- Automated webhook handling for plan lifecycle management

---

### Stump Daddy Co. — Business Formation & Branding
*Stump Grinding / Land Clearing Services*
**April 2026**

- Filed DBA registration in Arkansas
- Designed brand identity (vintage badge logo, vehicle wrap spec)
- Built B2B outreach CRM web application for targeting tree trimming companies
- Developed B2B partnership pitch documentation

---

## PROFESSIONAL EXPERIENCE

### [Current Employer] — Systems Administrator
*[Dates] — Present*
- [Add your current responsibilities here]
- Focus on: server management, network infrastructure, user account management, etc.

---

## CERTIFICATIONS & LEARNING
- Currently studying: Kubernetes (K8s), container orchestration, Linux administration
- Target: CKA (Certified Kubernetes Administrator) — [target date]
- Target: AWS Solutions Architect Associate — [target date]

---

## EDUCATION
- [Your education here]

---

## GITHUB ACTIVITY
- Active contributor: github.com/Chippa88/dropforge
- Commits demonstrate: function architecture, OAuth flow debugging, multi-environment branching strategy

---

*Resume maintained and updated in .agents/projects/resume_devops.md*
*Last updated: April 14, 2026*
