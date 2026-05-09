# HireFlow — Project Structure & Build Plan

HireFlow is an AI-augmented recruitment platform (PRD v3.0, May 2026). This document is the single source of truth for the **UI scope**, **screens**, **constants**, and **build order**.

We build with **dummy data + setInterval-based simulation** for now. Real APIs / Kafka / AI come later. The code must stay modular and ready to swap dummy data for real services without rewrites.

---

## 1. Tech Stack

- **Vite + React 19** (plain JavaScript)
- **React Router v7** for routing
- **Redux Toolkit** for global state (auth/session, listings, applications, notifications)
- **RTK Query** for real backend queries/mutations once dummy data is replaced.
- **Tailwind CSS v4** for styling
- **Dummy data layer** in `src/data/` — read by services in `src/services/` so the swap to a real API is a one-file change.

---

## 2. Source Folder Structure

```text
src/
  assets/                  Static assets (logos, icons, illustrations).
  components/
    common/                Reusable atoms/molecules: Button, Input, Modal, Badge, Card, Tabs, ProgressBar, Avatar, Spinner, Toast.
    domain/                Domain-aware reusable pieces: StageBadge, StatusBadge, MatchPercentBar, JobListingCard, ApplicantCard, ScoreCriterionInput, RejectionReasonModal, MeetLinkField.
    charts/                Dashboard chart wrappers (FunnelChart, TimeToHireChart, etc.).
  constants/               Enums + static config — single source of truth (see §4).
  data/                    Dummy data fixtures (users, jobListings, applications, interviewSlots, aiResults). Pure JS, no React.
  hooks/                   Reusable hooks (useInterval, useSimulatedPipeline, useAuth, useToast).
  layout/                  App shells per actor (PublicLayout, ApplicantLayout, HiringManagerLayout, AdminLayout) + shared Sidebar, Topbar.
  pages/
    auth/                  Auth shell + auth screens — see §5.6.
                           Auth.jsx (left+right layout), AuthLeftSide.jsx (reusable brand panel),
                           SignIn.jsx, SignUp.jsx, PasswordReset.jsx, RoleSwitch.jsx (dev).
    applicant/             Applicant-side pages.
    hiringManager/         HM-side pages.
    admin/                 Admin-side pages.
    shared/                Landing, NotFound, Forbidden, ComingSoon.
  routes/                  Route tree, RoleGuard, route path helpers.
  api/                     Future backend integration layer using RTK Query (`baseApi` + injected domain endpoints).
                           Domain files expose query/mutation hooks for auth, jobs, applications, interviews, notifications, etc.
  services/                Current thin abstraction over the dummy-data layer, plus non-network domain helpers.
                           As real endpoints land, direct backend calls move to `api/`; services should shrink instead of becoming fetch wrappers.
                           authService, jobService, applicationService, interviewService, screeningService, notificationService.
  store/
    index.js               Redux store config.
    slices/                authSlice, jobsSlice, applicationsSlice, interviewsSlice, notificationsSlice, uiSlice.
  utils/                   Pure helpers: formatDate, computeOverallScore, validateMeetLink, classnames, idGenerator, simulateLatency.
  App.jsx
  main.jsx
  index.css
```

**Rules:**

- No JSX inside `data/`, `constants/`, `utils/`.
- Pages are dumb shells — they compose `domain/` components and read from store/services.
- Components in `common/` know nothing about HireFlow domain. Components in `domain/` may.
- Every cross-cutting string (stage name, status, role, path) lives in `constants/`. Never inline them.
- The shape of every entity is documented in §3 below. Components/services should match these shapes exactly when reading or building dummy data.
- When replacing dummy data with real endpoints, prefer RTK Query in `src/api/` over new `createAsyncThunk` code.
- Use one shared `baseApi` with `injectEndpoints` for domain files unless there is a strong reason to isolate a separate API instance.
- Mutations belong beside their domain queries in `src/api/*Api.js`; use `invalidatesTags` intentionally so affected screens refresh without manual store wiring.
- **No comments.** Never write comments in code. Code must be self-documenting through clear naming.

---

## 3. Entity Shapes (reference)

These describe the data the dummy layer produces and the services pass around. They are reference only — no `.js` file gets generated for them. Match these field names exactly so swapping in a real API later is mechanical.

**User** — `id`, `name`, `email`, `role` (`APPLICANT` | `HIRING_MANAGER` | `ADMIN`), `companyId`, `avatarUrl?`, `resumeUrl?` (applicants), `skills?` (applicants), `createdAt`.

**Company** — `id`, `name`, `logoUrl?`, `autoPassThreshold` (default 75), `autoRejectThreshold` (default 40).

**JobListing** — `id`, `companyId`, `hiringManagerId`, `title`, `location`, `workMode` (`REMOTE` | `HYBRID` | `ONSITE`), `employmentType` (`FULL_TIME` | `PART_TIME` | `CONTRACT` | `INTERN`), `description`, `requiredSkills[]`, `niceToHaveSkills[]`, `salary?` (`{ min, max, currency }`), `status` (`DRAFT` | `OPEN` | `PAUSED` | `CLOSED` | `FILLED`), `createdAt`, `updatedAt`.

**Application** — `id`, `applicantId`, `jobListingId`, `currentStage` (`APPLIED` | `SCREENING` | `INTERVIEW_SCHEDULED` | `OFFER_SENT` | `HIRED` | `REJECTED`), `appliedAt`, `updatedAt`. Unique by (`applicantId`, `jobListingId`).

**ApplicationStageUpdate** — `id`, `applicationId`, `previousStage`, `currentStage`, `nextStage` (nullable on terminal), `actorId`, `actorRole`, `reason?` (required when `currentStage === 'REJECTED'`), `unmatchedSkills?` (auto-rejection only), `occurredAt`. Append-only.

**InterviewSlot** — `id`, `applicationId`, `hiringManagerId`, `scheduledAt` (ISO), `durationMinutes`, `meetLink` (required URL), `scoresheet` (nullable), `reviewSubmittedAt` (nullable), `createdAt`.

**Scoresheet** (embedded in `InterviewSlot.scoresheet`) — `technicalScore` 1–5, `behaviouralScore` 1–5, `communicationScore` 1–5, `cultureFitScore` 1–5, `problemSolvingScore` 1–5, `overallRecommendation` (text), `decision` (`PASS` | `REJECT`), `rejectionReason?` (required when `decision === 'REJECT'`).

**AIScreeningResult** — `id`, `applicationId`, `matchPercentage` 0–100, `matchedSkills[]`, `unmatchedSkills[]`, `summaryNote` (HM-only, never shown to applicant), `screenedAt`.

**NotificationEmail** — `id`, `applicationId`, `recipientUserId`, `subject`, `currentStage`, `nextStage` (nullable), `body`, `unmatchedSkills?`, `reason?`, `sentAt`.

---

## 4. Constants (single source of truth)

Each lives in `src/constants/` and is imported everywhere. **No magic strings in components.**

| File                       | Exports                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `roles.js`                 | `USER_ROLES`, `ROLE_LABELS`, `ROLE_HOME_PATHS`                                                                                       |
| `stages.js`                | `PIPELINE_STAGES`, `STAGE_LABELS`, `STAGE_ORDER`, `NEXT_STAGE_MAP`, `TERMINAL_STAGES`, `STAGE_BADGE_COLORS`                          |
| `jobStatus.js`             | `JOB_LISTING_STATUS`, `JOB_STATUS_LABELS`, `JOB_STATUS_BADGE_COLORS`, `JOB_STATUS_TRANSITIONS`                                       |
| `scoresheet.js`            | `SCORESHEET_CRITERIA` (Technical/Behavioural/Communication/CultureFit/ProblemSolving), `SCORE_RANGE` (1–5), `DECISION` (PASS/REJECT) |
| `screening.js`             | `DEFAULT_AUTO_PASS_THRESHOLD = 75`, `DEFAULT_AUTO_REJECT_THRESHOLD = 40`, `MATCH_BAND` helper                                        |
| `routes.js`                | `ROUTES` object — every path string lives here                                                                                       |
| `simulation.js`            | `SIM_TICK_MS` (master clock), `SIM_STAGE_DURATIONS` (how long dummy apps spend per stage), `SIM_AI_DELAY_MS`                         |
| `employment.js`            | `WORK_MODES`, `EMPLOYMENT_TYPES`                                                                                                     |
| `notificationTemplates.js` | Subject + body templates per transition (PRD §9)                                                                                     |

Stage and status enums must match the PRD exactly:

- Pipeline: `APPLIED → SCREENING → INTERVIEW_SCHEDULED → OFFER_SENT → HIRED | REJECTED`
- Job status: `DRAFT, OPEN, PAUSED, CLOSED, FILLED`
- Scoresheet criteria: `TECHNICAL, BEHAVIOURAL, COMMUNICATION, CULTURE_FIT, PROBLEM_SOLVING`

---

## 5. Screen Inventory

We build screens **one at a time** in the order listed. Each screen lands in its own PR-sized commit with: page file, any new domain components, dummy-data additions, store wiring, and route entry.

### 5.1 Shared / Public

| #   | Screen                 | Path               | Notes                                                                           |
| --- | ---------------------- | ------------------ | ------------------------------------------------------------------------------- |
| S1  | Landing                | `/`                | Marketing-style entry. CTA → Sign in / Sign up.                                 |
| S2  | Sign In                | `/sign-in`         | Email + password. Dummy auth — looks up seeded user by email, password ignored. |
| S3  | Sign Up                | `/sign-up`         | Multi-step: role choice → form → OTP. See §5.6.                                 |
| S4  | Password Reset         | `/password-reset`  | Multi-step: email → OTP → new password + confirm. See §5.6.                     |
| S5  | Role Switch (dev only) | `/dev/switch-role` | Quick switch between seeded Applicant / HM / Admin while we prototype.          |
| S6  | Not Found              | `*`                | 404.                                                                            |
| S7  | Forbidden              | `/403`             | Wrong-role redirect destination.                                                |

### 5.2 Applicant

Applicant pages now live under `/applicant/...` and should feel inspired by Indeed / Wellfound / Glassdoor: calm, friendly, reassuring, transparent, lightweight, and mobile-first. Avoid enterprise dashboard density on candidate-facing screens.

**Primary applicant navigation:** Find Jobs, My Applications, Messages, Interviews, Profile.

**Candidate-side visual direction:** large whitespace, bigger typography, simple cards, friendly empty states, softer shadows, high scanability, and clear application transparency.

**Current implementation intent (May 7, 2026):**

- Update applicant route constants and route tree from legacy `/jobs` / `/me` paths to `/applicant/...`.
- Replace applicant `ComingSoon` placeholders with dummy-data screens only; no real APIs and no live AI integrations.
- Build an Indeed-style job discovery home with left job feed + right preview panel, quick apply, saved-job UI state, match badges rendered from local skill overlap/mock data, salary preview, remote badges, and persistent application status.
- Build content-rich job detail with overview, responsibilities, requirements, benefits, company/team, hiring process preview, estimated response time, AI fit score display from dummy/local data, and sticky apply CTA.
- Build one-click apply as a lightweight modal flow: resume confirmation, autofilled profile preview from seeded user data, quick edits, submit through existing dummy `applyToJob` service.
- Build applicant applications, application detail, messages, interviews, and profile pages using existing seed data, stage updates, notifications, interview slots, and auth user data.

**Completed May 7, 2026:**

- ✅ Applicant route constants and role home now use `/applicant/...`; old applicant `/jobs` and `/me` constants were removed.
- ✅ Applicant route tree renders real pages instead of `ComingSoon`: `JobDiscovery`, `JobDetail`, `MyApplications`, `ApplicationDetail`, `Messages`, `Interviews`, `Profile`.
- ✅ `ApplicantLayout` now uses a simple top navigation for Find Jobs, My Applications, Messages, Interviews, Profile instead of the enterprise sidebar.
- ✅ Job discovery uses the Indeed-style feed + preview pattern, local search/work-mode filters, quick apply, save UI state, salary/work-mode badges, local match scoring from seeded profile skills, and persistent application status.
- ✅ Job detail includes overview, responsibilities, requirements, benefits, team/company, hiring process preview, estimated response time, fit score, and sticky application action.
- ✅ One-click apply is implemented as a dummy modal flow that submits through the existing in-memory `applyToJob` thunk/service; no API or live AI call was added.
- ✅ Applications, application detail, messages, interviews, and profile render from existing Redux/service dummy data, including stage updates, notifications, interview slots, and auth user profile data.
- ✅ Verification: `npm run lint` and `npm run build` pass.

**Current follow-up intent (May 7, 2026):**

- Move applicant helper functions out of `pages/applicant/` into `src/utils/` and update all imports.
- Add missing applicant profile affordances: edit profile, resume update/upload placeholder, editable parsed-resume preview, preferences, and salary expectations, all as local dummy UI state.
- Expand one-click apply so candidates can upload a cover letter, review/edit parsed resume fields, and submit through the existing dummy application service.

**Completed follow-up May 7, 2026:**

- ✅ Moved applicant helpers from `src/pages/applicant/applicantUtils.js` to `src/utils/applicant.js` and updated applicant page imports.
- ✅ Added shared dummy parsed-resume helpers in `src/utils/applicant.js`.
- ✅ Quick Apply now includes resume upload, cover-letter upload, editable parsed resume fields, candidate note, and review before submitting through the existing in-memory `applyToJob` service.
- ✅ Profile now supports local edit mode for basic details, resume replacement placeholder, parsed resume headline/summary/experience/skills, preferences, and salary expectations.
- ✅ Verification: `npm run lint` and `npm run build` pass.

**Current refinement intent (May 7, 2026):**

- Align parsed resume UX with standard applicant products: extracted-field review instead of "reading the resume document."
- Standardize parsed sections to `Professional Summary`, `Skills`, and `Work Experience`.
- Add and surface `Years of Experience` in profile and parsed-review flows.

**HM/Admin routing normalization intent (May 7, 2026):**

- Convert Hiring Manager and Admin modules to shared operational paths (no `/hm/...` and no `/admin/...` prefixes) such as `/dashboard`, `/job-listings`, `/candidates`, `/interviews`, `/offers`, `/ai-screening`, `/analytics`, `/messages`, `/notifications`.
- Keep Admin-only modules as shared-root paths with admin guards: `/team-management`, `/audit-logs`, `/organization-settings`.
- Apply role-based visibility only through role guards and sidebar composition (Admin sees everything plus admin modules; Hiring Manager sees recruitment modules only).
- Keep legacy `/hm...` and `/admin...` route entries as compatibility redirects to the new paths so existing bookmarks and role-home transitions do not break.

**HM/Admin routing progress (May 7, 2026):**

- ✅ Completed 1/2: Added shared-root recruitment/admin route constants (`/dashboard`, `/job-listings`, `/candidates`, `/interviews`, `/offers`, `/ai-screening`, `/analytics`, `/messages`, `/notifications`, `/team-management`, `/audit-logs`, `/organization-settings`) and legacy home aliases in `src/constants/routes.js`.
- ✅ Completed 2/2: Updated `ROLE_HOME_PATHS` for `HIRING_MANAGER` and `ADMIN` to `/dashboard`.
- ✅ Completed 3/2: Added shared `RecruitmentLayout` with role-based sidebar composition (Admin sees all recruitment modules plus admin modules; Hiring Manager sees recruitment modules only).
- ✅ Completed 4/2: Rewired `src/routes/index.jsx` to use shared operational paths for Hiring Manager/Admin and admin-only guards for Team Management, Audit Logs, and Organization Settings.
- ✅ Completed 5/2: Updated legacy `HiringManagerLayout` and `AdminLayout` nav targets to the new shared route scheme for consistency.
- ✅ Completed 6/2: Verification complete after routing migration (`npm run lint`, `npm run build`).

**Completed refinement May 7, 2026:**

- ✅ Reworked parsed resume data shape to extracted fields in `src/utils/applicant.js`: `yearsOfExperience`, `professionalSummary`, `skills`, and `workExperience`.
- ✅ Updated quick-apply parsed review to standard sections and clearer summary cards (years of experience, professional summary, skills chips, work experience).
- ✅ Updated profile to include `Years of Experience` directly in editable basic details and in parsed resume snapshot/edit state.
- ✅ Verification: `npm run lint` and `npm run build` pass.

| #   | Screen                    | Path                          | Notes                                                                                                                                                                    |
| --- | ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A1  | Find Jobs / Job Discovery | `/applicant/jobs`             | Indeed-style feed: left job list, right preview, search/location filters, quick apply, save job, match %, salary, remote badges, application status.                     |
| A2  | Job Detail                | `/applicant/jobs/:id`         | Content-rich job page with overview, responsibilities, requirements, benefits, company/team, hiring process, estimated response time, AI fit score, sticky Apply button. |
| A3  | My Applications           | `/applicant/applications`     | Active / archived / rejected / offers tabs with current stage, last update, next step, and package-tracking feel.                                                        |
| A4  | Application Detail        | `/applicant/applications/:id` | Transparent timeline from `ApplicationStageUpdate[]`, reviewer/ETA messaging, interview slot info, notification context, rejection reason if any.                        |
| A5  | Messages                  | `/applicant/messages`         | Simple recruiter-message style inbox from mocked notifications; current + next stage visible.                                                                            |
| A6  | Interviews                | `/applicant/interviews`       | Minimal calendar-style list: upcoming interviews, join links, reschedule placeholder, preparation notes.                                                                 |
| A7  | Profile                   | `/applicant/profile`          | LinkedIn-lite profile: resume, experience summary, skills, preferences, salary expectations.                                                                             |

### 5.3 Hiring Manager

| #   | Screen                     | Path                                | Notes                                                                                                                                                                                                                                                                                                                          |
| --- | -------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H1  | HM Dashboard               | `/hm`                               | Counts of applicants per stage, listings I own with status, pending scoresheets nudge.                                                                                                                                                                                                                                         |
| H2  | My Job Listings            | `/hm/jobs`                          | Table of listings with `JobListingStatus` badge + status transition controls (DRAFT→OPEN, OPEN↔PAUSED, →CLOSED).                                                                                                                                                                                                               |
| H3  | Create / Edit Job Listing  | `/hm/jobs/new`, `/hm/jobs/:id/edit` | ✅ **COMPLETED May 9, 2026** — Form connected to real `/api/v1/jobs` API with fields: title, type, location, summary, responsibilities, requiredQualifications, preferredQualifications (all with RichTextEditor), skills (search/create flow), autoRejectThreshold, autoPassThreshold, status. Save as DRAFT or publish OPEN. |
| H4  | Screening Queue            | `/hm/jobs/:id/screening`            | Applicant cards with match %, matched/unmatched skills, summary note (HM-only), Approve / Reject. Reject → `RejectionReasonModal`.                                                                                                                                                                                             |
| H5  | Applicant Detail (HM view) | `/hm/applications/:id`              | Resume preview + AI result + stage history + actions panel.                                                                                                                                                                                                                                                                    |
| H6  | Schedule Interview         | `/hm/applications/:id/schedule`     | Date/time, duration, **Meet link required** (URL-validated).                                                                                                                                                                                                                                                                   |
| H7  | Interview List             | `/hm/interviews`                    | Upcoming + completed interviews. Completed without scoresheet flagged.                                                                                                                                                                                                                                                         |
| H8  | Scoresheet Form            | `/hm/interviews/:id/scoresheet`     | 5 criteria (1–5) + auto-computed overall + Overall Recommendation + Decision (PASS/REJECT). REJECT enforces `rejectionReason`. Cannot submit until valid; locks app advancement until `reviewSubmittedAt` set.                                                                                                                 |
| H9  | Send Offer                 | `/hm/applications/:id/offer`        | Confirms transition INTERVIEW_SCHEDULED → OFFER_SENT (after PASS). Mock offer details form.                                                                                                                                                                                                                                    |

### 5.4 Admin

| #   | Screen           | Path                  | Notes                                                                                   |
| --- | ---------------- | --------------------- | --------------------------------------------------------------------------------------- |
| AD1 | Admin Dashboard  | `/admin`              | Active listing count, pipeline funnel, time-to-hire (mocked), live update via interval. |
| AD2 | All Job Listings | `/admin/jobs`         | Every listing across HMs. Status filter, manual transition OPEN/PAUSED/CLOSED.          |
| AD3 | Pipeline Funnel  | `/admin/funnel`       | Volume per stage with conversion rates.                                                 |
| AD4 | Time-to-Hire     | `/admin/time-to-hire` | Per-role and date-range filter (mock metrics).                                          |
| AD5 | Audit Log        | `/admin/audit`        | All `ApplicationStageUpdate` rows with reasons. Filter by actor / stage / date.         |
| AD6 | Settings         | `/admin/settings`     | Edit `autoPassThreshold` / `autoRejectThreshold` per company.                           |

### 5.6 Auth Flows (S2 / S3 / S4 — detailed)

All three screens render inside `Auth.jsx`, a split layout: **left** = `AuthLeftSide` (branded panel with gradient + tagline + value props — reusable), **right** = the white form area driven by the active route. `Auth.jsx` is mounted as a React Router layout, so the right side swaps automatically with the URL.

**Sign In (`/sign-in`)**

- Fields: `email`, `password`. Password is dummy — any non-empty value passes.
- Submit looks up the user by email in seed data. Found → set session via `loginAs`, redirect to role home (`ROLE_HOME_PATHS`). Not found → inline error.
- Footer links: "Forgot password?" → `/password-reset`, "New here? Sign up" → `/sign-up`.

**Sign Up (`/sign-up`)** — single route, internal step machine

1. **Role choice** — two cards: **Applicant** vs **Recruiter**. Recruiter signups create a new company and the user becomes the company's super admin (role `ADMIN`).
2. **Form** —
    - Applicant: name, email, password, location, comma-separated skills.
    - Recruiter: personal name, work email, password + company name, company website, company size.
3. **OTP verification** — 6-digit code. Any 6 digits accepted (dummy). On verify the service creates the user (and company, for recruiter) and starts the session.

- Back button on each step. Form data held in component state until OTP succeeds.

**Password Reset (`/password-reset`)** — single route, internal step machine

1. **Email** — enter the account email.
2. **OTP** — 6-digit code. Any 6 digits accepted (dummy).
3. **New password** — `newPassword` + `confirmNewPassword`. Must match and be ≥ 8 chars.

- On success: toast + redirect to `/sign-in`.

**Reusable pieces in `pages/auth/components/`**

- `AuthLeftSide` — the branded left panel. Imported by `Auth.jsx`; can be imported standalone if a future page needs it.
- `OtpInput` — 6-box auto-advancing OTP control. Used by Sign Up and Password Reset.
- `SignUpRoleChoice`, `ApplicantSignUpForm`, `RecruiterSignUpForm` — the per-step pieces composed by `SignUp.jsx`.

### 5.7 Cross-cutting UI Pieces (built lazily as screens need them)

- `RejectionReasonModal` — disabled Save until reason filled. Reused by H4, H8.
- `StageBadge`, `StatusBadge` — colors driven by `constants/`.
- `MatchPercentBar` — colored band based on thresholds.
- `MeetLinkField` — URL validator.
- `ScoreCriterionInput` — 1–5 selector with label and description tooltip from PRD.
- `Toast` + `useToast` — for "email sent", "stage advanced" feedback.

---

## 6. Dummy Data & Simulation

- `src/data/` ships seed arrays for users, companies, listings, applications, interview slots, AI results, notifications.
- `src/services/` reads/writes against an in-memory copy of those arrays (mutations land in Redux, not the seed file). The function signatures are written **as if they were a real API** (return Promises, throw rejections) so the swap to fetch is mechanical.
- `src/hooks/useSimulatedPipeline.js` runs a master `setInterval` (`SIM_TICK_MS`, default ~5s) that:
    - Promotes APPLIED → SCREENING after a delay.
    - Generates an `AIScreeningResult` with a realistic match %.
    - Auto-advances ≥75 to INTERVIEW_SCHEDULED, auto-rejects <40 with unmatched skills, parks 40–74 for HM.
    - Emits a `NotificationEmail` for every transition (current + next stage included).
- The interval is mounted once in the appropriate layout (or App root in dev) and dispatches Redux actions. Easy to gate behind a `SIMULATION_ENABLED` flag later.

---

## 7. Backend Migration Plan

When backend endpoints become available, migrate one domain at a time from dummy services/thunks to RTK Query.

**Preferred structure:**

```text
src/
  api/
    baseApi.js              Shared `createApi` instance with `fetchBaseQuery`, auth headers, tagTypes.
    authApi.js              Injected auth endpoints and exported hooks.
    jobsApi.js              Injected job-listing queries/mutations.
    applicationsApi.js      Injected application queries/mutations.
    interviewsApi.js        Injected interview queries/mutations.
    notificationsApi.js     Injected notification queries/mutations.
```

**Rules:**

- Use one shared `baseApi` and `baseApi.injectEndpoints(...)` for domain API files.
- Register only `baseApi.reducer` and `baseApi.middleware` in `src/store/index.js`.
- Use RTK Query `query` endpoints for reads and `mutation` endpoints for writes.
- Mutations should invalidate the smallest useful set of tags. Example: applying to a job invalidates `Applications` and possibly `Jobs`; transitioning an application invalidates `Applications`, `Notifications`, and possibly `Jobs`.
- Components should use generated hooks such as `useGetApplicationsQuery()` and `useApplyToJobMutation()` once a domain has moved to `src/api/`.
- Keep `services/` for the remaining dummy domains and pure domain helpers. Do not create new service fetch wrappers for backend endpoints unless a workflow truly spans multiple API calls.
- Avoid adding new `createAsyncThunk` code for server-backed requests. Existing thunks may remain until their domain is migrated.

**Example mutation shape:**

```js
applyToJob: builder.mutation({
	query: (body) => ({
		url: "/applications",
		method: "POST",
		body,
	}),
	invalidatesTags: ["Applications", "Jobs"],
});
```

**Example store shape after RTK Query is introduced:**

```js
export const store = configureStore({
	reducer: {
		auth: authReducer,
		ui: uiReducer,
		[baseApi.reducerPath]: baseApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(baseApi.middleware),
});
```

The migration should be mechanical: keep entity shapes stable, replace one service/thunk surface with API hooks, update screens for that domain, then remove the obsolete slice state when no component reads it anymore.

---

## 8. Build Order (one screen at a time)

We move down this list. Each step is a self-contained slice.

**Phase 0 — Foundations** ✅ **DONE**

1. ✅ `constants/` — roles, stages, jobStatus, scoresheet, screening, routes, simulation, employment, notificationTemplates (with barrel `index.js`).
2. ✅ `utils/` — `id`, `date`, `classnames`, `scoresheet` (overall score + completeness), `validators` (URL / non-empty), `async` (latency).
3. ✅ `data/` — companies, users (incl. `PRIMARY_*_ID` pointers), jobListings (across all 5 statuses), applications (blueprints expand into `SEED_APPLICATIONS`, `SEED_STAGE_UPDATES`, `SEED_INTERVIEW_SLOTS`, `SEED_AI_RESULTS`), notifications (replayed through templates).
4. ✅ `services/` — `db.js` in-memory store, plus `authService`, `jobService`, `applicationService` (forward-only state machine + duplicate guard + auto-FILLED on HIRED), `interviewService` (Meet-link validated, scoresheet gate), `screeningService` (mock AI overlap scorer), `notificationService`.
5. ✅ Redux — `authSlice` (with `restoreSession` from localStorage), `jobsSlice`, `applicationsSlice`, `interviewsSlice`, `notificationsSlice`, `uiSlice` (toasts).
6. ✅ Components — `common/` (Button, Input, Textarea, Select, Badge, Card, Modal, Spinner, EmptyState, PageHeader, ToastViewport) + `domain/` (StageBadge, StatusBadge, MatchPercentBar).
7. ✅ Layouts — `PublicLayout`, `AppLayout` (generic shell with Sidebar + Topbar) wrapped per role: `ApplicantLayout`, `HiringManagerLayout`, `AdminLayout`. `RoleGuard` enforces auth + role.
8. ✅ Routes wired with `ComingSoon` placeholders for every Phase 2–4 screen so navigation works end-to-end. Tailwind v4 set up via `@theme` (brand + accent palette, Inter font).

**Phase 1 — Auth screens** ✅ **DONE**

- ✅ Routes added — `SIGN_IN: /sign-in`, `SIGN_UP: /sign-up`, `PASSWORD_RESET: /password-reset` (replacing the old `LOGIN`/`REGISTER` constants).
- ✅ `Auth.jsx` left/right shell mounted as a React Router layout — `AuthLeftSide` left, `<Outlet />` right.
- ✅ `AuthLeftSide.jsx` — gradient (uses `--gradient-brand`), HF mark, headline + 3 highlight bullets, decorative blurred orbs. Imported by `Auth.jsx` and re-usable elsewhere.
- ✅ `pages/auth/components/AuthHeader.jsx` — eyebrow + title + subtitle, used by every auth screen.
- ✅ `pages/auth/components/OtpInput.jsx` — 6-box auto-advancing OTP with backspace, arrow keys, and paste handling.
- ✅ `SignIn.jsx` — email + password. Dummy auth: `authService.signInWithEmail` looks up by email, ignores password (any non-empty passes). Errors surfaced inline. Footer links to sign-up and password-reset. Includes seed-email hint for the prototype.
- ✅ `SignUp.jsx` — internal state machine: ROLE → FORM → OTP. Form data held in component state until OTP verifies; only then does the slice thunk create the user (and company, for recruiters).
    - `SignUpRoleChoice.jsx` — Applicant vs Recruiter cards.
    - `ApplicantSignUpForm.jsx` — name, email, password, location, comma-separated skills.
    - `RecruiterSignUpForm.jsx` — personal name/email/password + company name/website/size. The recruiter is created with role `ADMIN` and made super admin of the new company.
    - OTP step has Resend code + Edit details buttons.
- ✅ `PasswordReset.jsx` — internal state machine: EMAIL → OTP → NEW_PASSWORD. New step requires `newPassword` + `confirmNewPassword` (must match, ≥ 8 chars). Success toast + redirect to sign-in.
- ✅ Service additions in `authService` — `signInWithEmail`, `signUpApplicant`, `signUpRecruiter`, `requestOtp`, `verifyOtp`, `requestPasswordReset`, `resetPassword`. All dummy: any 6-digit OTP accepted; passwords ignored on sign-in but length-checked on reset.
- ✅ Slice additions in `authSlice` — thunks `signInWithEmail`, `signUpApplicant`, `signUpRecruiter` (each persists the session via `localStorage`).
- ✅ `RoleGuard` now redirects unauthenticated users to `/sign-in` (was `/dev/switch-role`).
- ✅ Landing CTAs updated — primary "Create an account" → `/sign-up`, secondary "Sign in" → `/sign-in`, tertiary "jump in as a seeded user" → `/dev/switch-role`.

**Phase 2 — Applicant flow** 7. A1 Browse Jobs → A2 Job Detail → A3 Applicant Dashboard → A4 Application Detail → A5 Profile → A6 Notifications.

**Phase 3 — Hiring Manager flow** 8. H2 My Job Listings → H3 Create/Edit Job → H1 HM Dashboard → H4 Screening Queue → H5 Applicant Detail → H6 Schedule Interview → H7 Interview List → H8 Scoresheet → H9 Send Offer.

**Phase 4 — Admin flow** 9. AD1 Admin Dashboard → AD2 All Job Listings → AD3 Pipeline Funnel → AD4 Time-to-Hire → AD5 Audit Log → AD6 Settings.

**Phase 5 — Polish** 10. Wire up the simulation interval end-to-end. Empty/loading/error states. Light/dark theming pass. Accessibility sweep.

---

## 9. Definition of Done (per screen)

A screen is considered done when:

- All strings come from `constants/`.
- All data shapes match the entity reference in §3.
- While using dummy data, all side effects go through a `services/` function (no direct seed mutation in components).
- Once a domain is backend-backed, reads/writes go through `src/api/` RTK Query hooks and mutations.
- New cross-cutting UI is extracted into `common/` or `domain/` (no copy-paste).
- The route is registered in `routes/` and gated by the right role.
- Empty, loading, and error states are handled.
- No `console.log` or `TODO` left behind without a tracking note here.

---

## 10. HM/Admin Module Rollout (May 7, 2026)

Shared operational routes are used (no `/hm/...` and no `/admin/...` module paths). Admin-only modules remain guarded by role.

**Priority execution list (in order):**

1. Dashboard
2. Job Listings
3. Job Detail Dashboard
4. Candidates Table
5. Candidate Review Side Panel
6. Bulk Actions Toolbar
7. Move Stage Modal
8. AI Screening Center
9. Interview Calendar
10. Interview Feedback Workspace
11. Offers Dashboard
12. Analytics Dashboard
13. Team Management (Admin only)
14. Audit Logs + Organization Settings (Admin only)

**Progress cadence rule (requested):**

- Update this document after every two completed modules before moving to the next two.

**Current batch status:**

- [x] Batch 1: Dashboard + Job Listings
- [x] Batch 2: Job Detail Dashboard + Candidates Table
- [x] Batch 3: Candidate Review Side Panel + Bulk Actions Toolbar
- [x] Batch 4: Move Stage Modal + AI Screening Center
- [x] Batch 5: Interview Calendar + Interview Feedback Workspace
- [x] Batch 6: Offers Dashboard + Analytics Dashboard
- [x] Batch 7: Team Management + Audit Logs + Organization Settings

**Batch progress log:**

- ✅ Batch 1 complete: Dashboard and Job Listings replaced with data-driven module screens.
- ✅ Batch 2 complete: Job Detail Dashboard and Candidates Table are implemented and route-wired.
- ✅ Batch 3 complete: Candidate Review Side Panel and floating Bulk Actions Toolbar added to Candidates module.
- ✅ Batch 4 complete: Move Stage Modal and AI Screening Center implemented.
- ✅ Batch 5 complete: Interview Calendar and Interview Feedback Workspace implemented and route-wired.
- ✅ Batch 6 complete: Offers Dashboard and Analytics Dashboard implemented and route-wired.
- ✅ Batch 7 complete: Team Management, Audit Logs, and Organization Settings implemented (admin-only routes).

## 11. HM/Admin UX Follow-up (May 7, 2026)

**Intent:**

- Make Interview calendar `Day` and `Week` views functional (not agenda-only behavior).
- Add AI Screening filter by job posting for scalable triage.
- Make candidate quick actions functional: Schedule Interview, Request Feedback, Send Email.
- Update Move Stage modal to use a staff dropdown for interview assignment.
- Add shared confirmation modal component and shared toast helpers for consistent interaction patterns.
- Fix sidebar behavior (avoid unnecessary full-page scroll with short sidebar content) and add mobile-responsive sidebar navigation for `AppLayout`.

**Progress cadence for this follow-up:**

- Update this file after every two completed tasks.

**Current follow-up status:**

- [x] Pair 1: Interview Day/Week views + AI Screening job filter
- [x] Pair 2: Functional candidate actions + Move Stage staff dropdown
- [x] Pair 3: Shared ConfirmModal/toast helpers + Sidebar sticky/mobile responsiveness

**Follow-up progress log:**

- ✅ Pair 1 complete: Interview Day/Week views now filter by selected date window, and AI Screening now supports job-posting filter.
- ✅ Pair 2 complete: Candidate quick actions now trigger working flows (schedule interview, request feedback, send email) and Move Stage now uses staff dropdown assignment.
- ✅ Pair 3 complete: Shared `ConfirmModal` and shared toast helper hook added, and `AppLayout` navigation/desktop sidebar behavior improved for sticky desktop + mobile accessibility.

## 12. Next Build Continuation (May 7, 2026)

**Intent:**

- Implement operational `Create Job Listing` and `Update Job Listing` screens and wire them into the shared recruitment routes.
- Implement applicant-side `Company Reviews & Reputation` system (Glassdoor-style transparency within HireFlow), including company profile, review listing, and multi-step review submission.

**Progress cadence:**

- Update this document after every two completed tasks before moving to the next two.

**Current continuation status:**

- [x] Pair 1: Create Job Listing + Update Job Listing
- [x] Pair 2: Company Profile + Company Reviews Listing
- [x] Pair 3: Review Entry + Review Type Selection
- [x] Pair 4: Multi-step Review Submission (rating, writing, recommendation, anonymous, preview, success)
- [x] Pair 5: Applicant Company Reviews nav + Admin Review Moderation queue

**Continuation progress log:**

- ✅ Pair 1 complete: Create/Update Job Listing forms implemented and route-wired.
- ✅ Pair 2 complete: Applicant Company Profile and Company Reviews Listing pages implemented with review summary/filtering and job-detail entry point.
- ✅ Pair 3 complete: Review Entry and Review Type Selection screens implemented and route-wired.
- ✅ Pair 4 complete: Multi-step review submission flow implemented with category selection, ratings, narratives, recommendation, anonymous toggle, preview, and success state.
- ✅ Pair 5 complete: Applicant Company Reviews navigation surfaced and Admin Review Moderation queue implemented with approve/reject actions.

## 13. Root Route Redirect Update (May 8, 2026)

**Intent:**

- Replace the public landing page at `/` with an authentication-aware redirect.
- Unauthenticated visitors should go to `/sign-in`.
- Authenticated applicants should go to `/applicant/jobs`.
- Authenticated hiring managers and admins should go to `/dashboard`.

**Current status:**

- [x] Root route redirect component implemented.
- [x] `src/routes/index.jsx` route wiring updated.
- [x] Verification complete.

**Progress log:**

- ✅ Root `/` now waits for auth restore, redirects unauthenticated users to `/sign-in`, applicants to `/applicant/jobs`, and hiring managers/admins to `/dashboard`.
- ✅ Verification: `npm run lint` and `npm run build` pass.

## 14. Auth Mobile Branding Update (May 8, 2026)

**Intent:**

- Show the HireFlow logo at the top of auth screens on smaller viewports where the left brand panel is hidden.

**Current status:**

- [x] Mobile auth logo added.
- [x] Verification complete.

**Progress log:**

- ✅ Auth screens now show a compact HireFlow logo/wordmark above the form on viewports below `lg`.
- ✅ Verification: `npm run lint` and `npm run build` pass.

## 15. Central API Handler Update (May 8, 2026)

**Intent:**

- Update `src/services/api.js` into the central request helper for future module API files.
- Normalize documented HireFlow API responses: `{ success, message, data }`.
- Provide method helpers such as `apiHandler.get(...)`, `apiHandler.post(...)`, `apiHandler.patch(...)`, etc.

**Current status:**

- [x] API documentation response shape reviewed.
- [x] Central `apiHandler` implemented.
- [x] Verification complete.

**Progress log:**

- ✅ `src/services/api.js` now exports `apiHandler.get/post/put/patch/delete/request`.
- ✅ Successful API envelopes return `data` by default, with `returnEnvelope: true` available when callers need `{ success, message, data }`.
- ✅ Error responses throw `ApiError` with `message`, `status`, `data`, and the full response envelope.
- ✅ Verification: `npm run lint` and `npm run build` pass.

## 16. Login API Integration (May 8, 2026)

**Intent:**

- Connect only the sign-in flow to `POST /api/v1/auth/login` from `API_DOCUMENTATION.md` through `src/api/authApi.js`.
- Store the returned JWT for authenticated requests.
- Keep signup, OTP, password reset, role switch, and other modules on the current dummy services for now.

**Current status:**

- [x] Login mutation calls the documented API endpoint through the `src/api/` RTK Query layer.
- [x] Store registers the shared `baseApi` reducer and middleware.
- [x] Auth session persistence supports API login payloads.
- [x] Verification complete.

**Progress log:**

- ✅ Login integration was realigned to the backend migration plan: `src/api/baseApi.js` provides the shared RTK Query API instance and `src/api/authApi.js` injects the login mutation.
- ✅ `SignIn.jsx` now uses `useLoginMutation()` and stores the returned API user in the auth slice after a successful login.
- ✅ `authService` remains a dummy-service layer for non-integrated auth flows.
- ✅ Verification: `npm run lint` and `npm run build` pass.

## 18. Applicant Profile — Resume Parsing & Two-Tab Layout (May 8, 2026)

**Intent:**

- Split the Applicant Profile page into two tabs: **Profile** (basic details, preferences, salary) and **Resume** (parsed resume fields).
- Parse uploaded PDF resumes client-side without AI and pre-populate the Resume tab fields for inline editing before saving.
- Introduce a Tiptap-powered rich text editor for job experience descriptions and an editable skill tag input.

**Current status:**

- [x] PDF resume parsing implemented client-side.
- [x] Tiptap rich text editor component added to common components.
- [x] Editable skill tag input component added to common components.
- [x] Profile page refactored into Profile tab and Resume tab.
- [x] Upload/re-upload flow wired with parse spinner and error state.

**Progress log:**

- ✅ Installed `pdfjs-dist` (PDF text extraction), `@tiptap/react`, `@tiptap/pm`, and `@tiptap/starter-kit` (rich text editor).
- ✅ `src/utils/resumeParser.js` — extracts raw text from PDF using pdfjs-dist with y-position line reconstruction; detects section headers (Summary, Skills, Experience, Education) via regex; parses email, phone, and LinkedIn from full text; splits Skills section by delimiters with keyword-scan fallback; anchors job experience entries on date-range patterns and extracts company, job title, and description per entry.
- ✅ `src/components/common/RichTextEditor.jsx` — headless Tiptap editor with Bold, Italic, Bullet list, and Ordered list toolbar; syncs external `value` changes (required after resume parse populates entries).
- ✅ `src/components/common/SkillTagEditor.jsx` — tag-style input; Enter or comma adds a skill, × removes a tag, Backspace on empty removes the last tag.
- ✅ `src/pages/applicant/Profile.jsx` — header section hosts the Upload/Re-upload PDF button and tab switcher; Profile tab retains basic details, preferences, and salary with edit/save mode; Resume tab is always directly editable with Contact info, Summary, Skills (tag editor), and Job Experience (per-entry Tiptap editor with Add/Remove controls); on successful parse the resume data populates inline and the tab switches to Resume automatically.
- ✅ Both new common components exported from `src/components/common/index.js`.

## 17. Registration API Integration (May 8, 2026)

**Intent:**

- Connect sign-up registration to `POST /api/v1/auth/register` through `src/api/authApi.js`.
- Connect sign-up OTP confirmation to `POST /api/v1/auth/verify-otp` through `src/api/authApi.js`.
- Keep password reset, role switch, and non-auth modules on dummy services for now.

**Current status:**

- [x] Register mutation implemented.
- [x] Verify OTP mutation implemented.
- [x] Sign-up screen wired to API registration flow.
- [x] Verification complete.

**Progress log:**

- ✅ `authApi` now exposes `useRegisterMutation()` for `/auth/register` and `useVerifyOtpMutation()` for `/auth/verify-otp`.
- ✅ `SignUp.jsx` now calls the registration endpoint from the form step, then verifies the real OTP in the OTP step.
- ✅ Successful verification redirects to `/sign-in` so users can log in with the newly verified account.
- ✅ Verification: `npm run lint` and `npm run build` pass.

## 18. Applicant Profile — Resume Parsing & Two-Tab Layout (May 8, 2026)

**Intent:**

- Split the Applicant Profile page into two tabs: **Profile** (basic details, preferences, salary) and **Resume** (parsed resume fields).
- Parse uploaded PDF resumes client-side without AI and pre-populate the Resume tab fields for inline editing before saving.
- Introduce a Tiptap-powered rich text editor for job experience descriptions and an editable skill tag input.

**Current status:**

- [x] PDF resume parsing implemented client-side.
- [x] Tiptap rich text editor component added to common components.
- [x] Editable skill tag input component added to common components.
- [x] Profile page refactored into Profile tab and Resume tab.
- [x] Upload/re-upload flow wired with parse spinner and error state.

**Progress log:**

- ✅ Installed `pdfjs-dist` (PDF text extraction), `@tiptap/react`, `@tiptap/pm`, and `@tiptap/starter-kit` (rich text editor).
- ✅ `src/utils/resumeParser.js` — extracts raw text from PDF using pdfjs-dist with y-position line reconstruction; detects section headers (Summary, Skills, Experience, Education) via regex; parses email, phone, and LinkedIn from full text; splits Skills section by delimiters with keyword-scan fallback; anchors job experience entries on date-range patterns and extracts company, job title, and description per entry.
- ✅ `src/components/common/RichTextEditor.jsx` — headless Tiptap editor with Bold, Italic, Bullet list, and Ordered list toolbar; syncs external `value` changes (required after resume parse populates entries).
- ✅ `src/components/common/SkillTagEditor.jsx` — tag-style input; Enter or comma adds a skill, × removes a tag, Backspace on empty removes the last tag.
- ✅ `src/pages/applicant/Profile.jsx` — header section hosts the Upload/Re-upload PDF button and tab switcher; Profile tab retains basic details, preferences, and salary with edit/save mode; Resume tab is always directly editable with Contact info, Summary, Skills (tag editor), and Job Experience (per-entry Tiptap editor with Add/Remove controls); on successful parse the resume data populates inline and the tab switches to Resume automatically.
- ✅ Both new common components exported from `src/components/common/index.js`.

## 19. Sign-Up Form Adjustment for API Integration (May 9, 2026)

**Intent:**

- Update sign-up flow so recruiters authenticate first, then create company after login.
- Recruiters now sign up with just personal details (firstName, lastName, email, password, role=ADMIN).
- After OTP verification, recruiters auto-login and check for existing company using `GET /api/v1/companies/me`.
- If company exists, redirect to `/dashboard`.
- If no company, show company creation form (CompanyDetailsForm) in auth screen using bearer token for API calls.
- After company creation, redirect to `/dashboard`.

**Current status:**

- [x] RecruiterSignUpForm simplified - removed company fields.
- [x] CompanyDetailsForm component created for post-login company setup.
- [x] getMyCompany endpoint added to companiesApi.
- [x] SignUp.jsx flow updated with auto-login and company check logic.
- [x] Verification complete.

**Progress log:**

- ✅ RecruiterSignUpForm now only collects firstName, lastName, email, password, role="ADMIN".
- ✅ Created CompanyDetailsForm.jsx for collecting name, website, industry, companySize.
- ✅ Added useGetMyCompanyQuery endpoint to companiesApi.js.
- ✅ Updated SignUp.jsx to:
    - Import useLoginMutation and CompanyDetailsForm.
    - Add COMPANY step to the STEP constant.
    - Auto-login users after OTP verification.
    - Redirect applicants to /applicant/jobs.
    - For recruiters, fetch company using bearer token from login response.
    - If company exists, redirect to /dashboard.
    - If company not found (404), show CompanyDetailsForm.
    - After company creation, redirect to /dashboard.
- ✅ Verification: `npm run lint` and `npm run build` pass.
