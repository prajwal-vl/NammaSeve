# NammaSeve (ನಮ್ಮ ಸೇವೆ)
### AI-Powered Government Scheme Discovery Platform
> **Maximalist Indian Civic-Tech • Personal-Profile-First • Zero Preseeded Schemes**

NammaSeve connects Indian citizens (Karnataka state residents and national beneficiaries) with legitimate, verified government welfare schemes tailored to their voluntarily provided citizen profiles.

---

## 🏛️ 1. Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │                     React Frontend                     │
               │   TypeScript + Vite + Tailwind CSS + react-i18next     │
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
│  │ Email / Password Auth │  │ Profiles, Schemes, Rules│  │ Deno / TypeScript       │  │
│  └───────────────────────┘  └─────────────────────────┘  └────────────┬────────────┘  │
└───────────────────────────────────────────────────────────────────────┼────────────────┘
                                                                        │
                                                         Server-Side Secure Groq AI Call
                                                                        │
                                                                        ▼
                                                           ┌─────────────────────────┐
                                                           │     Groq API Cloud      │
                                                           │  llama-3.3-70b-versatile│
                                                           └─────────────────────────┘
```

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Maximalist Saffron & Green Neo-Brutalist Design).
- **Backend & Database**: Supabase exclusively (Auth, PostgreSQL, Row-Level Security RLS).
- **AI Integration**: Groq API called **only** through Supabase Edge Functions (`supabase/functions/explain-scheme`). Never exposes Groq API keys to the browser.
- **Language Support**: English and Kannada (ಕನ್ನಡ) with dynamic instant switching.
- **Strict Data Policy**: **Zero Preseeded Schemes**. Database starts completely empty until verified real government data is ingested via the administrative import portal.

---

## 🔒 2. Privacy & Personal-Profile-First Discovery

1. **Zero Aadhaar or Financial Data**: NammaSeve never requests Aadhaar numbers, biometric credentials, bank account numbers, or OTPs.
2. **Voluntary Informed Consent**: Special category or community information requires explicit user consent checkbox and is used exclusively for evaluating specialized welfare rules.
3. **Deterministic Evaluation**: Eligibility is calculated using strict deterministic rule comparison (age, qualification, occupation, district, income brackets), **never** hallucinated by an LLM.
4. **Permanent Right to Erasure**: Citizens can delete their stored profile data and bookmarks with a single click.

---

## 🚀 3. Local Development Setup

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

## 🧪 4. Running Automated Tests

Run the full Vitest suite (including eligibility engine logic, empty state compliance, and security/secret hygiene):

```powershell
cd frontend
npm test
```

To run a production bundle build check:
```powershell
npm run build
```

---

## 🗄️ 5. Supabase Configuration & Migrations

### A. Run Database Migrations
Using the Supabase CLI (`npx supabase`):

```powershell
# Link to your Supabase project
npx supabase link --project-ref your-project-id

# Apply migrations
npx supabase db push
```

The migration file is located at:
`supabase/migrations/20261026000001_initial_schema.sql`
- Creates `profiles`, `schemes`, `eligibility_rules`, `scheme_sources`, `scheme_versions`, `saved_schemes`, and `audit_events`.
- Automatically enforces Row-Level Security (RLS) on all user-accessible tables.
- Creates trigger to auto-create profiles on user signup.
- **Contains zero preseeded schemes or fake data.**

---

## ⚡ 6. Supabase Edge Functions & Groq AI Secrets

### A. Set Edge Function Secrets
Configure your Groq API credentials securely inside Supabase:

```powershell
npx supabase secrets set GROQ_API_KEY="your_actual_groq_api_key_here"
npx supabase secrets set GROQ_MODEL="llama-3.3-70b-versatile"
```

### B. Deploy Edge Functions
Deploy the Edge Functions to your Supabase project:

```powershell
npx supabase functions deploy explain-scheme --no-verify-jwt
npx supabase functions deploy translate-explanation --no-verify-jwt
npx supabase functions deploy evaluate-eligibility --no-verify-jwt
npx supabase functions deploy import-schemes
```

---

## 🌐 7. Environment Variables Configuration

### Where to add your credentials:
1. Open `frontend/.env` (or copy from `frontend/.env.example`):
   ```ini
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_publishable_key
   ```
2. Save the file.
3. Restart `npm run dev`.

> **CRITICAL SECURITY RULE:** Never put `GROQ_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `frontend/.env`. Those belong strictly in Supabase Edge Function secrets!

---

## 📥 8. Ingesting Genuine Government Schemes

Because NammaSeve strictly enforces **Zero Preseeded Schemes**, the scheme database starts empty.

When you are ready to load genuine government schemes:
1. Navigate to the **Admin Ingestion** page in the navbar (`/admin-import`).
2. Copy the verified scheme data from `docs/verified_sample_import.json` (which contains real Karnataka and Central schemes like Gruha Lakshmi, Yuva Nidhi, and PM-KISAN with official links and gazette rules).
3. Paste into the Administrative Ingestion Portal.
4. Click **Validate Records** (performs schema checks and duplicate detection).
5. Click **Publish Verified Schemes**.
6. The schemes will instantly become discoverable and match against citizen profiles!

---

## ☁️ 9. Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, import the repository.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_publishable_key`
5. Click **Deploy**.

---

## ⚖️ License & Civic Disclaimer
NammaSeve is built for public citizen empowerment under the MIT License. Final benefit sanction and eligibility determinations rest solely with the responsible government departments.
