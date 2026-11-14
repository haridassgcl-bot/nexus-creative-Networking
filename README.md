# Nexus Network Services — MVP starter

A starting implementation for a Rapido-style on-demand networking services marketplace: automatic skill-first matching, 10 km initial dispatch radius, remote and onsite service modes, engineer availability/location, customer task creation and admin operations endpoints.

## Stack
- API: Node.js, Express, TypeScript, Prisma
- Database: Supabase PostgreSQL
- Web UI: React + Vite (customer/engineer/admin role views)
- Mobile packaging: add Capacitor to `apps/web` after the web app is configured

## Run the API
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set your Supabase PostgreSQL connection string.
3. `npm install`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. Seed service categories, services, skills, user accounts and engineer profiles (the starter intentionally does not invent production accounts).
7. `npm run dev`

## Run the web UI
From `apps/web`: `npm install && npm run dev`.

## API routes
- `GET /health`
- `POST /api/jobs` — customer creates a task and triggers first dispatch
- `GET /api/jobs/:id` — job detail and events
- `GET /api/jobs/:id/matches` — admin-only candidate preview
- `PATCH /api/engineers/availability`
- `POST /api/engineers/location`
- `GET /api/engineers/offers`
- `POST /api/engineers/offers/:offerId/respond`
- `GET /api/admin/dashboard`
- `GET /api/admin/jobs`
- `POST /api/admin/jobs/:id/redispatch`
- `PATCH /api/admin/engineers/:id/verify`

## Matching logic
Eligibility is a hard filter: engineer must be verified, online, inside the current radius, and have every required skill at or above the service's minimum proficiency with that skill verified. Remaining engineers are ranked with a weighted score: skills 35%, distance 25%, availability 15%, rating 10%, experience 10%, price fit 5%. The first three ranked engineers receive a 30-second offer. Production dispatch must run a background worker to expire offers, retry the next batch, and expand the radius in controlled increments (10, 20, 30, 50 km) if nobody accepts.

## Important production work before public launch
- Replace `devAuth` header-based identity with JWT verification and role checks. Header auth is development-only and unsafe for deployment.
- Add OTP signup/login, KYC document upload and admin review, verified skill assessment and engineer agreements.
- Add atomic/locking dispatch so two engineers cannot win the same job; the sample uses a DB transaction but should be hardened with serializable isolation or an atomic conditional assignment.
- Add background queue (BullMQ/Redis or managed queue) for offer expiry, radius expansion, notifications and retries.
- Add Socket.IO or managed realtime for job status and live location; FCM for push notifications.
- Use a payment provider contractually approved for marketplace split settlements. Verify signed webhooks server-side. Do not hold customer money in an ordinary business account as an informal wallet/escrow.
- Implement service-mode validation, pricing rules, travel charges, cancellations, refunds, GST invoices, commission ledger and settlement reconciliation.
- Restrict location retention and sharing; obtain explicit engineer consent and expose live location only during active onsite assignments.
- Store secrets in environment variables; never store router passwords in plaintext. Use customer-authorized remote access, least privilege, encrypted backups and audit logs.
- Add tests, rate limits, request validation, logging, backups, monitoring and security review.

## Notes
The demo UI uses placeholder coordinates and service IDs; it is a screen scaffold, not a live booking integration. The API expects real authenticated user IDs and seeded service records. Price fields are integer INR paise? In this starter they are whole rupees; choose and enforce one money unit consistently before payment integration.
