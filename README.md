# NammaSeve (ನಮ್ಮ ಸೇವೆ)
### AI-Powered Government Scheme Discovery Platform
> **Accessible Minimalist Indian Civic Portal • Live Web Search • Zero Preseeded Schemes • Groq AI Integration**

NammaSeve helps citizens across India discover genuine Central and State government welfare schemes relevant to their personal circumstances through live web search and deterministic eligibility matching.

---

## 🏛️ 1. Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │                     React Frontend                     │
               │   TypeScript + Vite + Tailwind CSS + react-i18next     │
               │   Accessible Minimalist Design + Kalpavriksha Logo     │
               └───────────────────────────┬────────────────────────────┘
                                           │
                    Direct Public Operations (RLS Enforced)
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Supabase Cloud Platform                                   │
│                                                                                        │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │     Supabase Auth     │  │   PostgreSQL + RLS      │  │  Supabase Edge Funcs    │  │
│  │ Email / Password Auth │  │ Profiles, Saved, History│  │ Deno / TypeScript       │  │
│  │ Session Management    │  │ Search Cache, Ingestion │  │ discover-schemes        │  │
│  │                       │  │ Audit Events, Schemes   │  │ explain-scheme          │  │
│  └───────────────────────┘  └─────────────────────────┘  └────────────┬────────────┘  │
└───────────────────────────────────────────────────────────────────────┼────────────────┘
                                                                        │
                                                         Server-Side Secure Groq AI Call
                                                         Built-in browser_search tool
                                                                        │
                                                                        ▼
                                                           ┌─────────────────────────┐
                                                           │     Groq Cloud API      │
                                                           │  openai/gpt-oss-120b    │
                                                           │  llama-3.3-70b-versatile│
                                                           └─────────────────────────┘
```

### Core Architecture Principles:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS. Fully accessible, minimalist civic UI with WCAG AAA contrast and Kalpavriksha tree emblem.
- **Backend & Database**: Supabase exclusively (Auth, PostgreSQL, Row Level Security RLS, Edge Functions). No separate backend server (no FastAPI, Flask, Django, Express).
- **AI & Live Search**: Groq API called **exclusively server-side** from Supabase Edge Functions (`discover-schemes`, `explain-scheme`). Never exposes Groq secrets in frontend code.
- **Bilingual Interface**: Full English and Kannada (ಕನ್ನಡ) support across all search, profile, and explanation workflows.
- **Zero Preseeded Schemes**: Database starts 100% empty. The platform does not rely on a preloaded catalogue and searches the live internet on demand.

---

## 🎨 2. Design System — Professional Indian Civic Portal

Designed according to accessible minimalist principles with an Indian tricolour-inspired civic palette:

| Purpose | Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| Primary Accent | Saffron | `#FF6B00` | Primary actions, highlights, search CTAs |
| Deep Accent | Deep Saffron | `#D9480F` | Hover and active states for primary actions |
| Civic Green | Indian Green | `#138A36` | Success status, verified portals, state badges |
| Deep Green | Deep Green | `#075E2A` | Verified indicators, hover states |
| Primary Surface | White | `#FFFFFF` | Dominant card, modal, and input surfaces |
| Warm Background | Warm White | `#FFF9F1` | Soft page backgrounds and calm containers |
| Pale Accent | Pale Saffron | `#FFE3CC` | Pill badges, subtle banners, highlights |
| Pale Accent | Pale Green | `#DDF4E3` | Verification badges, matched criteria pills |
| Main Typography | Slate Text | `#20241F` | High-contrast body, headings, and labels |

- **Emblem**: Kalpavriksha civic tree emblem (`TreeLogo.tsx`) symbolizing citizen welfare, stability, and growth.
- **Tagline**: *"Discover Government Schemes for You" / "ನಿಮಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ"*.

---

## 🔍 3. Live Web Search & Discovery Engine

NammaSeve executes live web search through the `discover-schemes` Supabase Edge Function using Groq's built-in browser-search capability:

1. **User Profile Inputs**: State, district, age, education level, student status, occupation, farmer status, and voluntary category consent.
2. **Query Formulation**: Dynamic queries targeted at official Indian domains (`.gov.in`, `.nic.in`, `karnataka.gov.in`, `myscheme.gov.in`, `scholarships.gov.in`).
3. **Groq Browser Search**: Calls Groq's server-side tool `tools: [{"type": "browser_search"}]`.
4. **Validation & Deduplication**:
   - Validates URL syntax and rejects unsafe schemes (`javascript:`, data URIs).
   - Flags verified official `.gov.in` / `.nic.in` domains.
   - Deduplicates candidates by scheme identity and canonical URL.
5. **Deterministic Eligibility Evaluation**:
   - Compares residency, farmer status, student status, and age criteria.
   - Distinguishes verified facts from unknown information.
   - Outputs one of four deterministic outcomes:
     - `potentially_eligible`
     - `insufficient_information`
     - `not_eligible_based_on_verified_criteria`
     - `eligibility_unverified`
6. **Transient Caching**: Stores search results in `search_result_cache` with a 24-hour TTL to optimize cost and performance.

---

## 🏛️ 4. Official Government Data Providers Status

| Provider | Description | Auth Method | Authorization Status | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **Open Government Data (OGD) Platform India** | Central public data portal under MeitY. Distributes published welfare datasets. | API Key (`DATA_GOV_IN_API_KEY`) | Requires free developer registration on data.gov.in. | [data.gov.in/developers-corner](https://data.gov.in/developers-corner) |
| **API Setu (National API Gateway)** | Interoperable citizen service discovery between departments. | OAuth2 Client Credentials (`API_SETU_CLIENT_ID`, `API_SETU_API_KEY`) | Requires formal department registration and approved MoU. | [apisetu.gov.in/about/faq](https://apisetu.gov.in/about/faq) |
| **myScheme Platform** | Digital India national scheme aggregator portal. | State Gateway / Partner Token (`MYSCHEME_PARTNER_TOKEN`) | Requires state/department integration onboarding. | [myscheme.gov.in/about](https://www.myscheme.gov.in/about) |
| **Reviewed JSON/CSV Import** | Administrative ingestion for verified official gazette orders and notifications. | Supabase Admin RLS | Ready & Configured. Fully functional in Admin Ingestion portal. | Built-in |

---

## 🔒 5. Privacy, Security & Prompt Injection Defense

- **Zero Aadhaar or Financial Data**: NammaSeve never requests Aadhaar numbers, biometric credentials, bank account numbers, or OTPs.
- **Voluntary Informed Consent**: Special category information requires explicit user consent checkbox and is used exclusively for evaluating specialized welfare rules.
- **Server-Side AI Secrets**: `GROQ_API_KEY` is stored strictly in Supabase Edge Function secrets. Never bundled into frontend code or `.env`.
- **Row Level Security (RLS)**: Enforced on all user-accessible tables (`profiles`, `saved_schemes`, `search_history`, `search_result_cache`).
- **Prompt Injection Defense**: All retrieved webpage content and user input are treated as untrusted. AI models are strictly instructed to output schema-validated JSON without following embedded page instructions.

---

## 🚀 6. Local Development Setup

### Prerequisites
- Node.js v18+ (tested on Node v22.16.0)
- npm v9+

### Quick Start (Windows PowerShell)

#### Option A: One-Click Launch Script
Double-click `start-dev.bat` in the project root, or execute:
```powershell
.\start-dev.bat
```

#### Option B: Manual Command Line
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 7. Automated Tests & Quality Assurance

All 16 unit and integration tests run and pass cleanly:

```powershell
cd frontend
npm test
```

### Tests Executed:
1. `src/test/liveSearchDiscovery.test.ts` (5 tests):
   - Validates official `.gov.in` domain recognition.
   - Rejects unsafe protocols and malformed URLs (`javascript:`, data URIs).
   - Deduplicates live search candidates by name and canonical source URL.
   - Validates empty database discovery without requiring preseeded records.
   - Diagnoses unconfigured Groq API key with honest user guidance.
2. `src/test/securityAndSecrets.test.ts` (4 tests):
   - Verifies frontend `.env.example` never includes server-side secret keys.
   - Verifies all SQL migrations contain zero preseeded scheme records or fake demo rules.
   - Verifies Row Level Security (`ENABLE ROW LEVEL SECURITY`) on all tables.
   - Verifies profile schema has zero Aadhaar, bank credentials, password or OTP storage.
3. `src/test/eligibilityEngine.test.ts` (6 tests):
   - Evaluates citizen eligibility when all documented criteria match.
   - Verifies exclusionary status when statutory criteria fail.
   - Identifies missing fields for incomplete profiles.
   - Handles age ranges (`min_age`, `max_age`) accurately.
   - Calculates profile completion percentage accurately.
4. `src/test/emptyState.test.tsx` (1 test):
   - Verifies accessible minimalist empty state copy and action buttons.

### Production Build Check:
```powershell
cd frontend
npm run build
```
Builds cleanly with Vite & TypeScript (`dist/index.html`, `dist/assets/index.js`, `dist/assets/index.css`).

---

## 🗄️ 8. Supabase Migrations & Deployment

### Run Database Migrations
```powershell
# Link to your Supabase project
npx supabase link --project-ref your-project-id

# Apply all versioned migrations
npx supabase db push
```

Migration files:
- `supabase/migrations/20261026000001_initial_schema.sql`: Core tables with RLS and zero preseeded schemes.
- `supabase/migrations/20261026000002_add_ingestion_runs_and_freshness.sql`: Ingestion runs logging and scheme freshness tracking.
- `supabase/migrations/20261026000003_add_live_search_and_cache.sql`: Search result cache, user search history, and flexible saved schemes.

### Deploy Supabase Edge Functions & Configure Secrets
```powershell
# Configure Groq credentials server-side
npx supabase secrets set GROQ_API_KEY="your_actual_groq_api_key_here"
npx supabase secrets set GROQ_MODEL="llama-3.3-70b-versatile"

# Deploy Edge Functions
npx supabase functions deploy discover-schemes --no-verify-jwt
npx supabase functions deploy explain-scheme --no-verify-jwt
npx supabase functions deploy explain-schemes --no-verify-jwt
npx supabase functions deploy import-schemes
npx supabase functions deploy evaluate-eligibility --no-verify-jwt
npx supabase functions deploy translate-explanation --no-verify-jwt
```

---

## 🌐 9. Frontend Environment Configuration

In `frontend/.env` (use `frontend/.env.example` as a template):
```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_publishable_key
```

> **Security Rule**: Never place `GROQ_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `frontend/.env`.

---

## ⚖️ Civic Integrity & Disclaimer
NammaSeve is an independent public-service discovery platform. It is not owned, operated, or endorsed by the Government of India or the Government of Karnataka. Search results and AI explanations are strictly informational; final eligibility and benefits are determined exclusively by the competent government authority.
