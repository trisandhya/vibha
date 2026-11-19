# VIBHA Frontend Specification

## Project
- Project: VIBHA
- Organization: Svaarjitha
- Purpose: Ecosystem Discovery and Awareness Platform
- Phase: November MVP

## Core Philosophy
VIBHA is not a CRM, lead-generation platform, analytics platform, or customer-tracking tool.

VIBHA is:
- Awareness Platform
- Reflection Platform
- Ecosystem Discovery Tool
- Self-Assessment Tool
- Community Learning Tool

Primary Goal:

> Help participants understand their own path to prosperity through awareness of work, relationships, activities, and opportunities.

## Frontend Architecture
- GitHub Pages
- HTML
- CSS
- JavaScript
- No Backend
- No Database
- No Authentication
- No Mandatory Cloud APIs

Everything should execute within the browser session.

## Privacy Model
Mandatory:
- No Account
- No Login
- No Email Required
- No Phone Required
- No Name Required
- No Cookies Required

Data ownership:
- Participant owns all data.
- Data remains on participant device.
- Export is participant controlled.

## Data Storage
Allowed:
- localStorage
- sessionStorage

Use only for:
- Language
- Theme
- Current Session
- Temporary Progress

Avoid storing permanent profiles.

## Discovery Journey
Participant should feel they are having a conversation, not filling a survey.

Preferred questions:
- What work do you do?
- Who helps you?
- Who depends on you?
- Who do you interact with regularly?
- What would you like to improve?

## Language Requirements
Supported:
- English
- Telugu
- Hindi

Structure:

```text
lang/
    en.json
    te.json
    hi.json
```

No hardcoded text.

## Output Artifacts
Generate locally:
- assessment.json
- workflow.dot
- ecosystem.mmd
- report.md

## Visualizations
### Narrative View
Plain language summary.

### Table View
Role | Activity | Importance

### Ecosystem View
Technology:
- Graphviz
- Viz.js
- SVG

### Workflow View
Technology:
- Mermaid

### Animation View
Technology:
- SVG
- GSAP

Purpose: Reveal patterns, not provide decoration.

## Blueprint Generation
Every session generates a Blueprint.

Example:

```json
{
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "language": "en",
  "roles": [],
  "activities": [],
  "relationships": []
}
```

Participant can:
- Download
- Save
- Share
- Discard

## Comparison Mode (Future)
User may upload a previous blueprint and compare current vs previous state.

## Community Contribution
Default:
- Local Only

Optional:
- Participant explicitly shares blueprint.

Channels:
- WhatsApp
- Email
- GitHub
- File Transfer

VIBHA should never upload automatically.

## Blog Integration
GitHub Pages also acts as:
- Knowledge Base
- Research Journal
- Community Findings Portal

Sections:
- Findings
- Insights
- Demo Videos
- Templates
- Pournima Reports

## Accessibility Rule
If a student, farmer, tutor, electrician, or small business owner cannot understand a question, reword it.

Guiding Principle:

> Speak Simply. Think Deeply.

## Success Criteria
A successful session means:

> I understand my work better now.

Not:

> The graphics looked nice.

## MVP Scope Boundary
Included:
- GitHub Pages
- Multi-language
- Discovery Journey
- Blueprint JSON
- Graphviz
- Mermaid
- SVG Animations
- Download Blueprint

Excluded:
- Accounts
- Cloud Storage
- Databases
- Notifications
- Mobile App
- Marketplace
- Payment Systems
- AI Agents
- Workflow Automation

## Foundational Rule
Every feature must improve participant awareness.

If a feature does not improve awareness, defer it to MAYATA or a later phase.
