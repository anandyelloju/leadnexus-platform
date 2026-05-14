# LeadNexus

## Overview

LeadNexus is a production-style **AI-Powered Personal Loan Lead Qualification & Orchestration Platform**. It streamlines the banking sales funnel by capturing lead behaviors, scoring them in real-time, and using AI to provide loan officers with operational "next-best-action" recommendations.

## Features

* **Behavioral Scoring:** Real-time lead scoring based on salary, loan amount, and engagement events.
* **Dynamic Lifecycle:** Automatic stage transitions (New → Discovery → Qualified → Follow-up).
* **AI Insights:** Automated lead summaries and risk observations using GPT-4o-mini.
* **Operational Workspace:** Task queue for sales agents with manual action completion.
* **Analytics Dashboard:** Visual funnel metrics and "Hot Leads" identification.

## System Architecture

* **Event-Driven Logic:** Lead actions trigger scoring and stage updates via NestJS services.
* **Rule-Based Workflows:** Deterministic banking rules handle eligibility; AI handles assistance.
* **Clean API Layer:** Standardized JSON responses with global interceptors and exception filters.

## Tech Stack

* **Frontend:** Next.js 14+, Tailwind CSS, Axios.
* **Backend:** NestJS, TypeScript.
* **Database:** PostgreSQL (via Neon), Prisma ORM.
* **AI:** OpenAI API (GPT-4o-mini).
* **Validation:** Joi (Environment), Zod/ValidationPipe (DTOs).

## Setup Instructions

1. **Clone & Install:**
```bash
npm install

```


2. **Environment Setup:**
* Create `apps/backend/.env`: `DATABASE_URL`, `OPENAI_API_KEY`, `PORT=3001`.
* Create `apps/frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.


3. **Database Migration:**
```bash
npx prisma migrate dev

```


4. **Run Development:**
```bash
npm run dev

```



## API Modules

* **Leads:** CRUD operations and journey history.
* **Scores:** Logic-based scoring engine.
* **Actions:** Management of pending sales tasks.
* **AI:** GPT-powered lead analysis and recommendations.

## AI Recommendation Flow

1. **Data Extraction:** System pulls lead profile, recent events, and scores.
2. **Prompt Engineering:** Context is sent to OpenAI with strict "Assistant-only" constraints.
3. **Output:** AI returns a concise summary, risk observations, and a recommended next step.
4. **UI Render:** Recommendation is displayed in the Lead Details workspace for the officer.

## Screenshots

*(Insert images here: Dashboard Overview, Lead Details Page, AI Recommendation Card)*

## Future Improvements

* **Authentication:** Role-Based Access Control (RBAC) for Managers vs. Agents.
* **Notifications:** Real-time SMS/Email alerts for "Hot Leads."
* **Advanced AI:** RAG (Retrieval-Augmented Generation) for internal banking policy queries.
* **Websockets:** Live dashboard updates for incoming leads.