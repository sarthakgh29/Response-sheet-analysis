# Survey Insights – Response Sheet Agent

Survey Insights is a full-stack analytics application built for **LimeSurvey CSV response sheets**. It helps teams upload survey data, automatically parse and analyze responses, review structured outputs across multiple tabs, and use AI-assisted chat for deeper interpretation.

The platform also supports **wave comparison**, allowing two response sheets from the same survey (different waves) to be uploaded and compared across core metrics, screener behavior, scale movement, categorical shifts, and fielding patterns.

## Screenshots

### Landing Page
![Landing Page](screenshots/landing-page.png)

### Single Sheet Overview
![Single Sheet Overview](screenshots/single-sheet-overview.png)

### Wave Comparison Timeline
![Wave Comparison Timeline](screenshots/comparison-timeline.png)


## Highlights

### Single-Sheet Analysis
- Upload a LimeSurvey CSV response sheet
- Parse respondent-level data and survey metadata
- Generate overview KPIs
- Review screener outcomes such as panel fail and wave fail
- Analyze fielding timelines
- Detect and summarize scale questions
- Detect and summarize categorical questions
- Identify outliers and timing anomalies
- Ask AI questions about a single response sheet

### Wave Comparison
- Upload two response sheets from the same survey but different waves
- Automatically generate a comparison record
- Compare overall respondent metrics, screener outcomes, relative fielding timelines, shared scale     questions, shared categorical questions, and outlier patterns
- Reopen saved comparisons from the Comparisons page
- Delete saved comparison records directly from the Comparisons page
- Ask AI questions about differences between the two waves


## Tech Stack

Frontend
- Vanilla JavaScript
- HTML + CSS
- Hash-based routing

Backend
- Node.js
- Express.js

Database
- PostgreSQL

AI
- Anthropic Messages API

---

## Project Structure

```text
project-root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── tabs/
├── shared/
│   └── analysis/
├── database/
│   └── migrations/
├── screenshots/
│   ├── landing-page.png
│   ├── single-sheet-overview.png
│   └── comparison-timeline.png
└── README.md
```

---

## Core Workflows

### Single-Sheet Workflow
1. Upload a LimeSurvey CSV file
2. Parse and analyze the sheet on the backend
3. Store structured outputs in PostgreSQL
4. Render the sheet detail view in the frontend
5. Explore overview, respondents, outliers, scale, categorical, timeline, and AI chat tabs

### Wave Comparison Workflow
1. Upload two response sheets from the same survey
2. Store both sheets and generate their analyses
3. Validate overlap and study compatibility
4. Build a comparison record across both waves
5. Render the comparison detail page with overview, scale, categorical, timeline, and chat views

---

## Main Views

### Upload
- Single-sheet upload
- Two-wave comparison upload

### Sheets
- List of uploaded response sheets
- Sheet detail pages for analysis review

### Comparisons
- List of saved wave comparisons
- Comparison detail pages with multi-tab comparison views
- Comparison deletion support

---

## AI Chat

### Single-Sheet Chat
Example prompts:
- What are the key findings from this survey?
- What are the main screener issues?
- Which scale questions are strongest or weakest?

### Comparison Chat
Example prompts:
- What improved most from Wave 1 to Wave 2?
- Which scale questions had the biggest positive movement?
- Which categorical shifts stand out most?
- How did fielding patterns differ between the two waves?
- Give me an executive summary of the comparison.

---

## Current Capabilities

- End-to-end single-sheet upload and analysis
- End-to-end two-wave comparison creation
- Saved comparisons list
- Comparison deletion
- Comparison detail page with overview, scale, categorical, timeline, and chat tabs
- Optional Anthropic-based AI chat integration

---

## Environment

```env
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/survey_insights
LLM_PROVIDER=anthropic
LLM_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE
ANTHROPIC_VERSION=2023-06-01
LLM_MODEL=claude-3-5-sonnet-latest
```

---

## License
This project can be released under a license of your choice depending on whether it is intended for internal use or public distribution.

---

## Author
[Sarthak Sharma](https://www.linkedin.com/in/sarthak-sharma-6b2413296/) 
