z# CV Analyzer

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET 9](https://img.shields.io/badge/.NET-9-512BD4?logo=dotnet&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)

A full-stack application for resume analysis and job-application tracking, built to explore what it takes to turn an AI feature into a real product surface rather than a single prompt-response endpoint.

Upload a resume, get structured feedback on ATS compatibility, formatting, content, and skills coverage, then track it against saved job postings to see match scores, keyword gaps, and alignment over time.

**Stack:** React 19 / TypeScript on the frontend, ASP.NET Core 9 Web API on the backend, EF Core + PostgreSQL for persistence, Redis for caching, Hangfire for background processing, Supabase for auth.

---

## Why This Exists

I was applying to jobs and kept doing the same manual work over and over: tweak a resume, guess whether it actually matched the posting, track applications in a spreadsheet. I built this to do that for me, and used it as an excuse to build the parts of an application that only matter once you have more than one screen and more than one user:

- Background processing for work that's too slow to do inline
- Explicit state machines (`Pending` → `Processing` → `Completed`/`Failed`) that a frontend can poll against
- Per-user data isolation enforced at the query layer, not just the UI
- A storage abstraction that isn't hard-wired to the local filesystem
- Cache invalidation driven by domain events instead of TTL guesswork
- Service boundaries and DTOs, so controllers stay thin

---

## Features

### Resume Analysis
- Upload resumes with title metadata; original files are preserved alongside generated PDF previews and thumbnails
- Text extraction from supported document formats
- Asynchronous AI-driven scoring across five dimensions: ATS compatibility, formatting, content quality, structure, and skills coverage
- Detected skills, missing common skills, strengths, and targeted improvement suggestions
- Full resume lifecycle: browse, preview, download, delete

### Job Tracking
- Save job postings manually or autofill from a URL (including LinkedIn parsing)
- Status pipeline: saved → applied → interviewing → offered / rejected
- Archive, edit, and delete with resume-analysis counts and best-match score surfaced per job

### Resume-to-Job Matching
- Keyword, skill, experience, and education alignment between a specific resume and a specific job description
- Job-specific ATS scoring
- Analysis reuse — the same resume/job pair won't trigger duplicate work
- Retry path for failed analyses

### Dashboard & Analytics
- KPIs: total jobs, jobs added this week, interview rate, offer rate, average match score
- Status breakdown, outcome distribution, 8-week job trend, match-score histogram
- Per-user summaries cached in Redis and invalidated on relevant writes, not on a timer

### Authentication
- Google sign-in via Supabase Auth
- Supabase JWTs validated server-side; every resume, job, feedback, and analytics query is scoped to the authenticated user

---

## Architecture

```
React + TypeScript (Vite)
        │
        │  Supabase access token · JSON / multipart
        ▼
ASP.NET Core 9 Web API
        │
        ├── Controllers            → thin, auth-scoped HTTP layer
        ├── Services/Resumes       → upload, retrieval, deletion
        ├── Services/Jobs          → CRUD, lifecycle, URL autofill, matching
        ├── Services/Analysis      → document parsing, AI calls, result persistence
        ├── Services/Analytics     → KPI aggregation, time series, histograms
        ├── EF Core → PostgreSQL   → application data
        ├── Hangfire               → background job queue
        ├── Redis (IDistributedCache) → analytics cache
        └── IStorage abstraction   → local disk today, swappable provider
```

**Async analysis flow:** a request creates a `Pending` feedback record → Hangfire enqueues the job → a worker extracts text and calls the configured OpenRouter model → structured JSON is validated and persisted → the record resolves to `Completed` or `Failed` → the frontend polls until resolution → a MediatR notification invalidates the requesting user's cached analytics.

**Caching:** analytics summaries are computed by concurrent providers and cached per user in Redis for 60 minutes. Job and analysis mutations publish domain events; `ClearSummaryCacheHandler` invalidates the affected user's cache immediately rather than waiting on TTL expiry.

---

## Tech Stack

**Frontend**
React 19 · TypeScript · Vite · React Router · Tailwind CSS · Radix UI · Recharts · Supabase JS client · React Dropzone · Lucide · Sonner

**Backend**
ASP.NET Core 9 · C# (nullable reference types) · EF Core 9 · PostgreSQL (Npgsql) · Hangfire · Redis · MediatR · OpenRouter-compatible OpenAI client · iText 7 / ImageMagick (document + preview processing) · AngleSharp / ReverseMarkdown (job page parsing) · OpenAPI + Scalar

---

## Repository Layout

```
CV_analyzer/
├── backend/
│   ├── backend/                ASP.NET Core API
│   │   ├── Controllers/        HTTP endpoints
│   │   ├── Data/                EF Core context
│   │   ├── DTO/                 API contracts
│   │   ├── Services/            Resume, job, AI, and analytics logic
│   │   ├── Storage/              Storage abstraction + local provider
│   │   ├── cache/                Redis cache + invalidation handlers
│   │   └── Migrations/           EF Core migrations
│   ├── Tests/                    xUnit
│   └── backend.sln
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   ├── src/context/               Auth context
│   └── package.json
└── README.md
```

---

## Getting Started

**Requirements:** .NET 9 SDK, Node.js + npm, a running PostgreSQL instance, a running Redis instance, a Supabase project with Google OAuth configured, an OpenRouter API key.

### Backend configuration

`backend/backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=cvanalyzer;Username=<user>;Password=<password>",
    "HangfireConnection": "<your-hangfire-storage-connection-string>",
    "Redis": "localhost:6379"
  },
  "Authentication": {
    "ValidIssuer": "https://<your-project>.supabase.co/auth/v1",
    "ValidAudience": "authenticated"
  },
  "OpenRouter": {
    "ApiKey": "<your-openrouter-api-key>",
    "ModelName": "<your-openrouter-model>"
  }
}
```

Or via environment variables (double-underscore form):

```bash
Authentication__ValidIssuer=https://<your-project>.supabase.co/auth/v1
Authentication__ValidAudience=authenticated
OpenRouter__ApiKey=<your-openrouter-api-key>
OpenRouter__ModelName=<your-openrouter-model>
ConnectionStrings__Redis=localhost:6379
```

### Frontend configuration

`frontend/.env.local`:

```bash
VITE_DEV_SERVER=https://localhost:<api-port>
VITE_LOCAL_STORAGE=https://localhost:<api-port>/uploads
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Run

```bash
# backend
cd backend
dotnet restore backend.sln
dotnet build backend.sln
dotnet run --project backend/backend.csproj

# frontend (second terminal)
cd frontend
npm install
npm run dev
```

`VITE_DEV_SERVER` should point at whatever port `dotnet run` prints. Open the Vite URL and sign in with Google.

In development, the API also exposes an OpenAPI/Scalar reference and a Hangfire dashboard for inspecting background jobs.

---

## Testing

```bash
cd backend
dotnet test backend.sln

# or
dotnet test backend/Tests/Tests.csproj
```

Coverage includes resume parsing, local storage, job filtering and event publication, analytics aggregation (KPIs, status/outcome calculations, weekly buckets, match-score histograms), user-scoped data isolation, and cache-aware analytics behavior.

Frontend checks currently run through `npm run build` (type checking) and `npm run lint`; a dedicated frontend test suite hasn't been added yet.

---

## API Reference

All routes require a valid Supabase bearer token.

**Resumes**

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/resume/upload-resume` | Upload a resume (`file`, `title`) |
| `GET` | `/api/resume/get-resumes` | List resumes with previews/scores |
| `GET` | `/api/resume/get-resume?resumeId={id}` | Get analysis + status for a resume |
| `GET` | `/api/resume/{resumeId}/jobs` | Completed job analyses for a resume |
| `DELETE` | `/api/resume/{resumeId}` | Delete a resume |

**Jobs & Matching**

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/jobs` | List jobs with best-match previews |
| `GET` | `/api/jobs/{jobId}` | Job + completed feedback |
| `POST` | `/api/jobs/save-job` | Save a job description |
| `GET` | `/api/jobs/autofill?url={url}` | Extract job details from a URL |
| `POST` | `/api/jobs/{jobId}/analyze` | Queue resume-vs-job analysis |
| `GET` | `/api/jobs/job-feedback/{feedbackId}` | Match analysis + status |
| `GET` | `/api/jobs/with-feedback` | Jobs with feedback previews |
| `PUT` | `/api/jobs/{jobId}` | Update job details |
| `PATCH` | `/api/jobs/{jobId}/status` | Update application status |
| `PATCH` | `/api/jobs/{jobId}/archive` | Archive / restore |
| `DELETE` | `/api/jobs/{jobId}` | Delete a job |

**Analytics**

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | Cached analytics for the current user (rate-limited per user) |

---

## Design Notes

Decisions made deliberately, and what they trade off:

- **Local filesystem storage** — `IStorage` exists specifically so swapping in S3/Blob storage later doesn't touch business logic; local disk was enough to build and demo against.
- **AI scores are directional, not authoritative** — they're modeled as feedback signals, not hiring decisions, and the prompting/parsing was built around that assumption.
- **Interview/offer rates are approximate** — status-change history isn't tracked yet, so these are computed from current state rather than a full audit trail.
- **Structured JSON from the model is treated as untrusted input** — provider failures and malformed responses are first-class cases the analysis pipeline has to handle, not edge cases bolted on after.

## Extending

The service boundaries are intentionally swappable:

- New `IStorage` implementation → cloud storage backend
- New `IAiAnalysisService` implementation → different model provider
- New `IJobParserStrategy` → additional job board / URL format
- New provider under `Services/Analytics/`, registered in `AnalyticsAggregator`
- New MediatR notifications for any data that should invalidate cached analytics

Ownership checks stay at the service/query layer, and the separation between controllers, DTOs, services, persistence, and background processing is meant to hold as the project grows.

## License

MIT — see [LICENSE](LICENSE).
