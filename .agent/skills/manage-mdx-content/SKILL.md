---
name: manage-mdx-content
description: Instructions for authoring "Work" (Case Studies) and "Insight" (Article) posts using MDX.
---

# Manage MDX Content

This skill covers the creation and management of content in the `content/` directory. The system uses MDX to render rich content for the "Project SENTINEL" portfolio.

## Directory Structure
*   **Work (Case Studies):** `content/work/*.mdx`
*   **Insights (Articles):** `content/insights/*.mdx`

## Content Types & Distinction

### 1. Work (Case Studies)
Detailed breakdowns of engineering projects.
*   **Focus:** Problem, Solution, Architecture, Outcome.
*   **Tone:** Technical, precise, authoritative.
*   **Specifics:** Must include `kpis` in frontmatter.

### 2. Insights (Articles)
Thought leadership and technical deep dives.
*   **Focus:** Methodology, Industry Trends, Tutorials.
*   **Tone:** Educational, visionary.

## Frontmatter Rules

All `.mdx` files must strictly adhere to the following Frontmatter schema (Appendix B of PRD).

### Required Fields
```yaml
---
title: "Title of the Post"
summary: "A concise 2-sentence summary for SEO and cards."
publishedAt: "YYYY-MM-DD"
author: "Author Name"
slug: "url-friendly-slug"
image: "/images/blog/cover-image.jpg"
---
```

### Case Study Specifics (`content/work/`)
Case studies require the `kpis` object to generate the metrics grid:
```yaml
---
# ... standard fields ...
client: "Client Name"
industry: "FinTech"
kpis:
  - label: "Latency Reduction"
    value: "40%"
  - label: "Uptime"
    value: "99.99%"
---
```

## Handling Sensitive Data
*   **Redacted Content:** Use the `<Redacted>` component for sensitive client names or API keys if strictly necessary in code blocks.
*   **Sanitization:** Ensure no real PII or production secrets are committed. Use generic placeholders (e.g., `api_key_*****`).
