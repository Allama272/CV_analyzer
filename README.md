# CV Analyzer

CV Analyzer is a full-stack application for improving resumes and managing a job search. It combines AI-assisted resume review, ATS-oriented feedback, job tracking, resume-to-job matching, and application analytics in one workspace.

The frontend is built with React and TypeScript. The backend is an ASP.NET Core Web API written in C# and uses background processing for analysis workflows.

## What It Does

### Resume analysis

- Upload resumes and assign titles to them.
- Validate uploaded files and preserve the original resume.
- Generate PDF previews and thumbnails for browsing and review.
- Extract resume text from supported documents.
- Run asynchronous AI analysis and track `Pending`, `Processing`, `Completed`, and `Failed` states.
- Produce an overall score and detailed feedback for:
  - ATS compatibility
  - Formatting
  - Content quality
  - Resume structure
  - Skills coverage
- Show detected skills, missing common skills, strengths, and improvement suggestions.
- Browse, download, preview, and delete saved resumes.

### Job tracking

- Save job opportunities with company, title, description, logo, and application status.
- Create jobs manually or autofill job details from a supported job URL, including LinkedIn parsing support.
- Track job states such as saved, applied, interviewing, offered, and rejected.
- Edit job details, update status, archive jobs, and delete jobs.
- See the number of resumes analyzed for each job and its best match score.
- View a job with all completed resume analyses associated with it.

### Resume-to-job matching

- Analyze a saved resume against a saved job description.
- Compare:
  - Keyword matches and missing keywords
  - Skill matches and missing skills
  - Experience alignment and gaps
  - Education alignment
  - Job-specific ATS compatibility
- Reuse an existing analysis for the same resume/job pair instead of creating duplicates.
- Retry failed analyses.
- View matching results alongside the resume preview.

### Dashboard and analytics

- View recent resumes, tracked jobs, active applications, and best-match summaries.
- Review analytics for active jobs or active plus archived jobs.
- Inspect:
  - Total jobs
  - Jobs added this week
  - Interview rate
  - Offer rate
  - Average match score
  - Job status breakdown
  - Outcomes
  - Jobs added over the last eight weeks
  - Match-score distribution
- Analytics summaries are cached per user and invalidated when relevant jobs, resumes, or analyses change.

### Authentication

- Sign in with Google through Supabase Auth.
- The frontend keeps the Supabase session and sends the access token to the API.
- The backend validates Supabase JWTs and scopes resume, job, feedback, and analytics data to the authenticated user.

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- Recharts
- Supabase JavaScript client
- React Dropzone and Uppy-compatible UI components
- Lucide icons and Sonner notifications

### Backend

- ASP.NET Core 9 Web API
- C# with nullable reference types enabled
- Entity Framework Core 9
- SQLite for application data
- Hangfire with SQLite storage for background jobs
- Redis through `IDistributedCache`
- MediatR notifications and handlers
- OpenRouter-compatible OpenAI chat client for AI analysis
- iText 7 and ImageMagick for document and preview processing
- AngleSharp and ReverseMarkdown for web-page/job description processing
- OpenAPI and Scalar API reference in development

## Architecture

The application is split into two independently runnable applications:

```text
React + TypeScript frontend
        |
        | Supabase access token / JSON and multipart requests
        v
ASP.NET Core API
        |
        +-- Controllers
        +-- Application services
        +-- EF Core / SQLite
        +-- Hangfire background jobs
        +-- Redis analytics cache
        +-- IStorage file abstraction
        +-- OpenRouter AI analysis
```

### Backend boundaries

- `Controllers/` exposes authenticated HTTP endpoints.
- `Services/Resumes/` owns resume upload, retrieval, deletion, and resume-related matches.
- `Services/Jobs/` owns job CRUD, lifecycle state, URL autofill, and resume/job matching.
- `Services/Analysis/` parses documents, calls the AI provider, and persists structured analysis results.
- `Services/Analytics/` calculates KPIs, status summaries, outcome data, time series, and score histograms.
- `Data/` contains the EF Core database context.
- `DTO/` contains request and response contracts.
- `Storage/` contains `IStorage` and the current `LocalStorage` implementation.
- `cache/` contains Redis cache access and MediatR-based invalidation handlers.
- `Migrations/` contains SQLite schema migrations.

### Asynchronous analysis flow

1. A user uploads a resume or requests a resume/job comparison.
2. The API validates ownership and creates a feedback record with `Pending` status.
3. Hangfire enqueues the appropriate analysis method.
4. A worker extracts resume text and calls the configured OpenRouter model.
5. Structured JSON feedback is saved to SQLite.
6. The record moves to `Completed` or `Failed`.
7. The frontend polls the feedback endpoint while work is pending or processing.
8. MediatR publishes analysis events so cached analytics summaries are invalidated.

### Caching flow

The analytics aggregator runs its providers concurrently and stores each user's summary in Redis for 60 minutes. Job and analysis events publish notifications handled by `ClearSummaryCacheHandler`, which removes the affected user's cached summary immediately after data changes.

## Repository Layout

```text
CV_analyzer/
├── backend/
│   ├── backend/                 ASP.NET Core API
│   │   ├── Controllers/         HTTP endpoints
│   │   ├── Data/                EF Core context
│   │   ├── DTO/                 API contracts
│   │   ├── Services/            Resume, job, AI, and analytics services
│   │   ├── Storage/             Storage abstraction and local provider
│   │   ├── cache/               Redis cache and invalidation handlers
│   │   └── Migrations/           EF Core migrations
│   ├── backend.tests/            NUnit test project
│   ├── Tests/                    xUnit test project
│   ├── playgroundTests/          Local playground project
│   └── backend.sln               .NET solution
├── frontend/                    React application
│   ├── src/pages/               Application screens
│   ├── src/components/          Shared UI and analysis views
│   ├── src/context/              Authentication context
│   └── package.json              Frontend scripts and dependencies
├── .gitignore
└── README.md
```

Generated build output, local SQLite databases, uploaded documents, previews, thumbnails, backups, and OAuth client files are not required source files and should not be committed.

## Prerequisites

Install the following before running the project locally:

- .NET 9 SDK
- Node.js and npm
- A running Redis instance
- A Supabase project with Google OAuth configured
- An OpenRouter API key and an available model

The current development setup uses SQLite and local filesystem storage, so no separate relational database or object-storage service is required for a basic local run.

## Configuration

Do not commit API keys, OAuth client secrets, Supabase secrets, database backups, or user-uploaded files. Use user secrets, environment variables, or a secret manager.

### Backend configuration

Create or update `backend/backend/appsettings.Development.json` with local values similar to:

```json
{
  "ConnectionStrings": {
    "SqliteConnection": "Data Source=devMainDB.db",
    "HangfireConnection": "Data Source=hangfire-jobs.db",
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

The backend reads these settings through standard ASP.NET Core configuration. Environment variables can use the double-underscore form, for example:

```bash
Authentication__ValidIssuer=https://<your-project>.supabase.co/auth/v1
Authentication__ValidAudience=authenticated
OpenRouter__ApiKey=<your-openrouter-api-key>
OpenRouter__ModelName=<your-openrouter-model>
ConnectionStrings__Redis=localhost:6379
```

### Frontend configuration

Create `frontend/.env.local`:

```bash
VITE_DEV_SERVER=https://localhost:<api-port>
VITE_LOCAL_STORAGE=https://localhost:<api-port>/uploads
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

`VITE_DEV_SERVER` must point to the running API. `VITE_LOCAL_STORAGE` must point to the location from which the API serves resume files, previews, and thumbnails in your local environment.

## Run Locally

### Start the backend

```bash
cd backend

dotnet restore backend.sln
dotnet build backend.sln
dotnet run --project backend/backend.csproj
```

The API port is selected by the ASP.NET Core launch configuration or runtime environment. Use the URL printed by `dotnet run` when setting `VITE_DEV_SERVER`.

In development, the API exposes OpenAPI and Scalar API reference endpoints. The Hangfire dashboard is also registered for inspecting background jobs. Both should be protected before production use.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal and sign in with the configured Google/Supabase provider.

### Build the frontend

```bash
cd frontend
npm run build
npm run lint
npm run preview
```

## Tests

Run all .NET tests from the backend directory:

```bash
cd backend
dotnet test backend.sln
```

Run individual test projects when focusing on one area:

```bash
dotnet test backend/backend.tests/backend.tests.csproj
dotnet test backend/Tests/Tests.csproj
```

The test suite includes coverage for:

- Resume parsing behavior
- Local file and text storage
- Job service filtering and event publication
- Analytics aggregation
- KPI calculations
- Status and outcome calculations
- Weekly job buckets
- Match-score histograms
- User-scoped data isolation
- Cache-aware analytics behavior

The frontend currently has no dedicated test script. Its available automated checks are TypeScript compilation through `npm run build` and ESLint through `npm run lint`.

## API Overview

All application endpoints below require a valid Supabase bearer token unless otherwise noted.

### Resume endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/resume/upload-resume` | Upload a resume using multipart form data with `file` and `title`. |
| `GET` | `/api/resume/get-resumes` | List the authenticated user's resume previews and scores. |
| `GET` | `/api/resume/get-resume?resumeId={id}` | Retrieve resume analysis data and processing status. |
| `GET` | `/api/resume/{resumeId}/jobs` | List completed job analyses for a resume. |
| `DELETE` | `/api/resume/{resumeId}` | Delete a user's resume. |

### Job and matching endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/jobs` | List tracked jobs with best-match previews. |
| `GET` | `/api/jobs/{jobId}` | Retrieve a job and its completed feedback rows. |
| `POST` | `/api/jobs/save-job` | Save a job description. |
| `GET` | `/api/jobs/autofill?url={url}` | Extract job details from a supported URL. |
| `POST` | `/api/jobs/{jobId}/analyze` | Queue analysis of a selected resume against a job. |
| `GET` | `/api/jobs/job-feedback/{feedbackId}` | Retrieve job-match analysis and processing status. |
| `GET` | `/api/jobs/with-feedback` | List jobs with feedback previews. |
| `PUT` | `/api/jobs/{jobId}` | Update job details. |
| `PATCH` | `/api/jobs/{jobId}/status` | Update application status. |
| `PATCH` | `/api/jobs/{jobId}/archive` | Archive or restore a job. |
| `DELETE` | `/api/jobs/{jobId}` | Delete a tracked job. |

### Analytics endpoint

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/analytics/summary` | Retrieve the cached analytics summary for the current user. |

The analytics endpoint uses a per-user sliding-window rate-limit policy and returns HTTP 429 when the dashboard is refreshed too frequently.

## Production Considerations

The current codebase is ready for local development and provides abstractions for production evolution, but the following changes are required before exposing it publicly:

- Rotate any credentials that may have been present in local configuration files.
- Store secrets outside source control using environment variables or a managed secret store.
- Replace the permissive `AllowAnyOrigin` CORS policy with an explicit frontend origin allowlist.
- Protect the Hangfire dashboard with authentication and authorization.
- Restrict trusted forwarded proxies instead of trusting every proxy by default.
- Replace local filesystem storage with a durable object-storage implementation behind `IStorage`.
- Use managed production database, Redis, and job-storage services as appropriate.
- Add file-size, content-type, malware-scanning, and upload-retention policies for user documents.
- Configure HTTPS, logging, monitoring, backups, and failure alerts.
- Treat analytics interview and offer rates as directional because the application currently tracks current job status, not status-change history.
- Make sure the selected AI model returns the JSON shape expected by the analysis DTOs and handle provider quotas and failures operationally.
Annotated[Cache, Depends(get_cache)])
## Extending the Application

The project is designed around replaceable services:

- Implement another `IStorage` provider to move resume assets to cloud storage.
- Implement or replace `IAiAnalysisService` to use another OpenAI-compatible provider or hosted model.
- Add an `IJobParserStrategy` for another job board or URL format.
- Add analytics providers under `Services/Analytics/` and include them in `AnalyticsAggregator`.
- Publish MediatR notifications when new data affects cached analytics.
- Add controller tests or frontend component/end-to-end tests as new workflows become user-critical.

Keep user ownership checks in service queries and maintain the existing separation between controllers, DTOs, services, persistence, background processing, and infrastructure adapters.

## License

No license has been specified for this repository yet.
